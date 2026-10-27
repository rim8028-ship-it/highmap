import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SchoolMap } from './map/SchoolMap';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SchoolCard } from './components/SchoolCard';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { ComparisonModal } from './components/ComparisonModal';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';
import { AboutModal } from './components/AboutModal';
import type { School, SchoolsApiResponse } from './types/school';
import {
  KeyRound,
  Map as MapIcon,
  List as ListIcon,
  AlertCircle,
  RefreshCw,
  SearchX,
  MapPinOff,
} from 'lucide-react';

export default function App() {
  // Data states
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [isKeyMissing, setIsKeyMissing] = useState(false);
  const [isOverallError, setIsOverallError] = useState(false);
  const [failedDistricts, setFailedDistricts] = useState<string[]>([]);

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('전체');
  const [selectedSchoolType, setSelectedSchoolType] = useState<string>('전체');
  const [selectedGender, setSelectedGender] = useState<string>('전체');
  const [selectedFoundation, setSelectedFoundation] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Selection & UI states
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isKeyGuideOpen, setIsKeyGuideOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Mobile View Tab: 'map' | 'list'
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Favorites (localStorage - Section 37)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('seoul_high_schools_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Comparison drawer (max 4 schools - Section 36)
  const [comparisonCodes, setComparisonCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('seoul_high_schools_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('seoul_high_schools_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Save comparison codes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('seoul_high_schools_compare', JSON.stringify(comparisonCodes));
    } catch {
      // ignore
    }
  }, [comparisonCodes]);

  // Fetch schools from /api/schools (Section 8, 10, 11)
  const fetchSchools = useCallback(async (refresh = false) => {
    setIsLoadingSchools(true);
    setIsOverallError(false);
    setIsKeyMissing(false);
    setFailedDistricts([]);

    try {
      const url = `/api/schools${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);

      if (res.status === 503) {
        const errorJson = await res.json().catch(() => ({}));
        if (errorJson.error === 'SCHOOLINFO_API_KEY_MISSING') {
          setIsKeyMissing(true);
          setAllSchools([]);
          return;
        }
      }

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
      }

      const data: SchoolsApiResponse = await res.json();
      if (data.success && Array.isArray(data.schools)) {
        setAllSchools(data.schools);
        setFailedDistricts(data.failedDistricts || []);
      } else {
        throw new Error(data.message || '학교 목록 조회 실패');
      }
    } catch (err) {
      console.error('Fetch schools error:', err);
      setIsOverallError(true);
      setAllSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null), 3500;
    });
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Filtered Schools calculation
  const filteredSchools = useMemo(() => {
    return allSchools.filter((school) => {
      // 1. District
      if (selectedDistrict !== '전체' && school.district !== selectedDistrict) {
        return false;
      }
      // 2. School Type
      if (selectedSchoolType !== '전체' && school.schoolType !== selectedSchoolType) {
        return false;
      }
      // 3. Gender Type
      if (selectedGender !== '전체' && school.genderType !== selectedGender) {
        return false;
      }
      // 4. Foundation Type
      if (selectedFoundation !== '전체' && school.foundationType !== selectedFoundation) {
        return false;
      }
      // 5. Favorites
      if (showOnlyFavorites && !favorites.includes(school.schoolCode)) {
        return false;
      }
      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = school.schoolName.toLowerCase().includes(q);
        const matchesAddress = school.address.toLowerCase().includes(q);
        const matchesDistrict = school.district.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesDistrict) {
          return false;
        }
      }
      return true;
    });
  }, [
    allSchools,
    selectedDistrict,
    selectedSchoolType,
    selectedGender,
    selectedFoundation,
    showOnlyFavorites,
    favorites,
    searchQuery,
  ]);

  // Comparison schools list
  const comparisonSchools = useMemo(() => {
    return comparisonCodes
      .map((code) => allSchools.find((s) => s.schoolCode === code))
      .filter((s): s is School => Boolean(s));
  }, [comparisonCodes, allSchools]);

  // Handlers
  const handleSelectSchool = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDetailOpen(true);

    if (!school.hasLocation) {
      setToastMessage('이 학교는 위치정보가 없어 지도에 표시되지 않습니다');
    }
  }, []);

  const handleToggleFavorite = useCallback((e: React.MouseEvent | School, schoolArg?: School) => {
    const school = schoolArg || (e as School);
    setFavorites((prev) =>
      prev.includes(school.schoolCode)
        ? prev.filter((code) => code !== school.schoolCode)
        : [...prev, school.schoolCode]
    );
  }, []);

  const handleToggleCompare = useCallback(
    (e: React.MouseEvent | School, schoolArg?: School) => {
      const school = schoolArg || (e as School);
      setComparisonCodes((prev) => {
        if (prev.includes(school.schoolCode)) {
          return prev.filter((code) => code !== school.schoolCode);
        }
        if (prev.length >= 4) {
          setToastMessage('비교함에는 최대 4개 학교까지 담을 수 있습니다.');
          return prev;
        }
        return [...prev, school.schoolCode];
      });
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setSelectedDistrict('전체');
    setSelectedSchoolType('전체');
    setSelectedGender('전체');
    setSelectedFoundation('전체');
    setSearchQuery('');
    setShowOnlyFavorites(false);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* 1. Header (Brand, search, counts, status) */}
      <Header
        totalCount={allSchools.length}
        isLoading={isLoadingSchools}
        isKeyMissing={isKeyMissing}
        isOverallError={isOverallError}
        failedDistricts={failedDistricts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRetry={() => fetchSchools(true)}
        onOpenKeyGuide={() => setIsKeyGuideOpen(true)}
        comparisonCount={comparisonCodes.length}
        onOpenComparison={() => setIsComparisonOpen(true)}
        favoritesCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* 2. Filter Bar (District, Type, Gender, Foundation) */}
      <FilterBar
        allSchools={allSchools}
        filteredCount={filteredSchools.length}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        selectedSchoolType={selectedSchoolType}
        onSchoolTypeChange={setSelectedSchoolType}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        selectedFoundation={selectedFoundation}
        onFoundationChange={setSelectedFoundation}
        onReset={handleResetFilters}
      />

      {/* 3. Toast Message Popup */}
      {toastMessage && (
        <div className="fixed bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-medium animate-in fade-in duration-150">
          <MapPinOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Mobile Tab Switcher ([지도] [목록]) */}
      <div className="flex md:hidden border-b border-slate-200 bg-white">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
            mobileTab === 'map'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>지도 화면</span>
        </button>
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
            mobileTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListIcon className="w-4 h-4" />
          <span>학교 목록 ({filteredSchools.length})</span>
        </button>
      </div>

      {/* 5. Main Body: Split View (Left 35% List, Right 65% Map) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: School List (~35%) */}
        <section
          className={`w-full md:w-[38%] lg:w-[35%] flex flex-col bg-slate-50 border-r border-slate-200 overflow-hidden ${
            mobileTab === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header */}
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              조회 결과: <strong className="text-slate-900">{filteredSchools.length}</strong>개교
            </span>
            <span className="text-[11px] text-slate-400">카드를 누르면 상세 공시정보 확인</span>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {/* Condition 1: Key Missing (Section 6.③) */}
            {isKeyMissing && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <KeyRound className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>학교알리미 인증키 설정 필요</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800">
                  학교알리미 인증키(SCHOOLINFO_API_KEY)가 설정되지 않았습니다.
                  AI Studio의 Settings &gt; Secrets(또는 배포 사이트의 환경변수)에 키를 추가하면 학교 목록이 나타납니다.
                </p>
                <button
                  onClick={() => setIsKeyGuideOpen(true)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  인증키 발급 및 설정 안내 보기
                </button>
              </div>
            )}

            {/* Condition 2: Loading State (Section 6.④) */}
            {isLoadingSchools && (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <div className="font-semibold text-sm">서울 고등학교 조회 중</div>
                <p className="text-xs text-slate-400">
                  학교알리미 Open API에서 25개 자치구 학교 공시정보를 안전하게 조회하고 있습니다…
                </p>
              </div>
            )}

            {/* Condition 3: Overall Error (Section 6.⑥) */}
            {!isLoadingSchools && isOverallError && (
              <div className="p-6 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <div className="font-bold text-sm text-rose-900">학교알리미 연결 실패</div>
                <p className="text-xs text-rose-700">
                  학교알리미 공공데이터 서버와 통신하는 도중 오류가 발생했습니다.
                </p>
                <button
                  onClick={() => fetchSchools(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* Condition 4: No Search/Filter Results (Section 6.⑦) */}
            {!isLoadingSchools &&
              !isKeyMissing &&
              !isOverallError &&
              filteredSchools.length === 0 && (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <SearchX className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700 text-sm">
                    조건에 맞는 학교가 없습니다.
                  </p>
                  <p className="text-xs text-slate-500">
                    필터를 줄이거나 초기화해 보세요.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    필터 전체 초기화
                  </button>
                </div>
              )}

            {/* Condition 5: Normal School Cards List */}
            {!isLoadingSchools &&
              filteredSchools.map((school) => (
                <SchoolCard
                  key={school.schoolCode}
                  school={school}
                  isSelected={selectedSchool?.schoolCode === school.schoolCode}
                  isFavorite={favorites.includes(school.schoolCode)}
                  isInComparison={comparisonCodes.includes(school.schoolCode)}
                  onSelect={handleSelectSchool}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
          </div>
        </section>

        {/* Right Panel: Leaflet Map (~65%) */}
        <section
          className={`w-full md:w-[62%] lg:w-[65%] h-full relative overflow-hidden ${
            mobileTab === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <SchoolMap
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            onSelectSchool={handleSelectSchool}
            selectedDistrict={selectedDistrict}
            isMapVisible={mobileTab === 'map'}
          />
        </section>
      </main>

      {/* 6. Modals */}
      {/* School Detail Modal */}
      {isDetailOpen && selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          onClose={() => setIsDetailOpen(false)}
          isFavorite={favorites.includes(selectedSchool.schoolCode)}
          isInComparison={comparisonCodes.includes(selectedSchool.schoolCode)}
          onToggleFavorite={() => handleToggleFavorite(selectedSchool)}
          onToggleCompare={() => handleToggleCompare(selectedSchool)}
        />
      )}

      {/* Comparison Modal (Section 36) */}
      {isComparisonOpen && (
        <ComparisonModal
          schools={comparisonSchools}
          onRemoveSchool={(code) =>
            setComparisonCodes((prev) => prev.filter((c) => c !== code))
          }
          onClearAll={() => setComparisonCodes([])}
          onClose={() => setIsComparisonOpen(false)}
          onSelectSchool={handleSelectSchool}
        />
      )}

      {/* API Key Guide Modal */}
      {isKeyGuideOpen && (
        <ApiKeyGuideModal onClose={() => setIsKeyGuideOpen(false)} />
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}
    </div>
  );
}
