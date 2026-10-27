import type { School, SchoolDetailData, GenderType, FoundationType, SchoolType } from '../src/types/school.js';

export const SEOUL_DISTRICTS = [
  { name: "종로구", code: "11110" },
  { name: "중구", code: "11140" },
  { name: "용산구", code: "11170" },
  { name: "성동구", code: "11200" },
  { name: "광진구", code: "11215" },
  { name: "동대문구", code: "11230" },
  { name: "중랑구", code: "11260" },
  { name: "성북구", code: "11290" },
  { name: "강북구", code: "11305" },
  { name: "도봉구", code: "11320" },
  { name: "노원구", code: "11350" },
  { name: "은평구", code: "11380" },
  { name: "서대문구", code: "11410" },
  { name: "마포구", code: "11440" },
  { name: "양천구", code: "11470" },
  { name: "강서구", code: "11500" },
  { name: "구로구", code: "11530" },
  { name: "금천구", code: "11545" },
  { name: "영등포구", code: "11560" },
  { name: "동작구", code: "11590" },
  { name: "관악구", code: "11620" },
  { name: "서초구", code: "11650" },
  { name: "강남구", code: "11680" },
  { name: "송파구", code: "11710" },
  { name: "강동구", code: "11740" }
];

export const DISTRICT_TO_EDU_OFFICE: Record<string, string> = {
  "동대문구": "동부교육지원청",
  "중랑구": "동부교육지원청",
  "은평구": "서부교육지원청",
  "서대문구": "서부교육지원청",
  "마포구": "서부교육지원청",
  "영등포구": "남부교육지원청",
  "구로구": "남부교육지원청",
  "금천구": "남부교육지원청",
  "노원구": "북부교육지원청",
  "도봉구": "북부교육지원청",
  "종로구": "중부교육지원청",
  "중구": "중부교육지원청",
  "용산구": "중부교육지원청",
  "강동구": "강동송파교육지원청",
  "송파구": "강동송파교육지원청",
  "강서구": "강서양천교육지원청",
  "양천구": "강서양천교육지원청",
  "강남구": "강남서초교육지원청",
  "서초구": "강남서초교육지원청",
  "동작구": "동작관악교육지원청",
  "관악구": "동작관악교육지원청",
  "성동구": "성동광진교육지원청",
  "광진구": "성동광진교육지원청",
  "성북구": "성북강북교육지원청",
  "강북구": "성북강북교육지원청",
};

const BASE_API_URL = "https://www.schoolinfo.go.kr/openApi.do";

/**
 * Fetch a single district's high schools from SchoolInfo Open API
 */
async function fetchDistrictSchools(
  apiKey: string,
  district: { name: string; code: string }
): Promise<{ success: boolean; districtName: string; list: any[]; error?: string }> {
  const url = new URL(BASE_API_URL);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("apiType", "0");
  url.searchParams.set("sidoCode", "11");
  url.searchParams.set("sggCode", district.code);
  url.searchParams.set("schulKndCode", "04");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        districtName: district.name,
        list: [],
        error: `HTTP status ${res.status}`,
      };
    }

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        districtName: district.name,
        list: [],
        error: "JSON parse failed",
      };
    }

    if (data && Array.isArray(data.list)) {
      return {
        success: true,
        districtName: district.name,
        list: data.list,
      };
    }

    // In case resultCode indicates an issue or list is not an array
    const msg = data?.resultMsg || data?.RESULT?.MESSAGE || "No list field";
    return {
      success: false,
      districtName: district.name,
      list: [],
      error: msg,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      districtName: district.name,
      list: [],
      error: err?.name === "AbortError" ? "Timeout (15s)" : err?.message || "Fetch error",
    };
  }
}

/**
 * Normalize school record into clean typed School interface
 */
export function normalizeSchool(raw: Record<string, any>, districtNameFallback: string, districtCode: string): School {
  const schoolCode = String(
    raw.schulCode || raw.SCHUL_CODE || raw.SD_SCHUL_CODE || raw.schoolCode || ""
  ).trim();

  const schoolName = String(
    raw.schulNm || raw.SCHUL_NM || raw.schoolName || ""
  ).trim();

  const district = String(
    raw.sggNm || raw.SGG_NM || raw.district || districtNameFallback
  ).trim();

  const address = String(
    raw.orgRdnma ||
      raw.ORG_RDNMA ||
      raw.dtladBrkdn ||
      raw.DTLAD_BRKDN ||
      raw.orgRdna ||
      raw.address ||
      ""
  ).trim();

  const phone = String(
    raw.orgTelno || raw.ORG_TELNO || raw.userTelnoSw || raw.phone || ""
  ).trim();

  const homepage = String(
    raw.hmpgAdres || raw.HMPG_ADRES || raw.hmpgAdr || raw.homepage || ""
  ).trim();

  // Coordinates validation per prompt section 16:
  // - Number.isFinite
  // - not 0
  // - lat: 37.3 ~ 37.8
  // - lng: 126.6 ~ 127.4
  const rawLat = Number(raw.lttud ?? raw.LTTUD ?? raw.latitude);
  const rawLng = Number(raw.lgtud ?? raw.LGTUD ?? raw.longitude);

  let latitude: number | null = null;
  let longitude: number | null = null;
  let hasLocation = false;

  if (
    Number.isFinite(rawLat) &&
    Number.isFinite(rawLng) &&
    rawLat !== 0 &&
    rawLng !== 0 &&
    rawLat >= 37.3 &&
    rawLat <= 37.8 &&
    rawLng >= 126.6 &&
    rawLng <= 127.4
  ) {
    latitude = rawLat;
    longitude = rawLng;
    hasLocation = true;
  }

  // Gender type
  const rawGender = String(
    raw.coeduScNm || raw.COEDU_SC_NM || raw.sexScNm || raw.SEX_SC_NM || ""
  ).trim();

  let genderType: GenderType = "확인 필요";
  if (rawGender.includes("공학") || (rawGender.includes("남") && rawGender.includes("여"))) {
    genderType = "남녀공학";
  } else if (rawGender.includes("여자") || rawGender === "여") {
    genderType = "여학교";
  } else if (rawGender.includes("남자") || rawGender === "남") {
    genderType = "남학교";
  }

  // Foundation type
  const rawFond = String(raw.fondScNm || raw.FOND_SC_NM || "").trim();
  let foundationType: FoundationType = "기타";
  if (rawFond.includes("공립")) {
    foundationType = "공립";
  } else if (rawFond.includes("사립")) {
    foundationType = "사립";
  } else if (rawFond.includes("국립")) {
    foundationType = "국립";
  }

  // School type per section 22:
  const rawType = String(
    raw.hsGnrlBusnScNm ||
      raw.HS_GNRL_BUSNS_SC_NM ||
      raw.hsKndScNm ||
      raw.HS_KND_SC_NM ||
      raw.schulKndScNm ||
      raw.SCHUL_KND_SC_NM ||
      raw.fondType ||
      ""
  ).trim();

  let schoolType: SchoolType = "기타";
  if (rawType.includes("자율") || rawType.includes("자사고")) {
    schoolType = "자사고";
  } else if (
    rawType.includes("특수목적") ||
    rawType.includes("특목") ||
    rawType.includes("외국어") ||
    rawType.includes("과학") ||
    rawType.includes("국제") ||
    rawType.includes("예술") ||
    rawType.includes("체육") ||
    rawType.includes("마이스터")
  ) {
    schoolType = "특목고";
  } else if (rawType.includes("영재")) {
    schoolType = "영재고";
  } else if (
    rawType.includes("특성화") ||
    rawType.includes("전문계") ||
    rawType.includes("실업") ||
    rawType.includes("직업")
  ) {
    schoolType = "특성화고";
  } else if (rawType.includes("학력인정")) {
    schoolType = "학력인정고";
  } else if (rawType.includes("일반")) {
    schoolType = "일반고";
  }

  const eduOffice =
    DISTRICT_TO_EDU_OFFICE[district] ||
    String(raw.juOrgNm || raw.JU_ORG_NM || raw.atptOfcdcScNm || "서울특별시교육청").trim();

  // Basic counts if present in primary payload
  const studentCount = raw.studentCount ? Number(raw.studentCount) : null;
  const classCount = raw.classCount ? Number(raw.classCount) : null;
  const teacherCount = raw.teacherCount ? Number(raw.teacherCount) : null;
  const studentsPerClass =
    studentCount && classCount && classCount > 0
      ? Number((studentCount / classCount).toFixed(1))
      : null;

  return {
    schoolCode,
    schoolName,
    district,
    districtCode,
    address,
    latitude,
    longitude,
    hasLocation,
    phone,
    homepage,
    genderType,
    foundationType,
    schoolType,
    eduOffice,
    studentCount,
    classCount,
    teacherCount,
    studentsPerClass,
    disclosureYear: raw.fousYmd || raw.fondYmd || null,
    raw,
  };
}

/**
 * Fetch all Seoul 25 districts in batches
 */
export async function getAllSeoulSchools(apiKey: string) {
  const BATCH_SIZE = 5;
  const allResults: { success: boolean; districtName: string; list: any[]; error?: string }[] = [];

  for (let i = 0; i < SEOUL_DISTRICTS.length; i += BATCH_SIZE) {
    const batch = SEOUL_DISTRICTS.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map((district) => fetchDistrictSchools(apiKey, district))
    );

    for (let j = 0; j < settled.length; j++) {
      const res = settled[j];
      if (res.status === "fulfilled") {
        allResults.push(res.value);
      } else {
        allResults.push({
          success: false,
          districtName: batch[j].name,
          list: [],
          error: res.reason?.message || "Unknown error",
        });
      }
    }
  }

  let districtSuccessCount = 0;
  let districtFailedCount = 0;
  const failedDistricts: string[] = [];

  const schoolMap = new Map<string, School>();

  for (const res of allResults) {
    if (res.success) {
      districtSuccessCount++;
      const districtCode = SEOUL_DISTRICTS.find((d) => d.name === res.districtName)?.code || "";
      for (const item of res.list) {
        const normalized = normalizeSchool(item, res.districtName, districtCode);
        if (normalized.schoolCode) {
          if (!schoolMap.has(normalized.schoolCode)) {
            schoolMap.set(normalized.schoolCode, normalized);
          }
        }
      }
    } else {
      districtFailedCount++;
      failedDistricts.push(res.districtName);
    }
  }

  const schools = Array.from(schoolMap.values());
  const withLocation = schools.filter((s) => s.hasLocation).length;
  const withoutLocation = schools.length - withLocation;

  // Safe developer console logging (no API keys!)
  console.log("=== 학교알리미 서울 고교 조회 결과 ===");
  for (const res of allResults) {
    console.log(`${res.districtName}: ${res.list.length}개${res.success ? "" : " (실패)"}`);
  }
  console.log(`성공 지역: ${districtSuccessCount}/25`);
  console.log(`실패 지역: ${districtFailedCount}/25`);
  console.log(`전체 학교: ${schools.length}개`);
  console.log(`좌표 있는 학교: ${withLocation}개`);
  console.log(`좌표 없는 학교: ${withoutLocation}개`);
  console.log("======================================");

  return {
    schools,
    districtSuccessCount,
    districtFailedCount,
    failedDistricts,
  };
}

/**
 * Fetch detail disclosure data for a specific school
 */
export async function getSchoolDetail(
  apiKey: string,
  schoolCode: string,
  basicSchool?: School | null
): Promise<SchoolDetailData> {
  const detail: SchoolDetailData = {
    schoolCode,
    schoolName: basicSchool?.schoolName || "",
    basic: basicSchool || undefined,
    studentStatus: null,
    curriculum: null,
    admissionInfo: null,
    specialPrograms: null,
    careerStatus: null,
  };

  // Helper to query detail apiType
  const queryApi = async (apiType: string) => {
    const url = new URL(BASE_API_URL);
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("apiType", apiType);
    url.searchParams.set("schulCode", schoolCode);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json, text/plain, */*" },
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      clearTimeout(timeout);
      return null;
    }
  };

  // Try querying student status (apiType 62 or 09) and career status (apiType 72)
  try {
    const [resStatus, resCareer] = await Promise.allSettled([
      queryApi("62"),
      queryApi("72"),
    ]);

    if (resStatus.status === "fulfilled" && resStatus.value?.list?.[0]) {
      const row = resStatus.value.list[0];
      const totStudents = Number(row.col1 ?? row.stdntTot ?? row.COL1 ?? row.totStdnt ?? 0) || undefined;
      const totClasses = Number(row.col2 ?? row.clTot ?? row.COL2 ?? row.totCls ?? 0) || undefined;
      const teachers = Number(row.col3 ?? row.tcTot ?? row.COL3 ?? row.totTc ?? 0) || undefined;
      const calcPerClass =
        totStudents && totClasses && totClasses > 0
          ? Number((totStudents / totClasses).toFixed(1))
          : undefined;

      detail.studentStatus = {
        totalStudents: totStudents,
        totalClasses: totClasses,
        teachersCount: teachers,
        studentsPerClassCalc: calcPerClass,
        year: String(row.year || row.YEAR || row.stdYy || "2025/2026"),
        raw: row,
      };
    }

    if (resCareer.status === "fulfilled" && resCareer.value?.list?.[0]) {
      const row = resCareer.value.list[0];
      detail.careerStatus = {
        year: String(row.year || row.YEAR || row.stdYy || "최신 공시"),
        collegeRate: row.colRate ?? row.COL_RATE ?? row.collegeRate ?? undefined,
        employmentRate: row.empRate ?? row.EMP_RATE ?? row.employmentRate ?? undefined,
        otherRate: row.othRate ?? row.OTH_RATE ?? row.otherRate ?? undefined,
        graduates: Number(row.gradTot ?? row.GRAD_TOT ?? 0) || undefined,
        raw: row,
      };
    }
  } catch (e) {
    console.error("Detail fetch error for", schoolCode, e);
  }

  return detail;
}
