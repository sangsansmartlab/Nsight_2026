import React, { useState, useMemo, useEffect } from 'react';
import { VectorMap3D } from './components/VectorMap3D';
import { DEMO_DATASETS, DatasetItem } from './data/mockDatasets';
import { Article, CustomAxes } from './types';
import {
  Box,
  Layers,
  ExternalLink,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Info,
  Search,
  X,
  Cpu,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Check,
  RefreshCw,
  Compass,
  Hash
} from 'lucide-react';

// Preset templates for custom 4D axes
const AXIS_PRESET_TEMPLATES: Record<string, CustomAxes> = {
  '기본 균형형': {
    x_axis: '규제 중심 (-1.0) ↔ 중심 (0.0) ↔ 산업 진흥 (+1.0)',
    y_axis: '낮은 파급력 (-1.0) ↔ 기준 (0.0) ↔ 높은 파급력 (+1.0)',
    z_axis: '낮은 신뢰도 (-1.0) ↔ 중립 (0.0) ↔ 높은 신뢰도 (+1.0)',
    color_axis: '기사 성향 (핵심, 우려, 진흥, 윤리, 건설적)'
  },
  '정치·정책형': {
    x_axis: '여당 / 정책 지지 (-1.0) ↔ 중립 ↔ 야당 / 비판 (+1.0)',
    y_axis: '단기 여론 영향 (-1.0) ↔ 보통 ↔ 법제화 파급력 (+1.0)',
    z_axis: '정치적 공방 (-1.0) ↔ 중립 ↔ 공인 팩트/실증 (+1.0)',
    color_axis: '논조 성향 (찬성, 반대, 중립, 심층분석)'
  },
  '기술·혁신형': {
    x_axis: '안전성 / 윤리 검증 (-1.0) ↔ 균형 ↔ 기술 혁신 / 속도 (+1.0)',
    y_axis: '실험실 시제품 (-1.0) ↔ 상용화 ↔ 산업 패러다임 전환 (+1.0)',
    z_axis: '단순 마케팅 홍보 (-1.0) ↔ 중립 ↔ 기술/학술적 실증 (+1.0)',
    color_axis: '기술 평가 (돌파구, 과열, 안정, 관망)'
  },
  '경제·시장형': {
    x_axis: '긴축 / 리스크 우려 (-1.0) ↔ 중립 ↔ 성장 / 투자 호재 (+1.0)',
    y_axis: '개별 기업 이슈 (-1.0) ↔ 섹터 영향 ↔ 거시경제 파급 (+1.0)',
    z_axis: '시장 루머/추측 (-1.0) ↔ 중립 ↔ 정량 공시/재무 데이터 (+1.0)',
    color_axis: '시장 반응 (호재, 악재, 중립, 변동성)'
  }
};

export const App: React.FC = () => {
  const [currentQuery, setCurrentQuery] = useState<string>('AI 기본법');
  const [dataset, setDataset] = useState<DatasetItem>(DEMO_DATASETS['AI 기본법']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [groqKeyCount, setGroqKeyCount] = useState<number>(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(
    DEMO_DATASETS['AI 기본법'].articles[0]
  );
  const [hoveredArticle, setHoveredArticle] = useState<Article | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scaleFactor, setScaleFactor] = useState<number>(12);

  // Left sidebar collapse / expand state
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);

  // Search customization settings modal/popover state
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState<boolean>(false);
  const [searchCount, setSearchCount] = useState<number>(15); // Range 1 ~ 100
  const [customAxes, setCustomAxes] = useState<CustomAxes>({
    x_axis: DEMO_DATASETS['AI 기본법'].axes.x_axis,
    y_axis: DEMO_DATASETS['AI 기본법'].axes.y_axis,
    z_axis: DEMO_DATASETS['AI 기본법'].axes.z_axis,
    color_axis: DEMO_DATASETS['AI 기본법'].axes.color_axis
  });
  const [axisSaveToast, setAxisSaveToast] = useState<string | null>(null);

  // Grid visibility states
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showXYGrid, setShowXYGrid] = useState<boolean>(true);
  const [showYZGrid, setShowYZGrid] = useState<boolean>(true);

  // Camera preset command trigger
  const [cameraPresetCommand, setCameraPresetCommand] = useState<string>('RESET');
  const [activePreset, setActivePreset] = useState<string>('RESET');

  // Check Groq Key Pool health on mount
  useEffect(() => {
    fetch('/api/v1/groq/status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configuredCount !== undefined) {
          setGroqKeyCount(data.configuredCount);
        }
      })
      .catch(() => {
        // Fallback silently
      });
  }, []);

  const handleSelectDataset = (key: string) => {
    setCurrentQuery(key);
    setSearchFilter('');
    const newDataset = DEMO_DATASETS[key];
    setDataset(newDataset);
    setCustomAxes({ ...newDataset.axes });
    const centerArt = newDataset.articles.find(
      (a) => Math.abs(a.coordinates.x) < 0.05 && Math.abs(a.coordinates.y) < 0.05
    );
    setSelectedArticle(centerArt || newDataset.articles[0] || null);
    setCameraPresetCommand('RESET');
    setActivePreset('RESET');
  };

  const handleSetPreset = (preset: string) => {
    setActivePreset(preset);
    setCameraPresetCommand(preset);
  };

  // Apply custom axes to current dataset view immediately
  const handleApplyAxesToCurrentView = () => {
    setDataset((prev) => ({
      ...prev,
      axes: { ...customAxes }
    }));
    setAxisSaveToast('설정한 축 기준이 현재 3D 공간에 즉시 적용되었습니다.');
    setTimeout(() => setAxisSaveToast(null), 3000);
  };

  // Perform real-time Search & 4D Vectorization with custom count and axes
  const handlePerformSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchFilter.trim();
    if (!query) return;

    setIsSearching(true);
    setIsCustomSettingsOpen(false);

    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          display_count: Math.min(100, Math.max(1, searchCount)),
          custom_axes: customAxes
        })
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        const dynamicDataset: DatasetItem = {
          id: `dynamic_${Date.now()}`,
          name: query,
          axes: data.axes || customAxes,
          articles: data.articles
        };
        setDataset(dynamicDataset);
        setCurrentQuery(query);
        setSelectedArticle(data.articles[0]);
        setCameraPresetCommand('RESET');
        setActivePreset('RESET');
      }
    } catch (err) {
      console.error('[Search Error]:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredArticles = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    // If not actively searching via API, perform in-memory keyword highlight/filter
    if (!query || isSearching) return dataset.articles;
    return dataset.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  }, [dataset.articles, searchFilter, isSearching]);

  const activeSelectedArticle = useMemo(() => {
    if (!selectedArticle) return null;
    return filteredArticles.some((a) => a.id === selectedArticle.id) ? selectedArticle : null;
  }, [filteredArticles, selectedArticle]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans">
      {/* 3D WebGL Canvas Layer */}
      <VectorMap3D
        articles={filteredArticles}
        axes={dataset.axes}
        selectedArticle={activeSelectedArticle}
        hoveredArticle={hoveredArticle}
        scaleFactor={scaleFactor}
        showFloorGrid={showFloorGrid}
        showXYGrid={showXYGrid}
        showYZGrid={showYZGrid}
        cameraPresetCommand={cameraPresetCommand}
        onSelectArticle={setSelectedArticle}
        onHoverArticle={(art, pos) => {
          setHoveredArticle(art);
          if (pos) setHoverPos(pos);
        }}
      />

      {/* Floating 2D UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none p-4 flex flex-col justify-between">
        
        {/* Top Header Panel */}
        <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 clean-panel p-3.5 rounded-xl border border-white/10 shadow-2xl">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-blue-500/25">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">NSight 3D Vector Map</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span>수집: BeautifulSoup 4</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  추론 엔진 {groqKeyCount > 0 ? `(${groqKeyCount}키 로테이션)` : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                상산고등학교 SMARTLAB · 실시간 다차원 뉴스 벡터화 & 3D 시각화 플랫폼
              </p>
            </div>
          </div>

          {/* Search Bar with Customization Trigger and 🔍 Search Button */}
          <div className="relative flex items-center gap-1.5">
            <form
              onSubmit={handlePerformSearch}
              className="relative flex items-center bg-slate-900/95 rounded-lg border border-blue-500/40 shadow-sm shadow-blue-500/10 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all text-xs"
            >
              {/* Settings / Customize Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCustomSettingsOpen(!isCustomSettingsOpen)}
                className={`ml-1 px-2 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  isCustomSettingsOpen
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="검색 조건 커스터마이징 (개수 1~100, X/Y/Z/Color 축 설정)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-medium hidden sm:inline">
                  옵션 ({searchCount}개)
                </span>
              </button>

              <div className="w-[1px] h-4 bg-slate-700/80 mx-1" />

              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="검색할 뉴스 키워드 입력 후 🔍 클릭..."
                aria-label="뉴스 키워드 검색"
                className="bg-transparent text-white placeholder-slate-400 px-2 py-1.5 w-48 sm:w-60 focus:outline-none text-xs"
              />

              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="mr-1 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="검색어 지우기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clean 🔍 Search Icon Button */}
              <button
                type="submit"
                disabled={isSearching || !searchFilter.trim()}
                className="mr-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm shadow-blue-600/30"
                title="검색 실행 (1~100개 수집 및 사용자 맞춤 축 4D 벡터화)"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Search className="w-4 h-4 text-white" />
                )}
              </button>
            </form>
          </div>

          {/* Camera View Presets */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-1 text-[11px] font-medium flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              시점:
            </span>
            <button
              onClick={() => handleSetPreset('RESET')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                activePreset === 'RESET'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              3D 입체
            </button>
            <button
              onClick={() => handleSetPreset('FRONT')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                activePreset === 'FRONT'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              정면 (XY)
            </button>
            <button
              onClick={() => handleSetPreset('TOP')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                activePreset === 'TOP'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              평면 (XZ)
            </button>
            <button
              onClick={() => handleSetPreset('SIDE')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                activePreset === 'SIDE'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              측면 (YZ)
            </button>
          </div>

          {/* Topic / Dataset Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-1 text-[11px] font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              프리셋:
            </span>
            {Object.keys(DEMO_DATASETS).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectDataset(key)}
                className={`px-3 py-1 font-medium rounded transition-all ${
                  currentQuery === key
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </header>

        {/* Search Customization Modal / Dropdown Panel */}
        {isCustomSettingsOpen && (
          <div className="pointer-events-auto absolute top-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 w-96 sm:w-[32rem] max-w-[calc(100vw-2rem)] clean-panel p-5 rounded-2xl border border-blue-500/40 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">검색 커스터마이징 & 축 설정</h3>
              </div>
              <button
                onClick={() => setIsCustomSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Article Count Selection (1 ~ 100) */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
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
                    className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-blue-500/40 text-center font-mono font-bold text-blue-400 text-xs focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-slate-400 text-xs">개 (1~100)</span>
                </div>
              </div>

              {/* Slider (1~100) */}
              <input
                type="range"
                min="1"
                max="100"
                value={searchCount}
                onChange={(e) => setSearchCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              {/* Preset Quick Buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {[5, 15, 30, 50, 100].map((cnt) => (
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
                    {cnt}개
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Axes Configuration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  4D 분석 축 사용자 직접 정의
                </span>
                <span className="text-[10px] text-slate-400 font-mono">X · Y · Z · Color</span>
              </div>

              {/* Preset Template Quick Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-400 shrink-0 mr-1 text-[10px]">프리셋:</span>
                {Object.entries(AXIS_PRESET_TEMPLATES).map(([name, axes]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCustomAxes({ ...axes })}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Axes Inputs */}
              <div className="space-y-2 text-xs">
                {/* X Axis */}
                <div className="space-y-1">
                  <label className="text-rose-400 font-semibold flex items-center justify-between text-[11px]">
                    <span>X축 (가로 쟁점 대립각)</span>
                    <span className="text-[10px] text-slate-400 font-mono">-1.0 ~ +1.0</span>
                  </label>
                  <input
                    type="text"
                    value={customAxes.x_axis}
                    onChange={(e) => setCustomAxes({ ...customAxes, x_axis: e.target.value })}
                    placeholder="예: 규제 중심 (-1.0) ↔ 산업 진흥 (+1.0)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-500/30 text-white focus:outline-none focus:border-rose-400 text-xs"
                  />
                </div>

                {/* Y Axis */}
                <div className="space-y-1">
                  <label className="text-emerald-400 font-semibold flex items-center justify-between text-[11px]">
                    <span>Y축 (파급력 & 사회적 영향도)</span>
                    <span className="text-[10px] text-slate-400 font-mono">-1.0 ~ +1.0</span>
                  </label>
                  <input
                    type="text"
                    value={customAxes.y_axis}
                    onChange={(e) => setCustomAxes({ ...customAxes, y_axis: e.target.value })}
                    placeholder="예: 낮은 파급력 (-1.0) ↔ 높은 파급력 (+1.0)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-white focus:outline-none focus:border-emerald-400 text-xs"
                  />
                </div>

                {/* Z Axis */}
                <div className="space-y-1">
                  <label className="text-purple-400 font-semibold flex items-center justify-between text-[11px]">
                    <span>Z축 (정보 신뢰도 & 객관성)</span>
                    <span className="text-[10px] text-slate-400 font-mono">-1.0 ~ +1.0</span>
                  </label>
                  <input
                    type="text"
                    value={customAxes.z_axis}
                    onChange={(e) => setCustomAxes({ ...customAxes, z_axis: e.target.value })}
                    placeholder="예: 낮은 신뢰도 (-1.0) ↔ 높은 신뢰도 (+1.0)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 text-xs"
                  />
                </div>

                {/* Color Axis */}
                <div className="space-y-1">
                  <label className="text-blue-400 font-semibold flex items-center justify-between text-[11px]">
                    <span>Color축 (노드 색상 / 기사 성향 기준)</span>
                    <span className="text-[10px] text-slate-400 font-mono">색상 구분</span>
                  </label>
                  <input
                    type="text"
                    value={customAxes.color_axis}
                    onChange={(e) => setCustomAxes({ ...customAxes, color_axis: e.target.value })}
                    placeholder="예: 기사 성향 (긍정 / 중립 / 비판 / 우려)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-blue-500/30 text-white focus:outline-none focus:border-blue-400 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Toast feedback */}
            {axisSaveToast && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{axisSaveToast}</span>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleApplyAxesToCurrentView}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>현재 화면에 축 적용</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (searchFilter.trim()) {
                    handlePerformSearch();
                  } else {
                    setIsCustomSettingsOpen(false);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{searchFilter.trim() ? '이 설정으로 검색' : '설정 완료'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Left Side Controls & Legend Panel */}
        <div className="pointer-events-auto absolute top-20 left-4 z-30">
          {isLeftPanelOpen ? (
            <div className="w-80 max-w-[calc(100vw-2rem)] space-y-2.5 transition-all duration-300 ease-out">
              {/* Header with Collapse Button */}
              <div className="clean-panel p-2.5 rounded-xl flex items-center justify-between border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white">축 범주 & 공간 제어</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="왼쪽 탭 접기"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>접기</span>
                </button>
              </div>

              {/* X · Y · Z Coordinate Axes Breakdown */}
              <div className="clean-panel p-3.5 rounded-xl space-y-2.5 text-xs shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 tracking-wider flex items-center gap-1.5 text-xs">
                    <span>📐 X · Y · Z 축 범주 안내</span>
                  </h3>
                  <button
                    onClick={() => setIsCustomSettingsOpen(true)}
                    className="text-[10px] text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1 transition-colors"
                    title="축 직접 편집하기"
                  >
                    <span>축 편집</span>
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* X Axis */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-rose-500 space-y-1">
                    <div className="text-rose-400 font-bold flex justify-between items-center text-xs">
                      <span>X축 (가로 쟁점)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.x_axis}
                    </p>
                  </div>

                  {/* Y Axis */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-emerald-500 space-y-1">
                    <div className="text-emerald-400 font-bold flex justify-between items-center text-xs">
                      <span>Y축 (높이 / 파급력)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.y_axis}
                    </p>
                  </div>

                  {/* Z Axis */}
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-purple-500 space-y-1">
                    <div className="text-purple-400 font-bold flex justify-between items-center text-xs">
                      <span>Z축 (깊이 / 신뢰도)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.z_axis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scale & Grid Options */}
              <div className="clean-panel p-3 rounded-xl space-y-2.5 text-xs shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    공간 간격 확대
                  </span>
                  <span className="text-blue-400 font-mono text-xs">{scaleFactor}x</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                {/* Grid Plane Visibility Toggles */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">평면 격자:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowFloorGrid(!showFloorGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        showFloorGrid
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      XZ 바닥
                    </button>
                    <button
                      onClick={() => setShowXYGrid(!showXYGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        showXYGrid
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      XY 정면
                    </button>
                    <button
                      onClick={() => setShowYZGrid(!showYZGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        showYZGrid
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      YZ 측면
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Minimized Tab Button when Collapsed */
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen(true)}
              className="clean-panel px-3 py-2.5 rounded-xl border border-blue-500/40 shadow-2xl flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 transition-all hover:scale-105 active:scale-95"
              title="축 범주 및 공간 설정 탭 펼치기"
            >
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>축 범주 및 뷰 설정</span>
            </button>
          )}
        </div>

        {/* Hover Tooltip (Mouse Cursor Following) */}
        {hoveredArticle && (
          <div
            className="pointer-events-none fixed z-50 clean-panel p-2.5 rounded-lg max-w-xs space-y-1 text-xs border border-blue-500/50 shadow-2xl transition-opacity duration-150"
            style={{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px` }}
          >
            <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold gap-2">
              <span className="truncate">{hoveredArticle.publisher}</span>
              <span className="font-mono text-slate-400">{hoveredArticle.pub_date}</span>
            </div>
            <p className="font-semibold text-white leading-tight line-clamp-2">
              {hoveredArticle.title}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-300">
              <span className="text-rose-400">X: {hoveredArticle.coordinates.x.toFixed(2)}</span>
              <span className="text-emerald-400">Y: {hoveredArticle.coordinates.y.toFixed(2)}</span>
              <span className="text-purple-400">Z: {hoveredArticle.coordinates.z.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Right Detail Inspector Panel (Selected Article) */}
        {activeSelectedArticle && (
          <aside className="pointer-events-auto absolute top-20 right-4 w-92 max-w-[calc(100vw-2rem)] clean-panel p-4 rounded-2xl space-y-3.5 border border-slate-700/80 shadow-2xl">
            {/* Header / Publisher / Title */}
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {activeSelectedArticle.publisher}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeSelectedArticle.pub_date}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-semibold"
                    style={{
                      backgroundColor: `${activeSelectedArticle.coordinates.color_hex}22`,
                      color: activeSelectedArticle.coordinates.color_hex,
                      border: `1px solid ${activeSelectedArticle.coordinates.color_hex}44`
                    }}
                  >
                    {activeSelectedArticle.coordinates.color_label}
                  </span>
                </div>
                <h2 className="text-xs font-bold text-white mt-1 leading-snug">
                  {activeSelectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm transition-colors"
                title="패널 닫기"
              >
                ✕
              </button>
            </div>

            {/* (0,0,0) Origin Coordinates with Center-Balanced Bipolar Bars */}
            <div className="space-y-2.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                  <span>⚡ (0,0,0) 원점 기준 축별 위치</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  3 Lines Active
                </span>
              </div>

              {/* X Axis Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-rose-400 font-bold">X축 ({dataset.axes.x_axis.includes('↔') ? dataset.axes.x_axis.split('↔')[0]?.trim().slice(0, 8) : '가로 쟁점'})</span>
                  <span className="font-mono font-bold text-rose-400">
                    {activeSelectedArticle.coordinates.x > 0
                      ? `+${activeSelectedArticle.coordinates.x.toFixed(2)}`
                      : activeSelectedArticle.coordinates.x.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                  {/* Center line indicator */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.abs(activeSelectedArticle.coordinates.x) * 50}%`,
                      marginLeft:
                        activeSelectedArticle.coordinates.x >= 0
                          ? '50%'
                          : `${50 - Math.abs(activeSelectedArticle.coordinates.x) * 50}%`,
                    }}
                  />
                </div>
              </div>

              {/* Y Axis Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold">Y축 (사회적 파급력)</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {activeSelectedArticle.coordinates.y > 0
                      ? `+${activeSelectedArticle.coordinates.y.toFixed(2)}`
                      : activeSelectedArticle.coordinates.y.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.abs(activeSelectedArticle.coordinates.y) * 50}%`,
                      marginLeft:
                        activeSelectedArticle.coordinates.y >= 0
                          ? '50%'
                          : `${50 - Math.abs(activeSelectedArticle.coordinates.y) * 50}%`,
                    }}
                  />
                </div>
              </div>

              {/* Z Axis Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-400 font-bold">Z축 (신뢰도/객관성)</span>
                  <span className="font-mono font-bold text-purple-400">
                    {activeSelectedArticle.coordinates.z > 0
                      ? `+${activeSelectedArticle.coordinates.z.toFixed(2)}`
                      : activeSelectedArticle.coordinates.z.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />
                  <div
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.abs(activeSelectedArticle.coordinates.z) * 50}%`,
                      marginLeft:
                        activeSelectedArticle.coordinates.z >= 0
                          ? '50%'
                          : `${50 - Math.abs(activeSelectedArticle.coordinates.z) * 50}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Keywords */}
            {activeSelectedArticle.keywords && activeSelectedArticle.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeSelectedArticle.keywords.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchFilter(kw)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-700/80 hover:border-blue-500/40 transition-colors"
                    title={`"${kw}" 키워드로 필터링`}
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            )}

            {/* AI 3-Line Summary */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-300 flex items-center gap-1">
                <span>📝 AI 3줄 요약</span>
              </h4>
              <ul className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                {activeSelectedArticle.summary_3lines.map((line, idx) => (
                  <li key={idx} className="leading-snug">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Rationale */}
            {activeSelectedArticle.ai_rationale && (
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>💡 AI 좌표 산출 근거</span>
                </h4>
                <p className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  {activeSelectedArticle.ai_rationale}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <a
                href={activeSelectedArticle.origin_link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <span>🔗 원본 기사 읽기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setSelectedArticle(null);
                  handleSetPreset('RESET');
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                title="선택 해제 및 원점 복귀"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}

        {/* Bottom Status Footer */}
        <footer className="pointer-events-auto flex items-center justify-between text-xs text-slate-400 clean-panel px-4 py-2 rounded-xl mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">
              상산고등학교 SMARTLAB (김태호, 박민수, 김이현, 차민혁)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">
              노드: {filteredArticles.length}
              {searchFilter.trim() ? ` / ${dataset.articles.length}` : ''}개 로드됨 (설정 수량: {searchCount}개)
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
