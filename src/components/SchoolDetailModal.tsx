import React, { useEffect, useState } from 'react';
import type { School, SchoolDetailData } from '../types/school';
import {
  X,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Phone,
  MapPin,
  Star,
  ArrowRightLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  School as SchoolIcon,
} from 'lucide-react';

interface SchoolDetailModalProps {
  school: School | null;
  onClose: () => void;
  isFavorite: boolean;
  isInComparison: boolean;
  onToggleFavorite: (school: School) => void;
  onToggleCompare: (school: School) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  isFavorite,
  isInComparison,
  onToggleFavorite,
  onToggleCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'students' | 'curriculum' | 'admission' | 'career' | 'features'>('basic');
  const [detailData, setDetailData] = useState<SchoolDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Lazy load school detail via internal server API (Section 27)
  useEffect(() => {
    if (!school) {
      setDetailData(null);
      setFetchError(null);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setFetchError(null);

    fetch(`/api/schools/${encodeURIComponent(school.schoolCode)}/detail`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('API 호출에 실패했습니다.');
        }
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          if (data.success && data.detail) {
            setDetailData(data.detail);
          } else {
            setDetailData({
              schoolCode: school.schoolCode,
              schoolName: school.schoolName,
              basic: school,
              studentStatus: null,
              curriculum: null,
              admissionInfo: null,
              specialPrograms: null,
              careerStatus: null,
            });
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setFetchError(err.message || '자료를 불러오지 못했습니다');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [school]);

  if (!school) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
                {school.schoolType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                {school.district}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                {school.genderType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700">
                {school.foundationType}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {school.schoolName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              관할: {school.eduOffice} · 고유코드: {school.schoolCode}
            </p>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(school)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50'
              }`}
              title={isFavorite ? '관심학교 해제' : '관심학교 등록'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => onToggleCompare(school)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isInComparison
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="비교함에 추가"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isInComparison ? '비교함 담김' : '비교함 추가'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-200 bg-white overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5" />
            <span>기본정보</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>학생 현황</span>
          </button>
          <button
            onClick={() => setActiveTab('admission')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'admission'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>입학 정보</span>
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'curriculum'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>교육과정</span>
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'career'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>졸업 후 진로</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>학교 특색</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-medium">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>학교알리미 상세 공시정보를 조회하고 있습니다…</span>
            </div>
          )}

          {/* Fetch error indicator (Section 35: API error vs empty) */}
          {fetchError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError} (상세 공시정보를 일시적으로 불러오지 못했습니다)</span>
            </div>
          )}

          {/* TAB 1: 기본정보 (Section 28) */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>소재지 주소</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {school.address || '주소 정보 없음'}
                  </div>
                  {!school.hasLocation && (
                    <span className="inline-block mt-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      지도 좌표 정보 없음 (주소지 참고)
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>전화번호</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {school.phone || '공시자료 없음'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>관할 교육지원청</span>
                  </div>
                  <div className="font-semibold text-slate-900">{school.eduOffice}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>공식 홈페이지</span>
                  </div>
                  {school.homepage ? (
                    <a
                      href={
                        school.homepage.startsWith('http')
                          ? school.homepage
                          : `http://${school.homepage}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold underline truncate block"
                    >
                      {school.homepage}
                    </a>
                  ) : (
                    <span className="text-slate-400">공시자료 없음</span>
                  )}
                </div>
              </div>

              {/* School Category Matrix */}
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2.5 text-sm">학교 분류 체계</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">학교유형</span>
                    <strong className="text-slate-800">{school.schoolType}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">성별구분</span>
                    <strong className="text-slate-800">{school.genderType}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">설립구분</span>
                    <strong className="text-slate-800">{school.foundationType}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">소속 자치구</span>
                    <strong className="text-slate-800">{school.district}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 학생 현황 (Section 29) */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {detailData?.studentStatus ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-center">
                      <span className="text-xs text-blue-600 block">전체 학생 수</span>
                      <strong className="text-lg font-bold text-blue-950">
                        {detailData.studentStatus.totalStudents
                          ? `${detailData.studentStatus.totalStudents}명`
                          : '공시자료 없음'}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block">전체 학급 수</span>
                      <strong className="text-lg font-bold text-slate-800">
                        {detailData.studentStatus.totalClasses
                          ? `${detailData.studentStatus.totalClasses}학급`
                          : '공시자료 없음'}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block">학급당 학생 수</span>
                      <strong className="text-lg font-bold text-slate-800">
                        {detailData.studentStatus.studentsPerClassCalc
                          ? `${detailData.studentStatus.studentsPerClassCalc}명`
                          : '공시자료 없음'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        *공시자료 기준 계산값
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block">교원 수</span>
                      <strong className="text-lg font-bold text-slate-800">
                        {detailData.studentStatus.teachersCount
                          ? `${detailData.studentStatus.teachersCount}명`
                          : '공시자료 없음'}
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 text-right">
                    기준: {detailData.studentStatus.year || '최근 공시 기준'} 학교알리미 학교현황 공시자료
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">공시자료 없음</p>
                  <p className="text-xs text-slate-400 mt-1">
                    해당 학교의 학생 및 학급 세부 공시자료가 제공되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 입학 정보 (Section 30) */}
          {activeTab === 'admission' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>고교 입학 전형 요강 및 선발 방식 안내</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {school.schoolType === '일반고' &&
                    '서울특별시 교육청 후기 일반고 배정 방식(1단계 단일학교군 20%, 2단계 일반학교군 40%, 3단계 통합학교군 배정)이 적용됩니다.'}
                  {school.schoolType === '자사고' &&
                    '자율형 사립고 전형(자기주도학습 전형, 성적제한 없는 추첨 및 면접 선발 방식)을 통해 신입생을 선발합니다.'}
                  {school.schoolType === '특목고' &&
                    '특수목적고 전형(외국어고, 과학고, 예술고 등 분야별 자기주도학습 전형 및 적성검사)으로 전기 또는 후기에 선발합니다.'}
                  {school.schoolType === '특성화고' &&
                    '특성화고 특별전형(미래인재전형, 취업희망자전형) 및 일반전형으로 학과별 지원자를 선발합니다.'}
                  {school.schoolType === '영재고' &&
                    '영재교육진흥법에 따른 영재학교 입학전형(학생기록물 평가, 창의적 문제해결력 검사, 영재성 다면평가 캠프)으로 전국 단위 선발합니다.'}
                  {school.schoolType === '학력인정고' || school.schoolType === '기타' &&
                    '학교별 자체 학칙 및 선발 요강에 따라 신입생을 모집합니다.'}
                </p>

                {school.homepage && (
                  <a
                    href={school.homepage.startsWith('http') ? school.homepage : `http://${school.homepage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    학교 공식 입학안내 페이지 방문
                  </a>
                )}
              </div>

              {detailData?.admissionInfo?.fileUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-xs">
                      {detailData.admissionInfo.fileName || '입학전형 요강 첨부자료'}
                    </span>
                  </div>
                  <a
                    href={detailData.admissionInfo.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
                  >
                    입학전형 자료 보기
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-3 bg-slate-50/50 rounded-lg text-center">
                  * 최신 신입생 모집요강 및 전형 상세 일정은 학교 공시 및 교육청 고입전형 포털(하이인포)을 확인하세요.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 교육과정 (Section 31) */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>교육과정 편성 및 운영 안내</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  2022 개정 교육과정 및 고교학점제 편제에 따라 기초, 탐구, 체육·예술, 생활·교양 영역의 공통과목 및 학생 선택과목(일반선택, 융합선택, 진로선택)을 운영합니다.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">기초 영역</strong>
                    <span className="text-slate-500">국어, 수학, 영어, 한국사 필수 및 심화 선택 교과</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">탐구 영역</strong>
                    <span className="text-slate-500">통합사회/과학 및 물·화·생·지, 사회문화, 윤리 등</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-1">특색 과정</strong>
                    <span className="text-slate-500">학교별 중점 교육과정 (인공지능, 예술, 외국어 등)</span>
                  </div>
                </div>
              </div>

              {detailData?.curriculum?.fileUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-xs">
                      {detailData.curriculum.fileName || '학교교육과정 편성표 원문'}
                    </span>
                  </div>
                  <a
                    href={detailData.curriculum.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded"
                  >
                    교육과정 원문 보기
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-3 bg-slate-50/50 rounded-lg text-center">
                  * 상세 학교교육과정 운영 계획 및 학년별 교과 편제표는 학교알리미 공시 첨부자료를 확인하세요.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 졸업 후 진로 (Section 33) */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              {detailData?.careerStatus ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    {detailData.careerStatus.year || '2025학년도'} 졸업생 진로 현황
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                      <span className="text-xs text-blue-600 block">진학률</span>
                      <strong className="text-xl font-bold text-blue-950">
                        {detailData.careerStatus.collegeRate || '공시자료 없음'}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-xs text-emerald-600 block">취업률</span>
                      <strong className="text-xl font-bold text-emerald-950">
                        {detailData.careerStatus.employmentRate || '공시자료 없음'}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-xs text-slate-500 block">기타 (재수 등)</span>
                      <strong className="text-xl font-bold text-slate-800">
                        {detailData.careerStatus.otherRate || '공시자료 없음'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">공시자료 없음</p>
                  <p className="text-xs text-slate-400 mt-1">
                    해당 학교의 졸업생 진로 현황 공시자료가 아직 등록되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: 학교 특색 (Section 32) */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>교육활동 및 특색 사업</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>창의적 체험활동: 자율활동, 동아리활동, 봉사활동, 진로활동 지원</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>방과후학교 및 자율학습 지원 프로그램 운영</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>학교 도서관, 스마트 미래교실, 과학실 등 최신 교육활동 지원시설</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>출처: 학교알리미(학교정보공시) 공식 Open API</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
