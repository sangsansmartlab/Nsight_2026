import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  LogIn,
  Compass,
  Hash,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Target,
  Box,
  Sliders
} from 'lucide-react';
import { AuthUser } from './AuthModal';
import { CustomAxes, RankedAxisItem } from '../types';
import { NSightLogo } from './NSightLogo';
import { HierarchicalAxisSettings } from './HierarchicalAxisSettings';

export interface RankedAxisPreset {
  id: string;
  label: string;
  axes: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  colorAxis: string;
}

export const RANKED_AXIS_PRESETS: RankedAxisPreset[] = [
  {
    id: 'ai_policy',
    label: 'AI·기술 정책 (진흥성 1순위)',
    axes: [
      {
        id: 'promotion',
        name: '산업 진흥성',
        negativeLabel: '규제/통제 중심 (-1.0)',
        positiveLabel: '산업 진흥/육성 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'impact',
        name: '사회적 파급력',
        negativeLabel: '국소적 파급 (-1.0)',
        positiveLabel: '전방위 사회적 파급 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'credibility',
        name: '정보 신뢰도',
        negativeLabel: '단순 주장/의혹 (-1.0)',
        positiveLabel: '공인 통계/실증 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxis: '기사 성향 (진흥/긍정 / 중립 / 규제/우려)'
  },
  {
    id: 'economy',
    label: '경제·산업 (수익성 1순위)',
    axes: [
      {
        id: 'profitability',
        name: '수익성',
        negativeLabel: '비용 부담/손실 우려 (-1.0)',
        positiveLabel: '고수익/실적 성장 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'relevance',
        name: '연관성',
        negativeLabel: '간접/주변 이슈 (-1.0)',
        positiveLabel: '핵심 밸류체인 직결 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'future',
        name: '미래 지향성',
        negativeLabel: '단기 현안 중심 (-1.0)',
        positiveLabel: '차세대 성장 동력 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxis: '기사 성향 (긍정/호재 / 중립 / 우려/악재)'
  },
  {
    id: 'society',
    label: '사회·공공 갈등 (파급력 1순위)',
    axes: [
      {
        id: 'social_impact',
        name: '사회적 파급력',
        negativeLabel: '낮은 체감도 (-1.0)',
        positiveLabel: '국민적 핵심 쟁점 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'policy_stance',
        name: '정책 추진 대립각',
        negativeLabel: '현장 반발/우려 (-1.0)',
        positiveLabel: '정부/제도 추진 (+1.0)',
        preferredDirection: 0,
        weight: 30
      },
      {
        id: 'fact_rigor',
        name: '근거 객관성',
        negativeLabel: '일방적 성명 (-1.0)',
        positiveLabel: '공론화/실증 데이터 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxis: '기사 성향 (찬성/추진 / 중립 / 반대/우려)'
  }
];

interface LandingViewProps {
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  onSearch: (e?: React.FormEvent, queryOverride?: string) => void;
  onEnterExplorer: () => void;
  isSearching: boolean;
  searchCount: number;
  setSearchCount: (cnt: number) => void;
  customAxes: CustomAxes;
  setCustomAxes: (axes: CustomAxes) => void;
  rankedAxes: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  normalizedWeights: [number, number, number];
  onUpdateRankedAxis: (index: 0 | 1 | 2, updated: Partial<RankedAxisItem>) => void;
  onApplyWeightPreset: (w1: number, w2: number, w3: number) => void;
  onSwapRankedAxes: (indexA: 0 | 1 | 2, indexB: 0 | 1 | 2) => void;
  onApplyPresetRankedAxes: (preset: RankedAxisPreset) => void;
  preferredSentiment: 'ALL' | '긍정/지지' | '중립/건설적' | '우려/비판';
  setPreferredSentiment: (s: 'ALL' | '긍정/지지' | '중립/건설적' | '우려/비판') => void;
  interestKeywordsInput: string;
  setInterestKeywordsInput: (val: string) => void;
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
  onEnterExplorer,
  isSearching,
  searchCount,
  setSearchCount,
  customAxes,
  setCustomAxes,
  rankedAxes,
  normalizedWeights,
  onUpdateRankedAxis,
  onApplyWeightPreset,
  onSwapRankedAxes,
  onApplyPresetRankedAxes,
  preferredSentiment,
  setPreferredSentiment,
  interestKeywordsInput,
  setInterestKeywordsInput,
  enableColorAxis,
  setEnableColorAxis,
  currentUser,
  onOpenAuth,
  onOpenSnapshots,
  onOpenAdmin,
  searchFeedbackToast,
  onClearFeedbackToast
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const trendingKeywords = [
    'AI 기본법',
    '반도체 HBM',
    '국회 정책',
    '삼성전자 실적',
    '미국 기준금리',
    '의대 증원'
  ];

  const handleChipClick = (kw: string) => {
    setSearchFilter(kw);
    onSearch(undefined, kw);
  };

  // Color harmony strictly mapped to the 3 spherical coordinate nodes of the official 3D Cube Logo:
  // Node X: Electric Cyan (#38BDF8)
  // Node Y: Royal Blue (#60A5FA / #3B82F6)
  // Node Z: Neon Purple (#C084FC / #A855F7)
  const rankBadgeStyles = [
    {
      axisCode: '1순위 (X축)',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      accent: 'accent-cyan-400',
      glow: 'shadow-cyan-500/20'
    },
    {
      axisCode: '2순위 (Y축)',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      bg: 'bg-blue-500/15',
      accent: 'accent-blue-400',
      glow: 'shadow-blue-500/20'
    },
    {
      axisCode: '3순위 (Z축)',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      bg: 'bg-purple-500/15',
      accent: 'accent-purple-400',
      glow: 'shadow-purple-500/20'
    }
  ];

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-[#060813] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Ambient Radial Background Glow matching the Logo's Cyan-Indigo-Purple Luminous Aura */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_50%_at_50%_-15%,rgba(56,189,248,0.18),rgba(6,8,19,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_35%,rgba(99,102,241,0.12),transparent_70%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.1),transparent_70%)]" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-xl bg-slate-950/60">
        <div className="flex items-center gap-3">
          <NSightLogo variant="header" size="md" showSlogan={false} />
          <span className="text-xs text-slate-400 hidden md:inline border-l border-white/10 pl-3">
            상산고등학교 SMARTLAB 실시간 뉴스 3D 인텔리전스
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEnterExplorer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all text-xs font-semibold shadow-sm shadow-cyan-500/10 whitespace-nowrap cursor-pointer"
            title="현재 설정된 기준과 가중치로 3D 공간 바로 열기"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D 공간 바로보기</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all text-xs font-semibold shadow-sm whitespace-nowrap cursor-pointer"
              title="관리자 대시보드"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">관리자</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={onOpenSnapshots}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs font-semibold shadow-sm whitespace-nowrap cursor-pointer"
              title="스냅샷 및 히스토리"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">스냅샷·히스토리</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs font-semibold shadow-md whitespace-nowrap cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-gradient-to-tr from-amber-600 to-rose-600'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600'
                }`}
              >
                {currentUser.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        {searchFeedbackToast && (
          <div className="glass-cube-panel px-4 py-2.5 rounded-xl border border-amber-500/50 bg-slate-900/95 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 max-w-lg w-full">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1 leading-snug">{searchFeedbackToast}</span>
            <button onClick={onClearFeedbackToast} className="text-slate-400 hover:text-white p-1 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Hero Section: Prominent NSight Logo with 3D Transparent Cube & Slogan */}
        <div className="text-center space-y-2">
          <NSightLogo variant="hero" size="xl" showSlogan={true} className="mb-3" />
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            사용자가 지정한 <strong className="text-cyan-300 font-semibold">1순위(X) · 2순위(Y) · 3순위(Z) 좌표축</strong>과 가중치를 바탕으로
            실시간 뉴스를 정밀 분석하여 3D 공간에 입체적으로 시각화합니다.
          </p>
        </div>

        {/* Main Search Input Form with Luminous Glassmorphism Border */}
        <div className="w-full max-w-3xl space-y-3.5">
          <form
            onSubmit={(e) => onSearch(e)}
            className="relative flex items-center bg-slate-900/85 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20 transition-all p-1.5 sm:p-2"
          >
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold shrink-0 cursor-pointer ${
                isSettingsOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="1·2·3순위 축 및 가중치 설정 열기/닫기"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="hidden xs:inline">
                축 순위·가중치 ({normalizedWeights[0]}:{normalizedWeights[1]}:{normalizedWeights[2]})
              </span>
              {isSettingsOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="w-[1px] h-6 bg-slate-700/80 mx-1 sm:mx-2 shrink-0" />

            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="검색할 뉴스 키워드를 입력하세요 (예: AI 기본법, 반도체 HBM, 금리)"
              aria-label="뉴스 키워드 검색"
              className="bg-transparent text-white placeholder-slate-500 px-2 py-2 w-full focus:outline-none text-sm font-medium"
              autoFocus
            />

            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-1 shrink-0 cursor-pointer"
                title="입력 내용 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching || !searchFilter.trim()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/30 shrink-0 whitespace-nowrap cursor-pointer"
              title="3D 뉴스 분석 시작"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>수집·분석 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>실시간 3D 탐색</span>
                </>
              )}
            </button>
          </form>

          {/* Direct External News Media Portal Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400">
              ‘{(searchFilter || 'AI 기본법').trim()}’ 포털 원문 검색:
            </span>
            <a
              href={`https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodeURIComponent((searchFilter || 'AI 기본법').trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/35 text-emerald-300 font-semibold text-[11px] transition-colors"
            >
              네이버 뉴스
            </a>
            <a
              href={`https://news.google.com/search?q=${encodeURIComponent((searchFilter || 'AI 기본법').trim())}&hl=ko&gl=KR&ceid=KR%3Ako`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/35 text-blue-300 font-semibold text-[11px] transition-colors"
            >
              구글 뉴스
            </a>
            <a
              href={`https://search.daum.net/search?w=news&q=${encodeURIComponent((searchFilter || 'AI 기본법').trim())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/35 text-indigo-300 font-semibold text-[11px] transition-colors"
            >
              다음 뉴스
            </a>
          </div>

          {/* Quick Trending Keyword Discovery Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center pt-0.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              추천 검색어:
            </span>
            {trendingKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleChipClick(kw)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all text-xs font-medium whitespace-nowrap cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Hierarchical Progressive-Disclosure Settings Panel (대주제 -> 소주제 -> 설정창) */}
          {isSettingsOpen && (
            <div className="glass-cube-panel p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in duration-200">
              <HierarchicalAxisSettings
                rankedAxes={rankedAxes}
                normalizedWeights={normalizedWeights}
                onUpdateRankedAxis={onUpdateRankedAxis}
                onApplyWeightPreset={onApplyWeightPreset}
                onSwapRankedAxes={onSwapRankedAxes}
                onApplyPresetRankedAxes={onApplyPresetRankedAxes}
                preferredSentiment={preferredSentiment}
                setPreferredSentiment={setPreferredSentiment}
                interestKeywordsInput={interestKeywordsInput}
                setInterestKeywordsInput={setInterestKeywordsInput}
                searchCount={searchCount}
                setSearchCount={setSearchCount}
                enableColorAxis={enableColorAxis}
                setEnableColorAxis={setEnableColorAxis}
                customAxes={customAxes}
                setCustomAxes={setCustomAxes}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer with subtle branding */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-3.5 border-t border-white/5 text-center text-xs text-slate-400 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">상산고등학교 SMARTLAB</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">뉴스를 입체적으로, 세상을 더 깊이</span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80">
          NSight 3D Intelligence Engine
        </span>
      </footer>
    </div>
  );
};
