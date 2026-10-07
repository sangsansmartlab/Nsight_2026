import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Cpu,
  Activity,
  Layers,
  Key,
  Server,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { AuthUser } from './AuthModal';

interface GroqSlotStatus {
  id: number;
  envVar: string;
  isConfigured: boolean;
  maskedKey: string;
  requestCount: number;
  rateLimitCount: number;
  isCoolingDown: boolean;
  cooldownUntil: number;
}

interface GroqStatusResponse {
  totalSlots: number;
  configuredCount: number;
  slots: GroqSlotStatus[];
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  totalArticlesCount: number;
  currentQuery: string;
  onRoleChange: (newRole: 'GUEST' | 'VERIFIED' | 'ADMIN') => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  totalArticlesCount,
  currentQuery,
  onRoleChange
}) => {
  const [groqStatus, setGroqStatus] = useState<GroqStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const fetchStatus = () => {
    setIsLoadingStatus(true);
    fetch('/api/v1/groq/status')
      .then((res) => res.json())
      .then((data) => setGroqStatus(data))
      .catch((e) => console.error('Failed to fetch groq status', e))
      .finally(() => setIsLoadingStatus(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const slotsList: GroqSlotStatus[] = groqStatus?.slots || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto clean-panel p-5 sm:p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">SMARTLAB 최고 관리자 대시보드 (Admin)</h3>
              <p className="text-[10px] text-slate-400">플랫폼 모니터링, Groq 5-Key 로테이션 풀 및 시스템 헬스체크</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Real-time Platform Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" />
              현재 로드된 노드
            </span>
            <p className="text-lg font-black text-white font-mono tabular-nums">{totalArticlesCount}개</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              활성 질의어
            </span>
            <p className="text-sm font-bold text-emerald-400 truncate font-mono">‘{currentQuery}’</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" />
              Groq 키 풀 가동
            </span>
            <p className="text-lg font-black text-amber-400 font-mono tabular-nums">
              {groqStatus?.configuredCount ?? 0} / {groqStatus?.totalSlots ?? 5} 슬롯
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Server className="w-3 h-3 text-indigo-400" />
              크롤링 엔진
            </span>
            <p className="text-xs font-bold text-indigo-300">Google+Daum</p>
          </div>
        </div>

        {/* 2. Groq 5-Key Pool Rotation Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Groq 5-Key 로테이션 풀 (Failover Engine) 모니터링</span>
            </span>
            <button
              onClick={fetchStatus}
              disabled={isLoadingStatus}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {slotsList.length > 0 ? (
              slotsList.map((slot) => {
                const remainingSec = slot.isCoolingDown
                  ? Math.max(0, Math.ceil((slot.cooldownUntil - Date.now()) / 1000))
                  : 0;
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono tabular-nums"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">슬롯 #{slot.id}</span>
                      <span className="text-[10px] text-slate-500">({slot.envVar})</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          slot.isConfigured
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {slot.isConfigured ? `등록됨 (${slot.maskedKey})` : '시뮬레이션 Fallback'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>요청: {slot.requestCount}회</span>
                      <span>제한(429): {slot.rateLimitCount}회</span>
                      <span className={slot.isCoolingDown ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {slot.isCoolingDown ? `쿨다운 (${remainingSec}초)` : '가용'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-3">
                {isLoadingStatus ? '키 상태 정보를 불러오는 중...' : '슬롯 상태 정보가 없습니다.'}
              </p>
            )}
          </div>
        </div>

        {/* 3. System RBAC Role Override Switcher */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>RBAC 역할 전환 시뮬레이션 (Role Switcher):</span>
          </span>
          <p className="text-[11px] text-slate-400">
            개발 및 테스트를 위해 현재 사용자의 권한을 즉시 전환하여 비회원/인증회원/관리자별 동작을 검증할 수 있습니다.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onRoleChange('GUEST')}
              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                currentUser === null || currentUser.role === 'GUEST'
                  ? 'bg-slate-800 text-white border-white/30 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              비회원 (Guest)
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('VERIFIED')}
              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                currentUser?.role === 'VERIFIED'
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              인증 회원 (Verified)
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('ADMIN')}
              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              관리자 (Admin)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
