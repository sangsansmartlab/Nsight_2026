import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  User as UserIcon,
  LogIn,
  Compass,
  Hash,
  Palette,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Camera,
  History,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { AuthUser } from './AuthModal';
import { CustomAxes } from '../types';

interface LandingViewProps {
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  onSearch: (e?: React.FormEvent, queryOverride?: string) => void;
  isSearching: boolean;
  searchCount: number;
  setSearchCount: (cnt: number) => void;
  customAxes: CustomAxes;
  setCustomAxes: (axes: CustomAxes) => void;
  enableColorAxis: boolean;
  setEnableColorAxis: (enable: boolean) => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onOpenSnapshots: () => void;
  onOpenAdmin: () => void;
  searchFeedbackToast: string | null;
  onClearFeedbackToast: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  searchFilter,
  setSearchFilter,
  onSearch,
  isSearching,
  searchCount,
  setSearchCount,
  customAxes,
  setCustomAxes,
  enableColorAxis,
  setEnableColorAxis,
  currentUser,
  onOpenAuth,
  onOpenSnapshots,
  onOpenAdmin,
  searchFeedbackToast,
  onClearFeedbackToast
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Trending topic recommendations for quick 1-click discovery
  const trendingKeywords = [
    'AI 기본법',
    '반도체 HBM',
    '국회 정책',
    '삼성전자 실적',
    '미국 기준금리',
    '의대 정원'
  ];

  const handleChipClick = (kw: string) => {
    setSearchFilter(kw);
    onSearch(undefined, kw);
  };

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Ambient Radial Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.22),rgba(2,6,23,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom,_rgba(30,58,138,0.12),_transparent_70%)]" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-blue-500/25">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">NSight</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                SMARTLAB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              상산고등학교 실시간 뉴스 3D 인텔리전스
            </p>
          </div>
        </div>

        {/* User Login & Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Dashboard button if Admin */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all text-xs font-semibold shadow-sm"
              title="관리자 대시보드"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">관리자 대시보드</span>
            </button>
          )}

          {/* Snapshots & History Drawer button for Verified or Admin */}
          {currentUser && (
            <button
              onClick={onOpenSnapshots}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-all text-xs font-semibold shadow-sm"
              title="스냅샷 및 히스토리"
            >
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">스냅샷·히스토리</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-all text-xs font-semibold shadow-md"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                currentUser.role === 'ADMIN'
                  ? 'bg-gradient-to-tr from-amber-600 to-rose-600'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
              }`}>
                {currentUser.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 hidden xs:inline">
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인 / 회원가입</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* Anti-Hallucination Feedback Toast */}
        {searchFeedbackToast && (
          <div className="clean-panel px-4 py-2.5 rounded-xl border border-amber-500/50 bg-slate-900/95 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 max-w-lg w-full animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1 leading-snug">{searchFeedbackToast}</span>
            <button
              onClick={onClearFeedbackToast}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Title */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>실시간 뉴스 분석 & 3D 공간 시각화</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
            NSight <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">3D</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            관심 키워드를 검색하면 실제 언론사 뉴스를 실시간으로 수집하여<br className="hidden sm:inline" />
            3차원 공간 좌표와 4차원 성향 스펙트럼으로 다각도 분석합니다.
          </p>
        </div>

        {/* Main Search Input Form */}
        <div className="w-full max-w-2xl space-y-3">
          <form
            onSubmit={(e) => onSearch(e)}
            className="relative flex items-center bg-slate-900/90 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all p-1.5 sm:p-2"
          >
            {/* Quick Settings Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold shrink-0 ${
                isSettingsOpen
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="검색 및 축 세부 설정 열기"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span className="hidden xs:inline">{searchCount}개 수집</span>
              {isSettingsOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="w-[1px] h-6 bg-slate-700/80 mx-1 sm:mx-2 shrink-0" />

            {/* Input field */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="검색어를 입력하세요"
              aria-label="뉴스 키워드 검색"
              className="bg-transparent text-white placeholder-slate-500 px-2 py-2 w-full focus:outline-none text-sm font-medium"
              autoFocus
            />

            {/* Clear Button */}
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-1 shrink-0"
                title="입력 내용 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching || !searchFilter.trim()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 shrink-0"
              title="3D 뉴스 분석 시작"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">수집·분석 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">분석 시작</span>
                </>
              )}
            </button>
          </form>

          {/* Integrated Search & Axis Settings Drawer (When opened) */}
          {isSettingsOpen && (
            <div className="clean-panel p-4 rounded-2xl border border-blue-500/40 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>검색 및 3D 공간 축 사전 설정</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {enableColorAxis ? '4D (X·Y·Z·Color)' : '3D (X·Y·Z)'}
                </span>
              </div>

              {/* 1. Article Count Selection (1 ~ 100) */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                    수집 자료 개수 범위
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={searchCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setSearchCount(Math.min(100, Math.max(1, val)));
                        }
                      }}
                      className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-blue-500/40 text-center font-mono font-bold text-blue-400 text-xs focus:outline-none"
                    />
                    <span className="text-slate-400 text-xs">개 (1~100)</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  value={searchCount}
                  onChange={(e) => setSearchCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex items-center justify-between gap-1 pt-1">
                  {[10, 20, 30, 50, 100].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSearchCount(cnt)}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${
                        searchCount === cnt
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cnt}개 {cnt === 30 ? '(기본)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Custom Axes Freeform Setup (Presets Removed) */}
              <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    3D 및 4D 공간 축 직접 설정
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    자유 커스텀 입력 (-1.0 ~ +1.0)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="space-y-0.5">
                    <label className="text-rose-400 font-semibold">X축 (가로 쟁점 대립각)</label>
                    <input
                      type="text"
                      value={customAxes.x_axis}
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, x_axis: e.target.value });
                      }}
                      placeholder="예: 규제 중심 ↔ 산업 진흥"
                      className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-rose-500/30 text-white focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-emerald-400 font-semibold">Y축 (사회적 파급력)</label>
                    <input
                      type="text"
                      value={customAxes.y_axis}
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, y_axis: e.target.value });
                      }}
                      placeholder="예: 낮은 파급력 ↔ 높은 파급력"
                      className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-white focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-purple-400 font-semibold">Z축 (정보 신뢰도)</label>
                    <input
                      type="text"
                      value={customAxes.z_axis}
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, z_axis: e.target.value });
                      }}
                      placeholder="예: 의혹/주장 ↔ 공인 실증/신뢰도"
                      className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-purple-500/30 text-white focus:outline-none text-[11px]"
                    />
                  </div>
                </div>

                {/* 4D Color Axis Toggle & Input */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={enableColorAxis}
                        onChange={(e) => {
                          setEnableColorAxis(e.target.checked);
                          if (!e.target.checked) {
                            setCustomAxes({ ...customAxes, color_axis: '' });
                          } else if (!customAxes.color_axis) {
                            setCustomAxes({
                              ...customAxes,
                              color_axis: '기사 성향 (긍정 / 중립 / 비판)'
                            });
                          }
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex items-center gap-1 text-blue-400">
                        <Palette className="w-3.5 h-3.5" />
                        <span>4차원 색상(Color) 축 활성화</span>
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {enableColorAxis ? '수치별 연속 스펙트럼 적용' : '3D 단일색 모드'}
                    </span>
                  </div>

                  {enableColorAxis && (
                    <input
                      type="text"
                      value={customAxes.color_axis}
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, color_axis: e.target.value });
                      }}
                      placeholder="예: 기사 성향 (긍정 / 중립 / 비판)"
                      className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-blue-500/30 text-white focus:outline-none text-[11px]"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Trending Keyword Discovery Chips */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              추천 키워드:
            </span>
            {trendingKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleChipClick(kw)}
                className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500/40 transition-all text-xs font-medium"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-4">
          <div className="clean-panel p-3.5 rounded-2xl border border-white/5 space-y-1">
            <div className="text-blue-400 font-bold text-xs flex items-center gap-1.5">
              <span>🌐 실시간 기사 수집</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Google News RSS & Daum 정밀 DOM 크롤러를 통해 실시간 기사를 신속하게 수집합니다.
            </p>
          </div>

          <div className="clean-panel p-3.5 rounded-2xl border border-white/5 space-y-1">
            <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
              <span>📐 3D 공간 벡터화</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              대립 쟁점(X), 사회적 파급력(Y), 정보 신뢰도(Z)의 3차원 공간에 각 기사를 배치합니다.
            </p>
          </div>

          <div className="clean-panel p-3.5 rounded-2xl border border-white/5 space-y-1">
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <span>🎨 4차원 연속 색상</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              기사의 논조 및 수치 크기에 비례하여 연속 그라데이션 스펙트럼 색상을 산출합니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-3 border-t border-white/5 text-center text-xs text-slate-400 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px]">상산고등학교 SMARTLAB</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          NSight 3D News Intelligence Platform
        </span>
      </footer>
    </div>
  );
};
