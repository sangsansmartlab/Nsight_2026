import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
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

  // Handle Logout view if already logged in
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-sm clean-panel p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>사용자 계정 정보</span>
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2 space-y-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/30">
              {currentUser.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white text-base">{currentUser.name}</p>
              <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
              SMARTLAB 인증 회원
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              로그아웃
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

    if (activeTab === 'SIGNUP') {
      const cleanName = name.trim() || cleanEmail.split('@')[0];
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        createdAt: new Date().toISOString()
      };
      setSuccessMsg('회원가입이 완료되었습니다!');
      setTimeout(() => {
        onLogin(newUser);
        onClose();
      }, 500);
    } else {
      // Mock / LocalStorage Login
      const existingUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString()
      };
      setSuccessMsg('로그인되었습니다!');
      setTimeout(() => {
        onLogin(existingUser);
        onClose();
      }, 500);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: AuthUser = {
      id: 'demo_user',
      email: 'smartlab@sangsan.hs.kr',
      name: 'SMARTLAB 연구원',
      createdAt: new Date().toISOString()
    };
    onLogin(demoUser);
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
              {activeTab === 'LOGIN' ? '로그인' : '회원가입'}
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
                <span>이름 또는 닉네임</span>
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
              <span>이메일</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
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

        {/* Quick Demo Access */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>원클릭 체험 계정으로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
