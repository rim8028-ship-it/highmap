import React from 'react';
import { KeyRound, X, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ApiKeyGuideModalProps {
  onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <span>학교알리미 인증키 안내</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 text-xs text-slate-600 space-y-3.5 leading-relaxed">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
            학교알리미 인증키(SCHOOLINFO_API_KEY)가 설정되지 않았습니다. AI Studio의 Settings &gt; Secrets(또는 배포 사이트의 환경변수)에 키를 추가하면 학교 목록이 나타납니다.
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-800">인증키 발급 및 설정 방법:</div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>
                <a
                  href="https://www.schoolinfo.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold underline inline-flex items-center gap-1"
                >
                  학교알리미 포털(schoolinfo.go.kr) <ExternalLink className="w-3 h-3" />
                </a>
                에 접속하여 회원가입 후 [OpenAPI &gt; API 신청]에서 인증키를 무료 발급받습니다.
              </li>
              <li>
                Google AI Studio 상단의 <strong>Settings &gt; Secrets</strong>(환경변수) 메뉴를 엽니다.
              </li>
              <li>
                환경변수 이름에 <strong>SCHOOLINFO_API_KEY</strong>를 입력하고 발급받은 인증키를 등록합니다.
              </li>
              <li>
                키 등록 후 앱을 새로고침하거나 [다시 시도]를 누르면 서울 25개 자치구 고등학교 공시정보가 자동으로 표시됩니다.
              </li>
            </ol>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>지도는 키 없이도 바로 탐색 가능</span>
            </div>
            <p className="text-[11px] text-slate-500">
              본 앱의 지도는 OpenStreetMap을 사용하여 별도의 지도 API 키나 결제 등록 없이 항상 자유롭게 이용하실 수 있습니다.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
