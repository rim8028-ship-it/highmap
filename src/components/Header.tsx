import React, { useState } from 'react';
import {
  Search,
  X,
  School,
  ArrowRightLeft,
  Star,
  Info,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  isLoading: boolean;
  isKeyMissing: boolean;
  isOverallError: boolean;
  failedDistricts: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRetry: () => void;
  onOpenKeyGuide: () => void;
  comparisonCount: number;
  onOpenComparison: () => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  isLoading,
  isKeyMissing,
  isOverallError,
  failedDistricts,
  searchQuery,
  onSearchChange,
  onRetry,
  onOpenKeyGuide,
  comparisonCount,
  onOpenComparison,
  favoritesCount,
  showOnlyFavorites,
  onToggleFavorites,
  onOpenAbout,
}) => {
  const [showFailedList, setShowFailedList] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2.5 gap-3">
          {/* Left: Brand, Title, Count & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <School className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  서울 고교 지도
                </h1>

                {/* Status Badges per Section 6 & 13 */}
                {isLoading ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 animate-pulse border border-blue-200">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    서울 고등학교 조회 중
                  </span>
                ) : isKeyMissing ? (
                  <button
                    onClick={onOpenKeyGuide}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    학교알리미 인증키 설정 필요
                  </button>
                ) : isOverallError ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    학교알리미 연결 실패
                    <button
                      onClick={onRetry}
                      className="ml-1 text-xs text-rose-800 underline hover:no-underline font-bold cursor-pointer"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : failedDistricts.length > 0 ? (
                  <div className="relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <span>서울 고등학교 {totalCount}개교 · 일부 지역 조회 실패</span>
                    <button
                      onClick={() => setShowFailedList(!showFailedList)}
                      className="p-0.5 hover:bg-amber-100 rounded cursor-pointer"
                      title="실패한 자치구 보기"
                    >
                      {showFailedList ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {showFailedList && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg p-2.5 shadow-lg text-slate-700 text-xs w-48">
                        <div className="font-semibold text-slate-800 mb-1">조회 실패 지역:</div>
                        <div className="flex flex-wrap gap-1">
                          {failedDistricts.map((d) => (
                            <span key={d} className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    서울 고등학교 {totalCount}개교
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 hidden sm:block">
                지도에서 찾고, 공시정보로 비교하는 서울 고등학교 안내
              </p>
            </div>
          </div>

          {/* Right: Search Input & Utility Buttons */}
          <div className="flex items-center gap-2 flex-1 md:flex-initial justify-end">
            {/* Search Box */}
            <div className="relative flex-1 md:w-64 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="학교명 검색 (예: 대원외고)"
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Favorites Toggle Button */}
            <button
              onClick={onToggleFavorites}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="관심학교 필터"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  showOnlyFavorites ? 'fill-white text-white' : 'text-amber-500 fill-amber-500'
                }`}
              />
              <span className="hidden sm:inline">관심학교</span>
              <span>{favoritesCount}</span>
            </button>

            {/* Compare Drawer Trigger */}
            <button
              onClick={onOpenComparison}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition cursor-pointer"
              title="학교 비교함 열기"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">비교함</span>
              <span className="bg-blue-700 px-1.5 py-0.2 rounded-full text-[11px] font-bold">
                {comparisonCount}
              </span>
            </button>

            {/* Info / About Button */}
            <button
              onClick={onOpenAbout}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="앱 및 공시데이터 정보"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
