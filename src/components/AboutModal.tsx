import React from 'react';
import { Info, X, ExternalLink, School, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <School className="w-5 h-5 text-blue-600" />
            <span>서울 고교 지도 안내</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 text-xs text-slate-600 space-y-3.5 leading-relaxed">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              서울 고교 지도
            </h3>
            <p className="text-slate-500">
              지도에서 찾고, 공시정보로 비교하는 서울 고등학교 안내
            </p>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-slate-700">
            <div className="font-semibold text-blue-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>실제 공공데이터 원칙 준수</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              본 서비스는 학교알리미(학교정보공시)의 공식 Open API 실제 데이터만을 사용하며, 임의의 가상 데이터나 샘플 데이터를 생성하지 않습니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-800">공공데이터 및 오픈소스 출처 표기:</div>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  <strong>학교정보 공시자료:</strong> 한국교육학술정보원(KERIS) 학교알리미 Open API
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  <strong>배경지도:</strong>{' '}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    OpenStreetMap contributors
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  <strong>서울 25개 자치구 경계 및 교육지원청 외곽선:</strong> 통계청 센서스용 행정구역경계 2013 (단순화본),{' '}
                  <a
                    href="https://github.com/southkorea/seoul-maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    southkorea/seoul-maps (Apache License 2.0)
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
