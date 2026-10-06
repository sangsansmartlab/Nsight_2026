import React from 'react';
import { Shield, Lock, X, Check, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

interface RbacGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onOpenAuth: () => void;
}

export const RbacGuardModal: React.FC<RbacGuardModalProps> = ({
  isOpen,
  onClose,
  featureName,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md clean-panel p-5 sm:p-6 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">인증 회원 전용 기능</h3>
              <p className="text-[10px] text-slate-400">SMARTLAB RBAC 권한 안내</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 leading-relaxed">
            <p className="font-semibold text-white mb-0.5">
              요청하신 <span className="text-blue-400 font-bold">[{featureName}]</span> 기능은 <span className="text-blue-300 underline font-bold">인증 회원 (Verified User)</span> 이상부터 이용하실 수 있습니다.
            </p>
            <p className="text-[11px] text-slate-300">
              간단한 회원가입 또는 원클릭 체험 로그인으로 즉시 모든 보관 및 내보내기 권한을 잠금 해제할 수 있습니다.
            </p>
          </div>

          {/* RBAC Permission Table Comparison */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 space-y-2 text-[11px]">
            <span className="font-bold text-slate-300 block">권한 체계 (Role Matrix):</span>
            
            {/* Guest */}
            <div className="flex justify-between items-center py-1 border-b border-slate-800 text-slate-400">
              <span>비회원 (Guest)</span>
              <span>실시간 검색, 3D 조작, 축 커스텀</span>
            </div>

            {/* Verified User */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800 font-semibold text-blue-300">
              <span className="flex items-center gap-1 text-white">
                <Check className="w-3.5 h-3.5 text-blue-400" />
                인증 회원 (Verified)
              </span>
              <span className="text-right text-[10px]">스냅샷 저장, 히스토리, 공유 링크, PNG/CSV 내보내기</span>
            </div>

            {/* Admin */}
            <div className="flex justify-between items-center py-1 text-amber-300/80">
              <span>관리자 (Admin)</span>
              <span>플랫폼 이용 통계 & 키 풀 모니터링</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>로그인 / 회원가입하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
          >
            계속 비회원으로 둘러보기
          </button>
        </div>
      </div>
    </div>
  );
};
