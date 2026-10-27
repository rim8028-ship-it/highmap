import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllSeoulSchools, getSchoolDetail } from './server/schoolinfo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for schools list (cache for 1 hour to prevent redundant external calls while session is running)
let cachedSchoolsResponse: any = null;
let cachedSchoolsTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory cache for details
const detailCache = new Map<string, { timestamp: number; data: any }>();

// 1. GET /api/schools
app.get('/api/schools', async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY?.trim();

  // Prompt Section 6.③:
  // "서버에 SCHOOLINFO_API_KEY가 없으면 /api/schools는 HTTP 503과 함께
  // { "error": "SCHOOLINFO_API_KEY_MISSING" } 을 반환한다."
  if (!apiKey) {
    return res.status(503).json({ error: 'SCHOOLINFO_API_KEY_MISSING' });
  }

  // Check cache unless refresh=true
  const forceRefresh = req.query.refresh === 'true';
  const now = Date.now();
  if (!forceRefresh && cachedSchoolsResponse && now - cachedSchoolsTimestamp < CACHE_TTL_MS) {
    return res.json(cachedSchoolsResponse);
  }

  try {
    const result = await getAllSeoulSchools(apiKey);
    const responsePayload = {
      success: true,
      total: result.schools.length,
      districtSuccessCount: result.districtSuccessCount,
      districtFailedCount: result.districtFailedCount,
      failedDistricts: result.failedDistricts,
      schools: result.schools,
    };

    if (result.schools.length > 0) {
      cachedSchoolsResponse = responsePayload;
      cachedSchoolsTimestamp = now;
    }

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Error fetching schools from SchoolInfo:', error);
    return res.status(500).json({
      success: false,
      error: 'FETCH_FAILED',
      message: error?.message || '학교알리미 연결에 실패했습니다.',
    });
  }
});

// 2. GET /api/schools/:schoolCode/detail
app.get('/api/schools/:schoolCode/detail', async (req, res) => {
  const apiKey = process.env.SCHOOLINFO_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({ error: 'SCHOOLINFO_API_KEY_MISSING' });
  }

  const { schoolCode } = req.params;
  if (!schoolCode) {
    return res.status(400).json({ error: 'INVALID_SCHOOL_CODE' });
  }

  const now = Date.now();
  const cached = detailCache.get(schoolCode);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json({ success: true, schoolCode, detail: cached.data });
  }

  try {
    const detail = await getSchoolDetail(apiKey, schoolCode);
    detailCache.set(schoolCode, { timestamp: now, data: detail });
    return res.json({ success: true, schoolCode, detail });
  } catch (error: any) {
    console.error(`Detail error for school ${schoolCode}:`, error);
    return res.status(500).json({
      success: false,
      schoolCode,
      error: 'DETAIL_FETCH_FAILED',
      message: error?.message || '상세 공시정보를 불러오지 못했습니다.',
    });
  }
});

// Dev vs Prod Vite mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${!isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
