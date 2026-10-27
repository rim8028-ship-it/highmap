import React from 'react';
import type { School, SchoolType } from '../types/school';
import { Star, ArrowRightLeft, MapPinOff, Phone, ChevronRight } from 'lucide-react';

interface SchoolCardProps {
  school: School;
  isSelected: boolean;
  isFavorite: boolean;
  isInComparison: boolean;
  onSelect: (school: School) => void;
  onToggleFavorite: (e: React.MouseEvent, school: School) => void;
  onToggleCompare: (e: React.MouseEvent, school: School) => void;
}

const TYPE_BADGE_STYLES: Record<SchoolType, string> = {
  일반고: 'bg-blue-50 text-blue-700 border-blue-200',
  자사고: 'bg-purple-50 text-purple-700 border-purple-200',
  특목고: 'bg-orange-50 text-orange-700 border-orange-200',
  영재고: 'bg-rose-50 text-rose-700 border-rose-200',
  특성화고: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  학력인정고: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  기타: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  isSelected,
  isFavorite,
  isInComparison,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
}) => {
  const typeBadgeClass = TYPE_BADGE_STYLES[school.schoolType] || 'bg-slate-100 text-slate-700';

  return (
    <div
      onClick={() => onSelect(school)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white relative group ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
      }`}
    >
      {/* Top: Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${typeBadgeClass}`}
        >
          {school.schoolType}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {school.district}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {school.genderType}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {school.foundationType}
        </span>

        {/* Section 16 & 26: No location badge */}
        {!school.hasLocation && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <MapPinOff className="w-2.5 h-2.5" />
            위치정보 없음
          </span>
        )}
      </div>

      {/* Middle: School Name & Edu Office */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition">
            {school.schoolName}
          </h3>
          <p className="text-xs text-slate-400">{school.eduOffice}</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Favorite */}
          <button
            type="button"
            onClick={(e) => onToggleFavorite(e, school)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isFavorite
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
            }`}
            title={isFavorite ? '관심학교 해제' : '관심학교 등록'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Compare */}
          <button
            type="button"
            onClick={(e) => onToggleCompare(e, school)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isInComparison
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-slate-300 hover:text-blue-600 hover:bg-slate-100'
            }`}
            title={isInComparison ? '비교함에서 제거' : '비교함에 추가'}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom: Info / Metrics preview per Section 26 */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {school.studentCount && school.studentCount > 0 ? (
          <div className="flex items-center gap-3">
            <span>
              총 학생: <strong className="text-slate-700">{school.studentCount}명</strong>
            </span>
            {school.studentsPerClass && (
              <span>
                학급당: <strong className="text-slate-700">{school.studentsPerClass}명</strong>
              </span>
            )}
          </div>
        ) : (
          <span className="text-blue-600 font-medium text-[11px] flex items-center gap-0.5">
            상세정보 확인
            <ChevronRight className="w-3 h-3" />
          </span>
        )}

        {school.phone && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Phone className="w-2.5 h-2.5" />
            <span>{school.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};
