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

export interface RankedAxisPreset {
  id: string;
  label: string;
  axes: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  colorAxis: string;
}

export const RANKED_AXIS_PRESETS: RankedAxisPreset[] = [
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

  const rankBadgeStyles = [
    {
      axisCode: '1순위 (X축)',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      bg: 'bg-rose-500/15',
      accent: 'accent-rose-500'
    },
    {
      axisCode: '2순위 (Y축)',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      accent: 'accent-emerald-500'
    },
    {
      axisCode: '3순위 (Z축)',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      bg: 'bg-purple-500/15',
      accent: 'accent-purple-500'
    }
  ];

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Ambient Radial Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.22),rgba(2,6,23,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom,_rgba(30,58,138,0.12),_transparent_70%)]" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-blue-500/25">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">NSight 3D</span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                · 상산고등학교 SMARTLAB 실시간 뉴스 3D 인텔리전스
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEnterExplorer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/40 transition-all text-xs font-semibold shadow-sm whitespace-nowrap"
            title="현재 설정된 기준과 가중치로 3D 공간 바로 열기"
          >
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>3D 공간 바로보기</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all text-xs font-semibold shadow-sm whitespace-nowrap"
              title="관리자 대시보드"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">관리자</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={onOpenSnapshots}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-all text-xs font-semibold shadow-sm whitespace-nowrap"
              title="스냅샷 및 히스토리"
            >
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">스냅샷·히스토리</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-all text-xs font-semibold shadow-md whitespace-nowrap"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-gradient-to-tr from-amber-600 to-rose-600'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                }`}
              >
                {currentUser.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-4xl mx-auto w-full space-y-5">
        {searchFeedbackToast && (
          <div className="clean-panel px-4 py-2.5 rounded-xl border border-amber-500/50 bg-slate-900/95 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 max-w-lg w-full">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1 leading-snug">{searchFeedbackToast}</span>
            <button onClick={onClearFeedbackToast} className="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>
        )}

        {/* Hero Title */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-blue-400 tracking-wide">
            개인 맞춤형 1·2·3순위 축 가중치 & 실시간 뉴스 3D 공간 검색 엔진
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            NSight{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              3D
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            내가 중요하게 생각하는 <strong>1순위 · 2순위 · 3순위 좌표축과 가중치(%)</strong>를 직접 조절하면,
            검색 시 가장 부합하는 기사를 최상단에 띄우고 3D 좌표평면에 각 기사의 경향성을 입체적으로 시각화합니다.
          </p>
        </div>

        {/* Main Search Input Form */}
        <div className="w-full max-w-3xl space-y-3">
          <form
            onSubmit={(e) => onSearch(e)}
            className="relative flex items-center bg-slate-900/90 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/10 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all p-1.5 sm:p-2"
          >
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold shrink-0 ${
                isSettingsOpen
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="1·2·3순위 축 및 가중치 설정 열기/닫기"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
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
              placeholder="검색할 뉴스 키워드를 입력하세요 (예: AI 기본법, 반도체, 금리)"
              aria-label="뉴스 키워드 검색"
              className="bg-transparent text-white placeholder-slate-500 px-2 py-2 w-full focus:outline-none text-sm font-medium"
              autoFocus
            />

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

            <button
              type="submit"
              disabled={isSearching || !searchFilter.trim()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 shrink-0 whitespace-nowrap"
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

          {/* Integrated 1st/2nd/3rd Priority Axes, Custom Weights & Personal Tendency Settings Panel */}
          {isSettingsOpen && (
            <div className="clean-panel p-4 sm:p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    좌표축 1·2·3순위 & 개인 가중치(%) · 경향성 설정
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 mr-1">분야별 추천 순위:</span>
                  {RANKED_AXIS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onApplyPresetRankedAxes(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-200 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-medium transition-colors whitespace-nowrap"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Distribution Preset Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-semibold">
                    현재 반영 가중치 비율:
                  </span>
                  <span className="font-mono tabular-nums font-bold text-amber-300">
                    1순위 {normalizedWeights[0]}% : 2순위 {normalizedWeights[1]}% : 3순위 {normalizedWeights[2]}%
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 mr-1">빠른 가중치 배분:</span>
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset(50, 30, 20)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    기본 (50:30:20)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset(70, 20, 10)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    1순위 집중 (70:20:10)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset(34, 33, 33)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    균등 (34:33:33)
                  </button>
                </div>
              </div>

              {/* Section A: 1st / 2nd / 3rd Priority Axes Editor with Weight Sliders & Up/Down Rank Swap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {rankedAxes.map((axisItem, idx) => {
                  const rankIdx = idx as 0 | 1 | 2;
                  const style = rankBadgeStyles[rankIdx];
                  const normPct = normalizedWeights[rankIdx];
                  return (
                    <div
                      key={axisItem.id + idx}
                      className={`p-3 rounded-xl bg-slate-900/90 border ${style.border} space-y-2.5 flex flex-col justify-between`}
                    >
                      <div className="space-y-2">
                        {/* Rank Header + Swap Order Buttons */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                            {style.axisCode} · 반영 {normPct}%
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={rankIdx === 0}
                              onClick={() => onSwapRankedAxes(rankIdx, (rankIdx - 1) as 0 | 1 | 2)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                              title="순위 올리기"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={rankIdx === 2}
                              onClick={() => onSwapRankedAxes(rankIdx, (rankIdx + 1) as 0 | 1 | 2)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                              title="순위 내리기"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Individual Weight Slider + Numeric Input */}
                        <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-300 font-semibold">
                              개인 가중치 설정
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={axisItem.weight}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateRankedAxis(rankIdx, {
                                    weight: isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
                                  });
                                }}
                                className="w-12 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-center font-mono tabular-nums font-bold text-amber-300 text-[11px] focus:outline-none focus:border-amber-400"
                              />
                              <span className="text-slate-400 font-mono">점 ({normPct}%)</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={axisItem.weight}
                            onChange={(e) =>
                              onUpdateRankedAxis(rankIdx, { weight: Number(e.target.value) })
                            }
                            className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${style.accent}`}
                          />
                        </div>

                        {/* Axis Name Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block">
                            {rankIdx + 1}순위 기준 이름 (예: 수익성, 연관성, 미래 지향성)
                          </label>
                          <input
                            type="text"
                            value={axisItem.name}
                            onChange={(e) => onUpdateRankedAxis(rankIdx, { name: e.target.value })}
                            placeholder="예: 수익성"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-blue-400"
                          />
                        </div>

                        {/* Negative / Positive Pole Labels */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div>
                            <label className="text-slate-500 block mb-0.5">음(-1.0) 극단</label>
                            <input
                              type="text"
                              value={axisItem.negativeLabel}
                              onChange={(e) =>
                                onUpdateRankedAxis(rankIdx, { negativeLabel: e.target.value })
                              }
                              placeholder="예: 손실/규제 (-1.0)"
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-slate-600 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-0.5">양(+1.0) 극단</label>
                            <input
                              type="text"
                              value={axisItem.positiveLabel}
                              onChange={(e) =>
                                onUpdateRankedAxis(rankIdx, { positiveLabel: e.target.value })
                              }
                              placeholder="예: 고수익/진흥 (+1.0)"
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-slate-600 text-[10px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Personal Direction Preference for this Axis */}
                      <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-400 block">
                          검색 상단 정렬 시 선호 방향:
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { dir: 1 as const, label: '양(+) 높은 순' },
                            { dir: 0 as const, label: '중립/균형' },
                            { dir: -1 as const, label: '음(-) 높은 순' }
                          ].map((opt) => (
                            <button
                              key={opt.dir}
                              type="button"
                              onClick={() =>
                                onUpdateRankedAxis(rankIdx, { preferredDirection: opt.dir })
                              }
                              className={`py-1 px-1 rounded font-semibold transition-colors whitespace-nowrap ${
                                axisItem.preferredDirection === opt.dir
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section B: Personal Tendency Criteria + Article Count + 4D Color Axis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      내 선호 기사 성향 & 관심 키워드 (최상단 정렬 반영)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">선호 논조 성향:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['ALL', '긍정/지지', '중립/건설적', '우려/비판'] as const).map((sent) => (
                        <button
                          key={sent}
                          type="button"
                          onClick={() => setPreferredSentiment(sent)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                            preferredSentiment === sent
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {sent === 'ALL' ? '전체 균형' : sent}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block">
                      내 관심 키워드 (쉼표로 구분 · 포함 기사를 검색 최상단에 우선 노출)
                    </label>
                    <input
                      type="text"
                      value={interestKeywordsInput}
                      onChange={(e) => setInterestKeywordsInput(e.target.value)}
                      placeholder="예: AI주권, 산업진흥, 투자, 글로벌비교"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Article Count & 4D Color Axis */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-sky-400" />
                        수집 기사 수량 범위
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
                          className="w-14 px-2 py-0.5 rounded bg-slate-950 border border-blue-500/40 text-center font-mono tabular-nums font-bold text-blue-400 text-xs focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs">개</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={searchCount}
                      onChange={(e) => setSearchCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />

                    <div className="flex items-center justify-between gap-1">
                      {[10, 20, 30, 50, 100].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setSearchCount(cnt)}
                          className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all whitespace-nowrap ${
                            searchCount === cnt
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {cnt}개
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4D Color Axis Toggle */}
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
                          <span>4차원 색상(Color) 스펙트럼 활성화</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-3 border-t border-white/5 text-center text-xs text-slate-400 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">상산고등학교 SMARTLAB</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          NSight 3D News Intelligence Search Engine
        </span>
      </footer>
    </div>
  );
};
