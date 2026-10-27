import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { TILE_CONFIG } from './tileConfig';
import type { School, SchoolType } from '../types/school';
import { escapeHtml } from '../utils/escape';
import { Layers, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SchoolMapProps {
  schools: School[];
  selectedSchool: School | null;
  onSelectSchool: (school: School) => void;
  selectedDistrict: string;
  isMapVisible?: boolean;
}

const SEOUL_SW: [number, number] = [37.413, 126.734];
const SEOUL_NE: [number, number] = [37.715, 127.269];
const SEOUL_BOUNDS = L.latLngBounds(SEOUL_SW, SEOUL_NE);

// Max bounds with 0.15 deg margin
const SEOUL_MAX_BOUNDS = L.latLngBounds(
  [37.413 - 0.15, 126.734 - 0.15],
  [37.715 + 0.15, 127.269 + 0.15]
);

const SCHOOL_TYPE_COLORS: Record<SchoolType, string> = {
  일반고: '#2563eb', // Blue
  자사고: '#7c3aed', // Purple
  특목고: '#ea580c', // Orange
  영재고: '#e11d48', // Rose
  특성화고: '#059669', // Emerald
  학력인정고: '#0891b2', // Cyan
  기타: '#475569', // Slate
};

function getGenderSymbol(genderType: string): string {
  if (genderType === '남학교') return '남';
  if (genderType === '여학교') return '여';
  if (genderType === '남녀공학') return '공';
  return '·';
}

function getFoundationBadgeColor(fondType: string): string {
  if (fondType === '사립') return '#f59e0b'; // Amber
  if (fondType === '국립') return '#10b981'; // Emerald
  return '#38bdf8'; // Sky for 공립
}

function createSchoolIcon(school: School, isSelected = false): L.DivIcon {
  const color = SCHOOL_TYPE_COLORS[school.schoolType] || '#475569';
  const symbol = getGenderSymbol(school.genderType);
  const badgeColor = getFoundationBadgeColor(school.foundationType);

  const html = `
    <div class="school-pin ${isSelected ? 'selected' : ''}" style="background-color: ${color};">
      <span>${escapeHtml(symbol)}</span>
      <span class="school-pin-badge" style="background-color: ${badgeColor};" title="${escapeHtml(school.foundationType)}"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-school-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  schools,
  selectedSchool,
  onSelectSchool,
  selectedDistrict,
  isMapVisible = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const highlightedMarkerRef = useRef<L.Marker | null>(null);

  // GeoJSON layers
  const districtPolygonsMapRef = useRef<Map<string, L.Polygon>>(new Map());
  const districtLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const eduOfficeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showEduOffices, setShowEduOffices] = useState(true);
  const [boundaryLoadFailed, setBoundaryLoadFailed] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // StrictMode safety: do not double-init

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      minZoom: 9,
      maxBounds: SEOUL_MAX_BOUNDS,
      attributionControl: true,
    });

    // Create lower pane for boundaries so school markers are always on top
    const boundaryPane = map.createPane('boundaryPane');
    boundaryPane.style.zIndex = '350';

    // Tile layer setup
    let consecutiveErrors = 0;
    let loadSuccessCount = 0;

    const tileLayer = L.tileLayer(TILE_CONFIG.url, {
      attribution: TILE_CONFIG.attribution,
      maxZoom: TILE_CONFIG.maxZoom,
    });

    tileLayer.on('tileload', () => {
      loadSuccessCount++;
      consecutiveErrors = 0;
      setTileError(false);
    });

    tileLayer.on('tileerror', () => {
      consecutiveErrors++;
      if (consecutiveErrors >= 6 && loadSuccessCount === 0) {
        setTileError(true);
      }
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Cluster group setup
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 42,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
    });
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Boundary layer groups
    const districtGroup = L.layerGroup();
    districtGroup.addTo(map);
    districtLayerGroupRef.current = districtGroup;

    const eduGroup = L.layerGroup();
    eduGroup.addTo(map);
    eduOfficeLayerGroupRef.current = eduGroup;

    // Initial fitBounds to Seoul
    map.fitBounds(SEOUL_BOUNDS);
    mapRef.current = map;
    setMapReady(true);

    // Load GeoJSON Boundaries asynchronously
    loadGeoJsonBoundaries(map, districtGroup, eduGroup, boundaryPane);

    // ResizeObserver to handle layout changes & panel toggling
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      clusterGroupRef.current = null;
      markersMapRef.current.clear();
      districtPolygonsMapRef.current.clear();
      setMapReady(false);
    };
  }, []);

  // 2. Load GeoJSON boundaries (first local /data/seoul-gu.geojson, then fallback)
  const loadGeoJsonBoundaries = async (
    map: L.Map,
    districtGroup: L.LayerGroup,
    eduGroup: L.LayerGroup,
    boundaryPane: HTMLElement
  ) => {
    try {
      let geojson: any = null;
      const sources = [
        '/data/seoul-gu.geojson',
        'https://highmap.labbitory.com/data/seoul-gu.geojson',
      ];

      for (const url of sources) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (
              data &&
              data.type === 'FeatureCollection' &&
              Array.isArray(data.features) &&
              data.features.filter((f: any) => f.properties?.kind === 'district').length === 25
            ) {
              geojson = data;
              break;
            }
          }
        } catch {
          // try next source
        }
      }

      if (!geojson) {
        setBoundaryLoadFailed(true);
        return;
      }

      // Add features
      const features = geojson.features || [];

      // 1. Districts (Polygon)
      const districtFeatures = features.filter((f: any) => f.properties?.kind === 'district');
      for (const feat of districtFeatures) {
        const distName = feat.properties?.name || '';
        const polygon = L.geoJSON(feat, {
          pane: 'boundaryPane',
          style: {
            color: '#64748b',
            weight: 1.2,
            opacity: 0.65,
            fillColor: '#f1f5f9',
            fillOpacity: 0.12,
            dashArray: '3, 3',
          },
        });

        // Add small permanent label at center (interactive: false so it doesn't block marker clicks)
        polygon.eachLayer((layer: any) => {
          if (layer.getBounds) {
            const center = layer.getBounds().getCenter();
            const labelIcon = L.divIcon({
              className: 'district-label-container',
              html: `<span class="district-label">${escapeHtml(distName)}</span>`,
              iconSize: [60, 20],
              iconAnchor: [30, 10],
            });
            const labelMarker = L.marker(center, {
              icon: labelIcon,
              interactive: false,
              pane: 'boundaryPane',
            });
            districtGroup.addLayer(labelMarker);
          }
          if (distName) {
            districtPolygonsMapRef.current.set(distName, layer);
          }
        });

        districtGroup.addLayer(polygon);
      }

      // 2. EduOffices (MultiLineString)
      const eduFeatures = features.filter((f: any) => f.properties?.kind === 'eduOffice');
      for (const feat of eduFeatures) {
        const eduLine = L.geoJSON(feat, {
          pane: 'boundaryPane',
          style: {
            color: '#1d4ed8', // Bolder deep blue for edu offices
            weight: 2.8,
            opacity: 0.85,
          },
        });
        eduGroup.addLayer(eduLine);
      }
    } catch (err) {
      console.warn('Boundary layer failed to load (continuing without boundaries):', err);
      setBoundaryLoadFailed(true);
    }
  };

  // 3. Invalidate size when visibility changes
  useEffect(() => {
    if (mapRef.current && isMapVisible) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 50);
    }
  }, [isMapVisible]);

  // 4. Boundary visibility toggles
  useEffect(() => {
    if (!mapRef.current) return;
    if (districtLayerGroupRef.current) {
      if (showDistricts) {
        if (!mapRef.current.hasLayer(districtLayerGroupRef.current)) {
          mapRef.current.addLayer(districtLayerGroupRef.current);
        }
      } else {
        if (mapRef.current.hasLayer(districtLayerGroupRef.current)) {
          mapRef.current.removeLayer(districtLayerGroupRef.current);
        }
      }
    }
  }, [showDistricts]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (eduOfficeLayerGroupRef.current) {
      if (showEduOffices) {
        if (!mapRef.current.hasLayer(eduOfficeLayerGroupRef.current)) {
          mapRef.current.addLayer(eduOfficeLayerGroupRef.current);
        }
      } else {
        if (mapRef.current.hasLayer(eduOfficeLayerGroupRef.current)) {
          mapRef.current.removeLayer(eduOfficeLayerGroupRef.current);
        }
      }
    }
  }, [showEduOffices]);

  // 5. Update Markers when schools list changes (Section 24)
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();
    markersMapRef.current.clear();
    highlightedMarkerRef.current = null;

    const newMarkers: L.Marker[] = [];

    // Filter only schools with valid coordinates
    const validSchools = schools.filter(
      (s) => s.hasLocation && s.latitude !== null && s.longitude !== null
    );

    for (const school of validSchools) {
      const lat = school.latitude!;
      const lng = school.longitude!;
      const icon = createSchoolIcon(school, false);

      const marker = L.marker([lat, lng], { icon });

      // Safe popup content via DOM creation (no dangerous unsanitized innerHTML)
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 max-w-[260px] text-slate-800';

      const typeColor = SCHOOL_TYPE_COLORS[school.schoolType] || '#475569';
      popupDiv.innerHTML = `
        <div class="flex items-center gap-1.5 mb-1.5">
          <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold text-white" style="background-color: ${typeColor};">
            ${escapeHtml(school.schoolType)}
          </span>
          <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            ${escapeHtml(school.district)}
          </span>
          <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            ${escapeHtml(school.genderType)}
          </span>
          <span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            ${escapeHtml(school.foundationType)}
          </span>
        </div>
        <h4 class="font-bold text-base text-slate-900 leading-tight mb-1">${escapeHtml(school.schoolName)}</h4>
        <p class="text-xs text-slate-500 mb-2 truncate" title="${escapeHtml(school.address)}">${escapeHtml(school.address || '주소 정보 없음')}</p>
        <button id="view-school-btn-${school.schoolCode}" class="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition">
          상세정보 보기
        </button>
      `;

      // Attach button click event securely
      const btn = popupDiv.querySelector(`#view-school-btn-${school.schoolCode}`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectSchool(school);
        });
      }

      marker.bindPopup(popupDiv, {
        className: 'custom-leaflet-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        onSelectSchool(school);
      });

      newMarkers.push(marker);
      markersMapRef.current.set(school.schoolCode, marker);
    }

    clusterGroup.addLayers(newMarkers);
  }, [schools, onSelectSchool]);

  // 6. Highlight selected school & zoom to layer (Section 25)
  useEffect(() => {
    if (!selectedSchool || !mapRef.current || !clusterGroupRef.current) return;

    // Reset previous highlight
    if (highlightedMarkerRef.current) {
      const prevCode = (highlightedMarkerRef.current as any)._schoolCode;
      const prevSchool = schools.find((s) => s.schoolCode === prevCode);
      if (prevSchool) {
        highlightedMarkerRef.current.setIcon(createSchoolIcon(prevSchool, false));
        highlightedMarkerRef.current.setZIndexOffset(0);
      }
      highlightedMarkerRef.current = null;
    }

    if (!selectedSchool.hasLocation) {
      return;
    }

    const marker = markersMapRef.current.get(selectedSchool.schoolCode);
    if (!marker) return;

    (marker as any)._schoolCode = selectedSchool.schoolCode;

    clusterGroupRef.current.zoomToShowLayer(marker, () => {
      marker.setIcon(createSchoolIcon(selectedSchool, true));
      marker.setZIndexOffset(1000);
      marker.openPopup();
      highlightedMarkerRef.current = marker;
    });
  }, [selectedSchool, schools]);

  // 7. Pan/Zoom when selectedDistrict changes (Section 21)
  useEffect(() => {
    if (!mapRef.current) return;

    if (!selectedDistrict || selectedDistrict === '전체') {
      mapRef.current.fitBounds(SEOUL_BOUNDS, { animate: true });
      return;
    }

    const polygon = districtPolygonsMapRef.current.get(selectedDistrict);
    if (polygon && polygon.getBounds) {
      mapRef.current.fitBounds(polygon.getBounds(), {
        padding: [30, 30],
        maxZoom: 14,
        animate: true,
      });
    } else {
      // Fallback: fit to schools in that district
      const districtSchools = schools.filter(
        (s) => s.district === selectedDistrict && s.hasLocation && s.latitude && s.longitude
      );
      if (districtSchools.length > 0) {
        const bounds = L.latLngBounds(
          districtSchools.map((s) => [s.latitude!, s.longitude!])
        );
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
      }
    }
  }, [selectedDistrict, schools]);

  const handleRetryTile = useCallback(() => {
    tileLayerRef.current?.redraw();
    setTileError(false);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[360px] bg-slate-100 overflow-hidden flex flex-col">
      {/* 1. Map loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>지도를 준비하고 있습니다…</span>
          </div>
        </div>
      )}

      {/* 2. Tile Error Notice Bar (Section 6.②) */}
      {tileError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500/95 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>배경지도를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.</span>
          <button
            onClick={handleRetryTile}
            className="px-2.5 py-1 bg-white text-amber-900 rounded font-bold hover:bg-amber-50 text-xs transition cursor-pointer"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 3. The actual Map container */}
      <div ref={mapContainerRef} className="w-full h-full relative" />

      {/* 4. Map Overlay Controls: Legend & Boundary Toggles (bottom-left, leaving bottom-right free for OSM attribution) */}
      <div className="absolute bottom-6 left-3 z-[900] flex flex-col gap-2 max-w-[270px] pointer-events-auto">
        {/* Boundary Toggles */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg p-2 shadow-md border border-slate-200/80 text-xs flex items-center gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-700 mr-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>경계선</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDistricts(!showDistricts)}
            disabled={boundaryLoadFailed}
            className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition text-[11px] cursor-pointer ${
              showDistricts
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            } ${boundaryLoadFailed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showDistricts ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            구 경계
          </button>
          <button
            type="button"
            onClick={() => setShowEduOffices(!showEduOffices)}
            disabled={boundaryLoadFailed}
            className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition text-[11px] cursor-pointer ${
              showEduOffices
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            } ${boundaryLoadFailed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showEduOffices ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            교육지원청
          </button>
        </div>

        {/* Legend */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg p-2.5 shadow-md border border-slate-200/80 text-xs">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>마커 범례</span>
            <span className="text-[10px] text-slate-400 font-normal">색상: 유형 · 문자: 성별</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {Object.entries(SCHOOL_TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-700 truncate">{type}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>남: 남학교</span>
            <span>여: 여학교</span>
            <span>공: 남녀공학</span>
          </div>
        </div>

        {boundaryLoadFailed && (
          <div className="bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded shadow">
            구 경계 데이터를 불러오지 못했습니다.
          </div>
        )}
      </div>
    </div>
  );
};
