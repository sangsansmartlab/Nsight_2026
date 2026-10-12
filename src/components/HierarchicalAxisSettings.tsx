import React, { useState } from 'react';
import {
  Target,
  Compass,
  Hash,
  ChevronDown,
  ChevronUp,
  Sliders,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Palette,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Tag,
  BarChart3
} from 'lucide-react';
import { CustomAxes, RankedAxisItem } from '../types';
import { RankedAxisPreset, RANKED_AXIS_PRESETS } from './LandingView';

interface HierarchicalAxisSettingsProps {
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
  searchCount: number;
  setSearchCount: (cnt: number) => void;
  enableColorAxis: boolean;
  setEnableColorAxis: (enable: boolean) => void;
  customAxes: CustomAxes;
  setCustomAxes: (axes: CustomAxes) => void;
  onApplyAxesToCurrentView?: () => void;
  className?: string;
}

export const HierarchicalAxisSettings: React.FC<HierarchicalAxisSettingsProps> = ({
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
  searchCount,
  setSearchCount,
  enableColorAxis,
  setEnableColorAxis,
  customAxes,
  setCustomAxes,
  onApplyAxesToCurrentView,
  className = ''
}) => {
  // Main Category / 대주제 Active State ('axes' | 'tendency' | 'count' | null)
  // Default: 'axes' is open initially so user sees the core feature, but can click to collapse/toggle.
  const [activeMainTopic, setActiveMainTopic] = useState<'axes' | 'tendency' | 'count' | null>('axes');

  // Sub-topics under 대주제 1 (좌표축 1·2·3순위 & 가중치)
  // 'weights' | 'names' | 'direction' | null
  const [activeAxesSubTopic, setActiveAxesSubTopic] = useState<'weights' | 'names' | 'direction' | null>('weights');

  // Sub-topics under 대주제 2 (내 선호 기사 성향 & 관심 키워드)
  // 'sentiment' | 'keywords' | null
  const [activeTendencySubTopic, setActiveTendencySubTopic] = useState<'sentiment' | 'keywords' | null>('sentiment');

  // Sub-topics under 대주제 3 (수집 기사 수량 범위)
  // 'count' | 'color' | null
  const [activeCountSubTopic, setActiveCountSubTopic] = useState<'count' | 'color' | null>('count');

  // Toggle handlers for progressive disclosure
  const toggleMainTopic = (topic: 'axes' | 'tendency' | 'count') => {
    setActiveMainTopic((prev) => (prev === topic ? null : topic));
  };

  const toggleAxesSubTopic = (sub: 'weights' | 'names' | 'direction') => {
    setActiveAxesSubTopic((prev) => (prev === sub ? null : sub));
  };

  const toggleTendencySubTopic = (sub: 'sentiment' | 'keywords') => {
    setActiveTendencySubTopic((prev) => (prev === sub ? null : sub));
  };

  const toggleCountSubTopic = (sub: 'count' | 'color') => {
    setActiveCountSubTopic((prev) => (prev === sub ? null : sub));
  };

  // Color styles mapped to official 3D Cube nodes:
  // Node X (1순위): Electric Cyan (#38BDF8)
  // Node Y (2순위): Royal Blue (#60A5FA)
  // Node Z (3순위): Neon Purple (#C084FC)
  const rankStyles = [
    {
      code: '1순위 (X축)',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      accent: 'accent-cyan-400',
      dot: '#38BDF8'
    },
    {
      code: '2순위 (Y축)',
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      accent: 'accent-blue-400',
      dot: '#60A5FA'
    },
    {
      code: '3순위 (Z축)',
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      accent: 'accent-purple-400',
      dot: '#C084FC'
    }
  ];

  const quickKeywordChips = ['AI주권', '산업진흥', '투자·인프라', '글로벌비교', '규제완화', '국회입법'];

  const handleAddKeyword = (kw: string) => {
    const currentList = interestKeywordsInput
      .split(/[,#]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentList.includes(kw)) {
      const updated = currentList.length > 0 ? `${interestKeywordsInput}, ${kw}` : kw;
      setInterestKeywordsInput(updated);
    }
  };

  return (
    <div className={`space-y-3.5 text-xs ${className}`}>
      {/* =========================================================================
          대주제 1: 좌표축 1·2·3순위 & 개인 가중치(%) 설정
         ========================================================================= */}
      <div
        className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
          activeMainTopic === 'axes'
            ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
            : 'bg-slate-900/60 border-white/10 hover:border-white/20'
        }`}
      >
        {/* 대주제 1 헤더 버튼 (클릭 시 토글 & 강조) */}
        <button
          type="button"
          onClick={() => toggleMainTopic('axes')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeMainTopic === 'axes'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-extrabold text-sm sm:text-base tracking-tight transition-colors ${
                    activeMainTopic === 'axes' ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  좌표축 1·2·3순위 & 개인 가중치(%) 설정
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                  대주제
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                현재 가중치 비율:{' '}
                <span className="text-cyan-300 font-semibold font-mono">
                  {normalizedWeights[0]}% : {normalizedWeights[1]}% : {normalizedWeights[2]}%
                </span>{' '}
                · 1순위[{rankedAxes[0].name}] · 2순위[{rankedAxes[1].name}] · 3순위[{rankedAxes[2].name}]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                activeMainTopic === 'axes'
                  ? 'bg-cyan-500/20 text-cyan-300 rotate-180'
                  : 'bg-slate-800 text-slate-400 group-hover:text-white'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* 대주제 1 활성화 시 아래에 소주제 목록 표시 */}
        {activeMainTopic === 'axes' && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-250">
            {/* 분야별 빠른 추천 순위 프리셋 */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                분야별 추천 프리셋:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {RANKED_AXIS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPresetRankedAxes(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* -------------------------------------------------------------
                소주제 1-1: 1·2·3순위 반영 개인 가중치 설정
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeAxesSubTopic === 'weights'
                  ? 'bg-slate-950/80 border-cyan-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAxesSubTopic('weights')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeAxesSubTopic === 'weights' ? 'text-cyan-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 1: 1·2·3순위 반영 개인 가중치(%) 설정
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (슬라이더 조절 & 순위 교체)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-cyan-400 font-semibold hidden xs:inline">
                    {normalizedWeights[0]}% : {normalizedWeights[1]}% : {normalizedWeights[2]}%
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                      activeAxesSubTopic === 'weights' ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* 소주제 1-1 사용자 선택/설정 창 */}
              {activeAxesSubTopic === 'weights' && (
                <div className="p-3.5 pt-1 space-y-3 border-t border-slate-800/60 animate-in fade-in duration-200">
                  {/* 빠른 가중치 배분 버튼 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400">빠른 비율 배분:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onApplyWeightPreset(50, 30, 20)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-mono cursor-pointer transition-colors"
                      >
                        기본 (50:30:20)
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyWeightPreset(70, 20, 10)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-mono cursor-pointer transition-colors"
                      >
                        1순위 집중 (70:20:10)
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyWeightPreset(34, 33, 33)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-mono cursor-pointer transition-colors"
                      >
                        균등 (34:33:33)
                      </button>
                    </div>
                  </div>

                  {/* 각 축별 가중치 조절 슬라이더 및 순위 변경 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {rankedAxes.map((axisItem, idx) => {
                      const rankIdx = idx as 0 | 1 | 2;
                      const style = rankStyles[rankIdx];
                      const normPct = normalizedWeights[rankIdx];
                      return (
                        <div
                          key={axisItem.id + idx}
                          className={`p-3 rounded-xl bg-slate-900/90 border ${style.border} space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                              {style.code} · 반영 {normPct}%
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={rankIdx === 0}
                                onClick={() => onSwapRankedAxes(rankIdx, (rankIdx - 1) as 0 | 1 | 2)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white cursor-pointer"
                                title="순위 올리기"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={rankIdx === 2}
                                onClick={() => onSwapRankedAxes(rankIdx, (rankIdx + 1) as 0 | 1 | 2)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white cursor-pointer"
                                title="순위 내리기"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-300 font-semibold">{axisItem.name} 가중치</span>
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
                                  className="w-12 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold text-cyan-300 text-[11px] focus:outline-none focus:border-cyan-400"
                                />
                                <span className="text-slate-400 font-mono">점</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={axisItem.weight}
                              onChange={(e) => onUpdateRankedAxis(rankIdx, { weight: Number(e.target.value) })}
                              className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${style.accent}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                소주제 1-2: 1·2·3순위 기준 이름 및 양/음 극단 레이블
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeAxesSubTopic === 'names'
                  ? 'bg-slate-950/80 border-cyan-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAxesSubTopic('names')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeAxesSubTopic === 'names' ? 'text-blue-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 2: 1·2·3순위 기준 이름 및 양/음 극단 설정
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (기준 명칭 · -1.0 ↔ +1.0 레이블)
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                    activeAxesSubTopic === 'names' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* 소주제 1-2 사용자 선택/설정 창 */}
              {activeAxesSubTopic === 'names' && (
                <div className="p-3.5 pt-1 space-y-2.5 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {rankedAxes.map((axisItem, idx) => {
                      const rankIdx = idx as 0 | 1 | 2;
                      const style = rankStyles[rankIdx];
                      return (
                        <div
                          key={axisItem.id + idx}
                          className={`p-3 rounded-xl bg-slate-900/90 border ${style.border} space-y-2`}
                        >
                          <span className={`font-bold text-[11px] block ${style.text}`}>
                            {style.code} 기준 명칭
                          </span>
                          <input
                            type="text"
                            value={axisItem.name}
                            onChange={(e) => onUpdateRankedAxis(rankIdx, { name: e.target.value })}
                            placeholder="예: 산업 진흥성"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-cyan-400"
                          />

                          <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
                            <div>
                              <label className="text-slate-500 block mb-0.5">음(-1.0) 극단</label>
                              <input
                                type="text"
                                value={axisItem.negativeLabel}
                                onChange={(e) =>
                                  onUpdateRankedAxis(rankIdx, { negativeLabel: e.target.value })
                                }
                                placeholder="예: 규제 (-1.0)"
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
                                placeholder="예: 진흥 (+1.0)"
                                className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-slate-600 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                소주제 1-3: 검색 상단 정렬 시 선호 방향
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeAxesSubTopic === 'direction'
                  ? 'bg-slate-950/80 border-cyan-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAxesSubTopic('direction')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeAxesSubTopic === 'direction' ? 'text-purple-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 3: 검색 상단 정렬 시 선호 방향
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (양수 우선 / 중립 / 음수 우선)
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                    activeAxesSubTopic === 'direction' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {/* 소주제 1-3 사용자 선택/설정 창 */}
              {activeAxesSubTopic === 'direction' && (
                <div className="p-3.5 pt-1 space-y-2.5 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <p className="text-[11px] text-slate-400">
                    검색 결과 리스트 최상단 및 맞춤 추천 시 어떤 극단의 기사를 우선 매칭할지 선택합니다.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {rankedAxes.map((axisItem, idx) => {
                      const rankIdx = idx as 0 | 1 | 2;
                      const style = rankStyles[rankIdx];
                      return (
                        <div
                          key={axisItem.id + idx}
                          className={`p-3 rounded-xl bg-slate-900/90 border ${style.border} space-y-2`}
                        >
                          <span className={`font-bold text-[11px] block ${style.text}`}>
                            {style.code} ({axisItem.name}) 선호 방향
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
                                className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                                  axisItem.preferredDirection === opt.dir
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          대주제 2: 내 선호 기사 성향 & 관심 키워드
         ========================================================================= */}
      <div
        className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
          activeMainTopic === 'tendency'
            ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
            : 'bg-slate-900/60 border-white/10 hover:border-white/20'
        }`}
      >
        {/* 대주제 2 헤더 버튼 (클릭 시 토글 & 강조) */}
        <button
          type="button"
          onClick={() => toggleMainTopic('tendency')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeMainTopic === 'tendency'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-extrabold text-sm sm:text-base tracking-tight transition-colors ${
                    activeMainTopic === 'tendency' ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  내 선호 기사 성향 & 관심 키워드
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  대주제
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                선호 논조:{' '}
                <span className="text-indigo-300 font-semibold">
                  {preferredSentiment === 'ALL' ? '전체 균형' : preferredSentiment}
                </span>{' '}
                · 관심 키워드 {interestKeywordsInput ? `[${interestKeywordsInput.slice(0, 24)}…]` : '미지정'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                activeMainTopic === 'tendency'
                  ? 'bg-indigo-500/20 text-indigo-300 rotate-180'
                  : 'bg-slate-800 text-slate-400 group-hover:text-white'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* 대주제 2 활성화 시 아래에 소주제 목록 표시 */}
        {activeMainTopic === 'tendency' && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-250">
            {/* -------------------------------------------------------------
                소주제 2-1: 선호 논조 성향
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeTendencySubTopic === 'sentiment'
                  ? 'bg-slate-950/80 border-indigo-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTendencySubTopic('sentiment')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeTendencySubTopic === 'sentiment' ? 'text-indigo-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 1: 선호 논조 성향
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (긍정 / 중립 / 우려 비판 선호)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-indigo-400 font-semibold hidden xs:inline">
                    {preferredSentiment === 'ALL' ? '전체 균형' : preferredSentiment}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                      activeTendencySubTopic === 'sentiment' ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* 소주제 2-1 사용자 선택/설정 창 */}
              {activeTendencySubTopic === 'sentiment' && (
                <div className="p-3.5 pt-1 space-y-2 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <p className="text-[11px] text-slate-400">
                    원하는 관점의 보도를 검색 결과 상단에 우선적으로 배치합니다:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['ALL', '긍정/지지', '중립/건설적', '우려/비판'] as const).map((sent) => (
                      <button
                        key={sent}
                        type="button"
                        onClick={() => setPreferredSentiment(sent)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          preferredSentiment === sent
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {preferredSentiment === sent && <Check className="w-3.5 h-3.5" />}
                        <span>{sent === 'ALL' ? '전체 균형' : sent}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                소주제 2-2: 내 관심 키워드
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeTendencySubTopic === 'keywords'
                  ? 'bg-slate-950/80 border-indigo-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTendencySubTopic('keywords')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeTendencySubTopic === 'keywords' ? 'text-sky-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 2: 내 관심 키워드
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (가산점 부여 & 우선 노출 키워드)
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                    activeTendencySubTopic === 'keywords' ? 'rotate-180 text-sky-400' : ''
                  }`}
                />
              </button>

              {/* 소주제 2-2 사용자 선택/설정 창 */}
              {activeTendencySubTopic === 'keywords' && (
                <div className="p-3.5 pt-1 space-y-2.5 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <label className="text-[11px] text-slate-400 block">
                    쉼표(,)로 구분하여 입력한 키워드가 포함된 기사는 맞춤 일치 점수에 가산점이 부여됩니다:
                  </label>
                  <input
                    type="text"
                    value={interestKeywordsInput}
                    onChange={(e) => setInterestKeywordsInput(e.target.value)}
                    placeholder="예: AI주권, 산업진흥, 인프라지원, 글로벌비교"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-400"
                  />

                  {/* 빠른 추천 키워드 칩 */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400">추천 키워드 추가:</span>
                    {quickKeywordChips.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleAddKeyword(kw)}
                        className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-300 border border-slate-800 text-[10px] transition-colors cursor-pointer"
                      >
                        +{kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          대주제 3: 수집 기사 수량 범위 & 4D 색상 스펙트럼
         ========================================================================= */}
      <div
        className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
          activeMainTopic === 'count'
            ? 'bg-slate-900/90 border-purple-500/50 shadow-xl shadow-purple-500/10'
            : 'bg-slate-900/60 border-white/10 hover:border-white/20'
        }`}
      >
        {/* 대주제 3 헤더 버튼 (클릭 시 토글 & 강조) */}
        <button
          type="button"
          onClick={() => toggleMainTopic('count')}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeMainTopic === 'count'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-extrabold text-sm sm:text-base tracking-tight transition-colors ${
                    activeMainTopic === 'count' ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  수집 기사 수량 범위 & 4D 색상 스펙트럼
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                  대주제
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                현재 수집 범위:{' '}
                <span className="text-purple-300 font-semibold font-mono">{searchCount}개 기사</span> · 4D 색상축:{' '}
                <span className="text-purple-300 font-semibold">
                  {enableColorAxis ? '활성화' : '비활성'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                activeMainTopic === 'count'
                  ? 'bg-purple-500/20 text-purple-300 rotate-180'
                  : 'bg-slate-800 text-slate-400 group-hover:text-white'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* 대주제 3 활성화 시 아래에 소주제 목록 표시 */}
        {activeMainTopic === 'count' && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-250">
            {/* -------------------------------------------------------------
                소주제 3-1: 수집 기사 수량 조절
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeCountSubTopic === 'count'
                  ? 'bg-slate-950/80 border-purple-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCountSubTopic('count')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeCountSubTopic === 'count' ? 'text-purple-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 1: 수집 기사 수량 설정
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">(1개 ~ 100개 범위)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-purple-400 font-semibold font-mono">
                    {searchCount}개
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                      activeCountSubTopic === 'count' ? 'rotate-180 text-purple-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* 소주제 3-1 사용자 선택/설정 창 */}
              {activeCountSubTopic === 'count' && (
                <div className="p-3.5 pt-1 space-y-3 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-xs">탐색할 기사 수:</span>
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
                        className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-purple-500/40 text-center font-mono font-bold text-purple-300 text-xs focus:outline-none"
                      />
                      <span className="text-slate-400 text-xs">개</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={searchCount}
                    onChange={(e) => setSearchCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />

                  <div className="flex items-center justify-between gap-1.5">
                    {[10, 20, 30, 50, 100].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSearchCount(cnt)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          searchCount === cnt
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cnt}개
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                소주제 3-2: 4차원 색상(Color) 스펙트럼 활성화
               ------------------------------------------------------------- */}
            <div
              className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                activeCountSubTopic === 'color'
                  ? 'bg-slate-950/80 border-purple-500/40 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCountSubTopic('color')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      activeCountSubTopic === 'color' ? 'text-pink-300' : 'text-slate-300'
                    }`}
                  >
                    소주제 2: 4차원 색상(Color) 스펙트럼 활성화
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    (노드 성향별 연속 그라디언트)
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${
                    activeCountSubTopic === 'color' ? 'rotate-180 text-pink-400' : ''
                  }`}
                />
              </button>

              {/* 소주제 3-2 사용자 선택/설정 창 */}
              {activeCountSubTopic === 'color' && (
                <div className="p-3.5 pt-1 space-y-2 border-t border-slate-800/60 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200">
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
                      className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <Palette className="w-4 h-4" />
                      <span>3D 공간 노드에 4차원 색상 스펙트럼 반영</span>
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 pl-6.5 leading-relaxed">
                    활성화 시 각 기사의 1순위(X축) 성향 또는 호재·악재 논조에 따라 3D 공간상의 노드 색상이 연속 스펙트럼(시안 ↔ 화이트 ↔ 퍼플/레드)으로 실시간 채색됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 실시간 3D 공간 적용 버튼 (Explorer 뷰에서 제공될 경우) */}
      {onApplyAxesToCurrentView && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onApplyAxesToCurrentView}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>설정한 1·2·3순위 축 & 개인 경향성을 현재 3D 공간에 즉시 적용</span>
          </button>
        </div>
      )}
    </div>
  );
};
