import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  SlidersHorizontal,
  Server,
  Cpu,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Trash2,
  Home,
  Layers,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  History,
  Search,
  Key,
  Camera,
  FolderOpen,
  Target,
  ArrowUpDown,
  Check,
  Box,
  FileText,
  Columns,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthUser } from './AuthModal';
import { RankedAxisItem, CustomAxes } from '../types';
import { NsightLogo } from './NsightLogo';
import { MapSnapshot, SearchHistoryItem } from './SnapshotsDrawer';

export type DrawerMenuId =
  | 'panels'
  | 'weights'
  | 'axes'
  | 'count'
  | 'backend'
  | 'export'
  | 'query_history'
  | 'snapshots'
  | 'rbac';

interface SystemOverviewData {
  status: string;
  uptimeSeconds: number;
  nodeVersion: string;
  memory: {
    rssMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
  };
  cache: {
    activeEntries: number;
    maxEntries: number;
    ttlMinutes: number;
  };
  groq: {
    configuredCount: number;
    totalSlots: number;
  };
  gemini: {
    isAvailable: boolean;
    model: string;
  };
  crawlers: Array<{
    name: string;
    status: string;
    region?: string;
    rateLimit?: string;
  }>;
}

interface LogoSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appMode: 'LANDING' | 'EXPLORER';
  onNavigateHome: () => void;
  onNavigateExplorer: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenSnapshots: () => void;
  onOpenCustomSettings: () => void;
  onOpenColorGuide: () => void;
  rankedAxes: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  normalizedWeights: [number, number, number];
  onUpdateRankedAxis?: (index: 0 | 1 | 2, updated: Partial<RankedAxisItem>) => void;
  onApplyWeightPreset?: (w1: number, w2: number, w3: number) => void;
  onSwapRankedAxes?: (i1: 0 | 1 | 2, i2: 0 | 1 | 2) => void;
  searchCount: number;
  setSearchCount?: (cnt: number) => void;
  onSelectHistoryQuery?: (query: string) => void;
  onLoadSnapshot?: (snapshot: MapSnapshot) => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onCapturePNG?: () => void;
  isLeftPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  onOpenLeftPanel?: () => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
  onOpenRightPanel?: () => void;
  onOpenBothPanels?: () => void;
  onCloseBothPanels?: () => void;
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
}

export const LogoSideDrawer: React.FC<LogoSideDrawerProps> = ({
  isOpen,
  onClose,
  appMode,
  onNavigateHome,
  onNavigateExplorer,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenSnapshots,
  onOpenCustomSettings,
  onOpenColorGuide,
  rankedAxes,
  normalizedWeights,
  onUpdateRankedAxis,
  onApplyWeightPreset,
  onSwapRankedAxes,
  searchCount,
  setSearchCount,
  onSelectHistoryQuery,
  onLoadSnapshot,
  onExportCSV,
  onExportJSON,
  onCapturePNG,
  isLeftPanelOpen,
  onToggleLeftPanel,
  onOpenLeftPanel,
  isRightPanelOpen,
  onToggleRightPanel,
  onOpenRightPanel,
  onOpenBothPanels,
  onCloseBothPanels,
  isSettingsOpen,
  onToggleSettings
}) => {
  // Accordion active menu item (defaults to 'panels' so side panel controls are immediately available)
  const [activeMenu, setActiveMenu] = useState<DrawerMenuId | null>('panels');

  // Backend telemetry state
  const [systemOverview, setSystemOverview] = useState<SystemOverviewData | null>(null);
  const [isLoadingSystem, setIsLoadingSystem] = useState<boolean>(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);

  // Search History and Snapshots loaded from localStorage
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [snapshots, setSnapshots] = useState<MapSnapshot[]>([]);

  const fetchSystemOverview = async () => {
    setIsLoadingSystem(true);
    try {
      const res = await fetch('/api/v1/system/overview');
      if (res.ok) {
        const data = await res.json();
        setSystemOverview(data);
      }
    } catch (err) {
      console.warn('Failed to load system overview:', err);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const loadLocalData = () => {
    if (typeof window === 'undefined') return;
    const uid = currentUser?.id || 'guest';
    try {
      const savedHist = localStorage.getItem(`nsight_history_${uid}`);
      if (savedHist) setHistoryItems(JSON.parse(savedHist));
    } catch {}
    try {
      const savedSnap = localStorage.getItem(`nsight_snapshots_${uid}`);
      if (savedSnap) setSnapshots(JSON.parse(savedSnap));
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchSystemOverview();
      loadLocalData();
    }
  }, [isOpen, currentUser]);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    setCacheMessage(null);
    try {
      const res = await fetch('/api/v1/system/cache/clear', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setCacheMessage(data.message || '캐시가 성공적으로 초기화되었습니다.');
        fetchSystemOverview();
      }
    } catch {
      setCacheMessage('캐시 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsClearingCache(false);
      setTimeout(() => setCacheMessage(null), 3500);
    }
  };

  const handleClearHistory = () => {
    const uid = currentUser?.id || 'guest';
    try {
      localStorage.removeItem(`nsight_history_${uid}`);
      setHistoryItems([]);
    } catch {}
  };

  const toggleMenu = (id: DrawerMenuId) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Vertical Left Tab Window (손그림 와이어프레임 구조 구현) */}
      <aside className="relative z-10 w-80 sm:w-96 h-full bg-slate-950/98 border-r border-white/10 shadow-2xl flex flex-col backdrop-blur-2xl animate-in slide-in-from-left duration-200">
        {/* Top Header Bar with Logo (와이어프레임 좌측 상단 NSight 로고) */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <NsightLogo size="sm" showTagline={true} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="탭창 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Title Label Bar (탭창 기능 목록 안내) */}
        <div className="px-4 py-2 border-b border-white/10 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400 font-semibold tracking-wider">
          <span>기능 메뉴</span>
          <span className="text-[10px] text-blue-400 font-mono">NSight Core</span>
        </div>

        {/* Vertical Tab Item List with Separators (와이어프레임 세로 분할 구조) */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/10">
          {/* 0. 화면 양 옆 패널 펼치기 (좌·우측 패널 기본 숨김 해제 & 제어) */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('panels')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'panels'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Columns className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">화면 양 옆 패널 펼치기</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  좌:{isLeftPanelOpen ? '펼침' : '숨김'} · 우:{isRightPanelOpen ? '펼침' : '숨김'}
                </span>
                {activeMenu === 'panels' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'panels' && (
              <div className="px-4 pb-4 pt-1 space-y-3 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  3D 공간 몰입을 위해 기본적으로는 양 옆 패널이 숨겨져 있습니다. 필요 시 아래 버튼으로 화면에 펼치거나 다시 접을 수 있습니다.
                </p>

                {/* Left Panel Card */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-bold text-white">좌측 패널</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isLeftPanelOpen
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {isLeftPanelOpen ? '화면에 펼쳐짐' : '숨겨짐 (기본)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    1·2·3순위 축 가중치 슬라이더, 개인 기준점(Anchor) 및 공간 그리드 제어창
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLeftPanel?.();
                      onClose();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isLeftPanelOpen
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                    }`}
                  >
                    {isLeftPanelOpen ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>좌측 패널 접기</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>좌측 패널 3D 화면에 펼치기</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right Panel Card */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-white">우측 패널</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isRightPanelOpen
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {isRightPanelOpen ? '화면에 펼쳐짐' : '숨겨짐 (기본)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    선택 기사 핵심 3줄 요약, (0,0,0) 원점 3축 인스펙터, 인앱 뉴스 리더
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleRightPanel?.();
                      onClose();
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isRightPanelOpen
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    }`}
                  >
                    {isRightPanelOpen ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>우측 패널 접기</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>우측 패널 3D 화면에 펼치기</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Batch Actions */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBothPanels?.();
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-500/30 text-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Columns className="w-3 h-3 text-cyan-400" />
                    <span>양 옆 패널 모두 펼치기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCloseBothPanels?.();
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                  >
                    <EyeOff className="w-3 h-3 text-slate-400" />
                    <span>양 옆 패널 모두 숨기기</span>
                  </button>
                </div>

                {/* Landing View Settings Card Toggle */}
                {onToggleSettings && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSettings();
                        onClose();
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                        <span>랜딩 상세 설정 카드</span>
                      </span>
                      <span className="text-[10px] text-blue-400 font-mono">
                        {isSettingsOpen ? '화면에서 접기' : '화면에 펼치기'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1. 가중치 조절 (와이어프레임 첫 번째 항목) */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('weights')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'weights'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">가중치 조절</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                  {normalizedWeights[0]}:{normalizedWeights[1]}:{normalizedWeights[2]}
                </span>
                {activeMenu === 'weights' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {/* 가중치 조절 확장 컨트롤 영역 */}
            {activeMenu === 'weights' && (
              <div className="px-4 pb-4 pt-1 space-y-3.5 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1·2·3순위 축의 반영 비중을 조절하여 3D 좌표 공간과 맞춤 기사 순위를 재배치합니다.
                </p>

                {/* 3대 축 슬라이더 */}
                <div className="space-y-3">
                  {rankedAxes.map((axis, idx) => {
                    const badgeStyles = [
                      'text-rose-400 border-rose-500/40 bg-rose-500/15 accent-rose-500',
                      'text-emerald-400 border-emerald-500/40 bg-emerald-500/15 accent-emerald-500',
                      'text-purple-400 border-purple-500/40 bg-purple-500/15 accent-purple-500'
                    ];
                    return (
                      <div key={axis.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeStyles[idx]}`}>
                            {idx + 1}순위 ({idx === 0 ? 'X' : idx === 1 ? 'Y' : 'Z'}) · {axis.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {normalizedWeights[idx]}% ({axis.weight}점)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={axis.weight}
                          onChange={(e) =>
                            onUpdateRankedAxis?.(idx as 0 | 1 | 2, {
                              weight: Number(e.target.value)
                            })
                          }
                          className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${
                            idx === 0
                              ? 'accent-rose-500'
                              : idx === 1
                              ? 'accent-emerald-500'
                              : 'accent-purple-500'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 가중치 빠른 프리셋 버튼 */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset?.(60, 20, 20)}
                    className="py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    1순위 집중 (60:20:20)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset?.(34, 33, 33)}
                    className="py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    균등 배분 (34:33:33)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyWeightPreset?.(45, 45, 10)}
                    className="py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    1·2순위 (45:45:10)
                  </button>
                </div>

                {onToggleLeftPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLeftPanel();
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/30 text-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isLeftPanelOpen ? '좌측 축 제어 패널 화면에서 접기' : '좌측 축 제어 패널 화면에 펼치기'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. 3D 좌표축 순위 설정 */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('axes')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'axes'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">3D 좌표축 순위 설정</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {rankedAxes[0].name.slice(0, 5)}...
                </span>
                {activeMenu === 'axes' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'axes' && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400">
                  각 순위에 배정된 분석 기준을 확인하고 우선순위를 맞교환할 수 있습니다.
                </p>

                <div className="space-y-1.5">
                  {rankedAxes.map((axis, idx) => (
                    <div
                      key={axis.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] font-bold text-blue-400">
                          {idx + 1}순위 축 ({idx === 0 ? 'X' : idx === 1 ? 'Y' : 'Z'})
                        </div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">
                          {axis.name}
                        </div>
                      </div>
                      {idx < 2 && onSwapRankedAxes && (
                        <button
                          type="button"
                          onClick={() => onSwapRankedAxes(idx as 0 | 1 | 2, ((idx + 1) % 3) as 0 | 1 | 2)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title={`${idx + 1}순위와 ${idx + 2}순위 맞교환`}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onOpenCustomSettings}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>3차원 축 커스텀 상세창 열기</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. 검색 노드 수 조절 */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('count')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'count'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">검색 노드 수 조절</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {searchCount}건
                </span>
                {activeMenu === 'count' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'count' && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400">
                  검색 시 실시간 크롤링 및 3D 공간에 시각화할 뉴스 기사 노드 개수입니다.
                </p>
                {setSearchCount && (
                  <div className="grid grid-cols-5 gap-1.5">
                    {[15, 30, 50, 75, 100].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSearchCount(cnt)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          searchCount === cnt
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. 백엔드 엔진 상태 */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('backend')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'backend'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">백엔드 엔진 상태</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeMenu === 'backend' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'backend' && (
              <div className="px-4 pb-4 pt-1 space-y-3 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">서버 런타임</span>
                  <span className="text-emerald-400 font-semibold">
                    {systemOverview?.nodeVersion || 'Node.js 22'} (정상)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">AI 벡터 엔진</span>
                  <span className="text-slate-200">
                    Groq ({systemOverview?.groq?.configuredCount ?? 0}/5) + Gemini 2.5
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">검색 캐시 건수</span>
                  <span className="font-mono text-cyan-400">
                    {systemOverview?.cache?.activeEntries ?? 0} 건
                  </span>
                </div>

                {cacheMessage && (
                  <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{cacheMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={fetchSystemOverview}
                    disabled={isLoadingSystem}
                    className="py-1.5 px-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingSystem ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    disabled={isClearingCache}
                    className="py-1.5 px-2 rounded-lg bg-red-500/15 border border-red-500/30 text-[11px] font-semibold text-red-300 hover:bg-red-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>캐시 비우기</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. 데이터 내보내기 */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('export')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'export'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">데이터 내보내기</span>
              </div>
              <div>
                {activeMenu === 'export' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'export' && (
              <div className="px-4 pb-4 pt-1 space-y-1.5 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-400 mb-2">
                  분석된 3D 좌표 데이터와 시각화 이미지를 파일로 추출합니다.
                </p>
                {onExportCSV && (
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      CSV 스프레드시트 내보내기
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
                {onExportJSON && (
                  <button
                    type="button"
                    onClick={onExportJSON}
                    className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      JSON 원본 데이터 내보내기
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
                {onCapturePNG && (
                  <button
                    type="button"
                    onClick={onCapturePNG}
                    className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      3D Canvas 고화질 PNG 캡처
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 우측 기사 상세 분석 패널 토글 (화면 펼치기) */}
          {onToggleRightPanel && (
            <div className="bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  onToggleRightPanel();
                  onClose();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer text-slate-200 hover:bg-slate-900/70"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm tracking-tight">우측 기사 상세 분석 패널</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isRightPanelOpen
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {isRightPanelOpen ? '화면에서 접기' : '화면에 펼치기'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            </div>
          )}

          {/* 랜딩 상세 설정 카드 토글 (화면 펼치기) */}
          {onToggleSettings && (
            <div className="bg-slate-950/50">
              <button
                type="button"
                onClick={() => {
                  onToggleSettings();
                  onClose();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer text-slate-200 hover:bg-slate-900/70"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-sm tracking-tight">랜딩 상세 설정 카드</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isSettingsOpen
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {isSettingsOpen ? '화면에서 접기' : '화면에 펼치기'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>
            </div>
          )}

          {/* 6. 이력확인 (와이어프레임 하단 항목) */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('query_history')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'query_history'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">이력확인</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {historyItems.length}건
                </span>
                {activeMenu === 'query_history' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'query_history' && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>최근 검색어 이력</span>
                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      전체 삭제
                    </button>
                  )}
                </div>

                {historyItems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-950 rounded-lg">
                    최근 검색한 기록이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {historyItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectHistoryQuery?.(item.query);
                            onClose();
                          }}
                          className="flex-1 text-left text-xs font-semibold text-slate-200 group-hover:text-blue-300 cursor-pointer truncate"
                          title={`${item.query} 재검색`}
                        >
                          {item.query}
                        </button>
                        <span className="text-[10px] text-slate-500 ml-2 shrink-0">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. 히스토리 (스냅샷 보관함 - 와이어프레임 최하단 항목) */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('snapshots')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'snapshots'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">히스토리 (스냅샷)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {snapshots.length}개
                </span>
                {activeMenu === 'snapshots' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'snapshots' && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>저장된 3D 분석 상태</span>
                  <button
                    type="button"
                    onClick={onOpenSnapshots}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    전체 보관함
                  </button>
                </div>

                {snapshots.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-950 rounded-lg">
                    저장된 3D 분석 스냅샷이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {snapshots.slice(0, 5).map((snap) => (
                      <div
                        key={snap.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onLoadSnapshot?.(snap);
                            onClose();
                          }}
                          className="flex-1 text-left text-xs font-semibold text-slate-200 group-hover:text-blue-300 cursor-pointer truncate"
                          title={`'${snap.title}' 복원`}
                        >
                          {snap.title}
                        </button>
                        <span className="text-[10px] text-slate-500 ml-2 shrink-0">
                          {snap.dataset.articles.length}건
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 8. 보안 및 계정 관리 */}
          <div className="bg-slate-950/50">
            <button
              type="button"
              onClick={() => toggleMenu('rbac')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                activeMenu === 'rbac'
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm tracking-tight">보안·계정 관리</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {currentUser ? currentUser.role : '게스트'}
                </span>
                {activeMenu === 'rbac' ? (
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {activeMenu === 'rbac' && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 bg-slate-900/40 border-t border-white/5 animate-in fade-in duration-150">
                {currentUser ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {currentUser.email}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {currentUser.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    로그인 / 계정 등록
                  </button>
                )}

                {currentUser?.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>SMARTLAB 관리자 대시보드</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Action (3D 탐색기 / 홈 이동) */}
        <div className="p-3.5 border-t border-white/10 bg-slate-950 flex items-center justify-between gap-2">
          {appMode === 'EXPLORER' ? (
            <button
              type="button"
              onClick={() => {
                onNavigateHome();
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span>랜딩 홈으로 이동</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onNavigateExplorer();
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/30"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>3D 공간 탐색기로 이동</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-800"
          >
            닫기
          </button>
        </div>
      </aside>
    </div>
  );
};
