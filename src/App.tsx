import React, { useState, useMemo } from 'react';
import { VectorMap3D } from './components/VectorMap3D';
import { DEMO_DATASETS } from './data/mockDatasets';
import { Article } from './types';
import {
  Box,
  Layers,
  ExternalLink,
  RotateCcw,
  Sliders,
  Eye,
  CheckCircle2,
  Info,
  Search,
  X
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentQuery, setCurrentQuery] = useState<string>('AI 기본법');
  const [dataset, setDataset] = useState(DEMO_DATASETS['AI 기본법']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(
    DEMO_DATASETS['AI 기본법'].articles[0] // Default select the (0,0,0) baseline article for immediate visual engagement
  );
  const [hoveredArticle, setHoveredArticle] = useState<Article | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scaleFactor, setScaleFactor] = useState<number>(12);

  // Grid visibility states
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showXYGrid, setShowXYGrid] = useState<boolean>(true);
  const [showYZGrid, setShowYZGrid] = useState<boolean>(true);

  // Camera preset command trigger
  const [cameraPresetCommand, setCameraPresetCommand] = useState<string>('RESET');
  const [activePreset, setActivePreset] = useState<string>('RESET');

  const handleSelectDataset = (key: string) => {
    setCurrentQuery(key);
    const newDataset = DEMO_DATASETS[key];
    setDataset(newDataset);
    // Automatically select the center baseline article if available
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

  const filteredArticles = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) return dataset.articles;
    return dataset.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.keywords.some((kw) => kw.toLowerCase().includes(query))
    );
  }, [dataset.articles, searchFilter]);

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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                  (0,0,0) 중심 좌표계
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                상산고등학교 SMARTLAB
              </p>
            </div>
          </div>

          {/* Global Search Input (Filter by Title or Keyword) - Positioned left of View Presets */}
          <div className="relative flex items-center bg-slate-900/95 rounded-lg border border-blue-500/40 shadow-sm shadow-blue-500/10 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all text-xs">
            <span className="text-blue-400 pl-2.5 pr-1 text-[11px] font-semibold flex items-center gap-1 shrink-0">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              검색:
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="제목 또는 키워드 입력..."
              aria-label="기사 제목 또는 키워드 검색"
              className="bg-transparent text-white placeholder-slate-400 px-2 py-1.5 w-48 sm:w-64 focus:outline-none text-xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="mr-1.5 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="검색어 지우기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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
              이슈:
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

        {/* Left Side Controls & Legend Panel */}
        <div className="pointer-events-auto absolute top-20 left-4 w-76 max-w-[calc(100vw-2rem)] space-y-2.5">
          {/* X · Y · Z Coordinate Axes Breakdown */}
          <div className="clean-panel p-3.5 rounded-xl space-y-2.5 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 tracking-wider flex items-center gap-1.5 text-xs">
                <Box className="w-3.5 h-3.5 text-blue-400" />
                <span>📐 X · Y · Z 축 범주 안내</span>
              </h3>
              <span className="text-[10px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded font-mono font-medium">
                Dynamic Badge
              </span>
            </div>

            <div className="space-y-2">
              {/* X Axis */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-rose-500 space-y-1">
                <div className="text-rose-400 font-bold flex justify-between items-center text-xs">
                  <span>X축 (가로 쟁점)</span>
                  <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug font-medium">
                  {dataset.axes.x_axis}
                </p>
              </div>

              {/* Y Axis */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-emerald-500 space-y-1">
                <div className="text-emerald-400 font-bold flex justify-between items-center text-xs">
                  <span>Y축 (높이 / 파급력)</span>
                  <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug font-medium">
                  {dataset.axes.y_axis}
                </p>
              </div>

              {/* Z Axis */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border-l-4 border-purple-500 space-y-1">
                <div className="text-purple-400 font-bold flex justify-between items-center text-xs">
                  <span>Z축 (깊이 / 신뢰도)</span>
                  <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug font-medium">
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
                  <span className="text-rose-400 font-bold">X축 (가로 쟁점)</span>
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
                  <span className="text-purple-400 font-bold">Z축 (신뢰도/근거)</span>
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
              {searchFilter.trim() ? ` / ${dataset.articles.length}` : ''}개 로드됨
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-400">made by SMARTLAB 김태호</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
