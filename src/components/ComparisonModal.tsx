import React from 'react';
import type { School } from '../types/school';
import { X, ArrowRightLeft, Trash2 } from 'lucide-react';

interface ComparisonModalProps {
  schools: School[];
  onRemoveSchool: (schoolCode: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onSelectSchool: (school: School) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  schools,
  onRemoveSchool,
  onClearAll,
  onClose,
  onSelectSchool,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                고등학교 비교함 ({schools.length}/4)
              </h2>
              <p className="text-xs text-slate-500">
                선택한 학교들의 핵심 정보를 한눈에 나란히 비교합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {schools.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                전체 비우기
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {schools.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-700">비교함이 비어 있습니다.</p>
              <p className="text-xs text-slate-500 mt-1">
                학교 카드나 상세 화면에서 [비교함 추가]를 눌러 최대 4개 학교를 담아보세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 font-semibold text-slate-500 bg-slate-50 w-28 shrink-0">
                      비교 항목
                    </th>
                    {schools.map((school) => (
                      <th
                        key={school.schoolCode}
                        className="p-3 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center relative"
                      >
                        <button
                          onClick={() => onRemoveSchool(school.schoolCode)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded cursor-pointer"
                          title="비교함에서 제거"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div
                          onClick={() => {
                            onClose();
                            onSelectSchool(school);
                          }}
                          className="hover:text-blue-600 cursor-pointer pt-2"
                        >
                          <div className="text-sm font-bold">{school.schoolName}</div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {school.district}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* 학교유형 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">학교유형</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {s.schoolType}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* 남녀구분 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">남녀구분</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.genderType}
                      </td>
                    ))}
                  </tr>

                  {/* 설립구분 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">설립구분</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.foundationType}
                      </td>
                    ))}
                  </tr>

                  {/* 관할 교육지원청 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">관할 지원청</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.eduOffice}
                      </td>
                    ))}
                  </tr>

                  {/* 학생 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">학생 수</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center font-bold text-slate-800">
                        {s.studentCount ? `${s.studentCount}명` : '상세정보 확인'}
                      </td>
                    ))}
                  </tr>

                  {/* 학급 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">학급 수</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.classCount ? `${s.classCount}학급` : '상세정보 확인'}
                      </td>
                    ))}
                  </tr>

                  {/* 학급당 학생 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">학급당 학생</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.studentsPerClass ? `${s.studentsPerClass}명` : '상세정보 확인'}
                      </td>
                    ))}
                  </tr>

                  {/* 주소 및 위치 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">소재지</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center text-[11px] text-slate-600">
                        {s.address || '정보 없음'}
                      </td>
                    ))}
                  </tr>

                  {/* 전화번호 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">전화번호</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.phone || '-'}
                      </td>
                    ))}
                  </tr>

                  {/* 홈페이지 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50">홈페이지</td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-l border-slate-200 text-center">
                        {s.homepage ? (
                          <a
                            href={s.homepage.startsWith('http') ? s.homepage : `http://${s.homepage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-medium"
                          >
                            방문
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>* 공시자료 기준 비교 정보입니다.</span>
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
