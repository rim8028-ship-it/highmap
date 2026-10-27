import React from 'react';
import { RotateCcw, Filter, MapPin, Building, Users, Award } from 'lucide-react';
import type { School, SchoolType, GenderType, FoundationType } from '../types/school';

interface FilterBarProps {
  allSchools: School[];
  filteredCount: number;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedSchoolType: string;
  onSchoolTypeChange: (type: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  selectedFoundation: string;
  onFoundationChange: (fond: string) => void;
  onReset: () => void;
}

const DISTRICT_LIST = [
  '종로구', '중구', '용산구', '성동구', '광진구',
  '동대문구', '중랑구', '성북구', '강북구', '도봉구',
  '노원구', '은평구', '서대문구', '마포구', '양천구',
  '강서구', '구로구', '금천구', '영등포구', '동작구',
  '관악구', '서초구', '강남구', '송파구', '강동구',
];

const SCHOOL_TYPES: SchoolType[] = [
  '일반고',
  '자사고',
  '특목고',
  '영재고',
  '특성화고',
  '학력인정고',
  '기타',
];

const GENDER_OPTIONS: GenderType[] = ['남학교', '여학교', '남녀공학'];

const FOUNDATION_OPTIONS: FoundationType[] = ['공립', '사립', '국립', '기타'];

export const FilterBar: React.FC<FilterBarProps> = ({
  allSchools,
  filteredCount,
  selectedDistrict,
  onDistrictChange,
  selectedSchoolType,
  onSchoolTypeChange,
  selectedGender,
  onGenderChange,
  selectedFoundation,
  onFoundationChange,
  onReset,
}) => {
  // Compute district school counts dynamically from real loaded schools (Section 21: Never hardcode!)
  const districtCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of DISTRICT_LIST) {
      counts[d] = 0;
    }
    for (const s of allSchools) {
      if (counts[s.district] !== undefined) {
        counts[s.district]++;
      }
    }
    return counts;
  }, [allSchools]);

  // Compute school type counts
  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of SCHOOL_TYPES) {
      counts[t] = 0;
    }
    for (const s of allSchools) {
      if (counts[s.schoolType] !== undefined) {
        counts[s.schoolType]++;
      }
    }
    return counts;
  }, [allSchools]);

  const hasActiveFilters =
    selectedDistrict !== '전체' ||
    selectedSchoolType !== '전체' ||
    selectedGender !== '전체' ||
    selectedFoundation !== '전체';

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Row 1: Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-semibold mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">필터:</span>
          </div>

          {/* 1. District Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="전체">지역: 서울 전체 ({allSchools.length}개교)</option>
              {DISTRICT_LIST.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} ({districtCounts[dist] || 0}개교)
                </option>
              ))}
            </select>
          </div>

          {/* 2. School Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Award className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={selectedSchoolType}
              onChange={(e) => onSchoolTypeChange(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="전체">유형: 전체</option>
              {SCHOOL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type} ({typeCounts[type] || 0}개교)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Users className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={selectedGender}
              onChange={(e) => onGenderChange(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="전체">성별: 전체</option>
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Foundation Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Building className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={selectedFoundation}
              onChange={(e) => onFoundationChange(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="전체">설립: 전체</option>
              {FOUNDATION_OPTIONS.map((fond) => (
                <option key={fond} value={fond}>
                  {fond}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer text-xs font-medium ml-auto"
              title="필터 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}
        </div>

        {/* Row 2: Condition Summary & Active Tags */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-800">
              조건에 맞는 학교 <span className="text-blue-600 font-bold">{filteredCount}</span>개
            </span>

            {hasActiveFilters && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-slate-400 text-[11px]">• 적용된 조건:</span>
                {selectedDistrict !== '전체' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                    {selectedDistrict}
                    <button
                      onClick={() => onDistrictChange('전체')}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSchoolType !== '전체' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                    {selectedSchoolType}
                    <button
                      onClick={() => onSchoolTypeChange('전체')}
                      className="hover:text-indigo-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedGender !== '전체' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                    {selectedGender}
                    <button
                      onClick={() => onGenderChange('전체')}
                      className="hover:text-amber-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedFoundation !== '전체' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                    {selectedFoundation}
                    <button
                      onClick={() => onFoundationChange('전체')}
                      className="hover:text-emerald-900 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
