import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export type UserRole = 'GUEST' | 'VERIFIED' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Logout / Profile view if already logged in
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-sm clean-panel p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>사용자 계정 및 RBAC 권한</span>
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2 space-y-2">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-xl font-black text-white shadow-lg ${
              currentUser.role === 'ADMIN'
                ? 'bg-gradient-to-tr from-amber-600 to-rose-600 shadow-rose-500/30'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30'
            }`}>
              {currentUser.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-base">{currentUser.name}</p>
              <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
            </div>

            {/* RBAC Role Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
              {currentUser.role === 'ADMIN' ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  플랫폼 최고 관리자 (Admin)
                </span>
              ) : (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  인증 회원 (Verified User)
                </span>
              )}
            </div>

            {/* Role Features Checklist */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-left text-[11px] space-y-1.5 mt-2">
              <span className="font-semibold text-slate-300 block border-b border-slate-800 pb-1">
                현재 활성화된 이용 권한:
              </span>
              <div className="text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>실시간 다차원 뉴스 검색 & 3D 공간 시각화</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>3D 지도 스냅샷 저장 & 검색 히스토리 타임라인</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>고유 공유 링크 생성 및 데이터(PNG/CSV/JSON) 내보내기</span>
                </div>
                {currentUser.role === 'ADMIN' && (
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>플랫폼 관리자 대시보드 & Groq 5-Key Pool 모니터링</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Role Switching for Testing */}
          <div className="pt-1 flex gap-1.5">
            {currentUser.role !== 'ADMIN' ? (
              <button
                type="button"
                onClick={() => {
                  onLogin({ ...currentUser, role: 'ADMIN' });
                  onClose();
                }}
                className="flex-1 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
              >
                관리자(Admin) 권한 전환
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onLogin({ ...currentUser, role: 'VERIFIED' });
                  onClose();
                }}
                className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors"
              >
                인증 회원(Verified) 권한 전환
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              로그아웃 (비회원 게스트로 전환)
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    const isAdmin = cleanEmail.includes('admin') || cleanEmail.startsWith('admin@');
    const role: UserRole = isAdmin ? 'ADMIN' : 'VERIFIED';

    if (activeTab === 'SIGNUP') {
      const cleanName = name.trim() || cleanEmail.split('@')[0];
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role,
        createdAt: new Date().toISOString()
      };
      setSuccessMsg(`회원가입 완료! ${role === 'ADMIN' ? '관리자' : '인증 회원'}으로 로그인되었습니다.`);
      setTimeout(() => {
        onLogin(newUser);
        onClose();
      }, 500);
    } else {
      const existingUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role,
        createdAt: new Date().toISOString()
      };
      setSuccessMsg(`로그인 성공! ${role === 'ADMIN' ? '관리자' : '인증 회원'} 권한이 부여되었습니다.`);
      setTimeout(() => {
        onLogin(existingUser);
        onClose();
      }, 500);
    }
  };

  const handleQuickVerifiedLogin = () => {
    const user: AuthUser = {
      id: 'verified_user',
      email: 'smartlab@sangsan.hs.kr',
      name: 'SMARTLAB 연구원',
      role: 'VERIFIED',
      createdAt: new Date().toISOString()
    };
    onLogin(user);
    onClose();
  };

  const handleQuickAdminLogin = () => {
    const adminUser: AuthUser = {
      id: 'admin_user',
      email: 'admin@sangsan.hs.kr',
      name: 'SMARTLAB 총괄 관리자',
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    };
    onLogin(adminUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm clean-panel p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">
              {activeTab === 'LOGIN' ? '로그인 (인증 회원 / 관리자)' : '회원가입'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('SIGNUP');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'SIGNUP'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>회원가입</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {activeTab === 'SIGNUP' && (
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>이름 또는 연구원명</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>이메일 주소</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com (admin 포함 시 관리자)"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>비밀번호</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-98 mt-2"
          >
            {activeTab === 'LOGIN' ? '로그인하기' : '회원가입 완료'}
          </button>
        </form>

        {/* Quick RBAC Role Test Logins */}
        <div className="pt-2.5 border-t border-slate-800 space-y-1.5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">
            🚀 빠른 역할별(RBAC) 체험 로그인:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleQuickVerifiedLogin}
              className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-blue-400" />
              <span>인증 회원 체험</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>관리자 체험</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
