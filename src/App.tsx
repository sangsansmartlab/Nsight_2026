import React, { useState, useMemo, useEffect } from 'react';
import { VectorMap3D } from './components/VectorMap3D';
import { LandingView } from './components/LandingView';
import { AuthModal, AuthUser } from './components/AuthModal';
import { SnapshotsDrawer, MapSnapshot, SearchHistoryItem } from './components/SnapshotsDrawer';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RbacGuardModal } from './components/RbacGuardModal';
import { exportArticlesToCSV, exportArticlesToJSON, captureCanvasToPNG } from './utils/exportUtils';
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
  Hash,
  Palette,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Home,
  LogIn,
  Share2,
  Download,
  Camera,
  ShieldAlert,
  History,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { getContinuousColor, isPoliticsDomain } from './utils/colorScale';

// Clean default 4D axes (Presets removed per user specification)
export const DEFAULT_AXES: CustomAxes = {
  x_axis: '규제 중심 (-1.0) ↔ 중심/균형 (0.0) ↔ 산업 진흥 (+1.0)',
  y_axis: '낮은 파급력 (-1.0) ↔ 보통 (0.0) ↔ 높은 사회적 파급력 (+1.0)',
  z_axis: '단순 주장/의혹 (-1.0) ↔ 중립 (0.0) ↔ 공인 실증/신뢰도 (+1.0)',
  color_axis: '기사 성향 (긍정 / 중립 / 비판)'
};

export const App: React.FC = () => {
  // App view mode: 'LANDING' (first screen with prominent search & settings) vs 'EXPLORER' (3D map)
  const [appMode, setAppMode] = useState<'LANDING' | 'EXPLORER'>('LANDING');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nsight_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nsight_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nsight_user');
    } catch {}
  };

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

  // Responsive device detection
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024);

  // Left sidebar collapse / expand state (default collapsed on mobile, open on desktop)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // Search customization settings modal state
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState<boolean>(false);
  
  // 4D Color Guide criteria modal state
  const [isColorGuideOpen, setIsColorGuideOpen] = useState<boolean>(false);
  
  // Default node count set to 30
  const [searchCount, setSearchCount] = useState<number>(30);

  // RBAC & Sharing Modals
  const [isSnapshotsDrawerOpen, setIsSnapshotsDrawerOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isRbacGuardOpen, setIsRbacGuardOpen] = useState<boolean>(false);
  const [rbacGuardFeature, setRbacGuardFeature] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [articleShareToast, setArticleShareToast] = useState<string | null>(null);

  // Custom Axes
  const [customAxes, setCustomAxes] = useState<CustomAxes>({
    x_axis: DEMO_DATASETS['AI 기본법'].axes.x_axis,
    y_axis: DEMO_DATASETS['AI 기본법'].axes.y_axis,
    z_axis: DEMO_DATASETS['AI 기본법'].axes.z_axis,
    color_axis: DEMO_DATASETS['AI 기본법'].axes.color_axis
  });
  // Toggle for 4th dimension (Color axis)
  const [enableColorAxis, setEnableColorAxis] = useState<boolean>(
    Boolean(DEMO_DATASETS['AI 기본법'].axes.color_axis && DEMO_DATASETS['AI 기본법'].axes.color_axis.trim())
  );

  const [axisSaveToast, setAxisSaveToast] = useState<string | null>(null);
  const [searchFeedbackToast, setSearchFeedbackToast] = useState<string | null>(null);

  // Grid visibility states
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showXYGrid, setShowXYGrid] = useState<boolean>(true);
  const [showYZGrid, setShowYZGrid] = useState<boolean>(true);

  // Camera preset command trigger
  const [cameraPresetCommand, setCameraPresetCommand] = useState<string>('RESET');
  const [activePreset, setActivePreset] = useState<string>('RESET');

  // Handle window resizing for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      setIsMobile(mobile);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // RBAC Permission Guard helper
  const requireAuth = (featureName: string, minRole: 'VERIFIED' | 'ADMIN' = 'VERIFIED'): boolean => {
    if (!currentUser) {
      setRbacGuardFeature(featureName);
      setIsRbacGuardOpen(true);
      return false;
    }
    if (minRole === 'ADMIN' && currentUser.role !== 'ADMIN') {
      setRbacGuardFeature(`${featureName} (플랫폼 관리자 전용)`);
      setIsRbacGuardOpen(true);
      return false;
    }
    return true;
  };

  const handleRoleChange = (newRole: 'GUEST' | 'VERIFIED' | 'ADMIN') => {
    if (!currentUser) return;
    const updated: AuthUser = { ...currentUser, role: newRole };
    handleLogin(updated);
  };

  // Export & Share Handlers
  const handleShareSpaceURL = () => {
    if (!requireAuth('3D 지도 고유 링크 공유')) return;
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setAxisSaveToast('3D 공간 공유 링크가 복사되었습니다.');
        setTimeout(() => setAxisSaveToast(null), 3000);
      });
    }
    setIsExportMenuOpen(false);
  };

  const handleCapturePNG = () => {
    if (!requireAuth('3D Canvas 고화질 PNG 캡처')) return;
    captureCanvasToPNG(`NSight_${currentQuery.replace(/\s+/g, '_')}_3D.png`);
    setIsExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    if (!requireAuth('분석 데이터 CSV 내보내기')) return;
    exportArticlesToCSV(currentQuery, filteredArticles, dataset.axes);
    setIsExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    if (!requireAuth('분석 데이터 JSON 내보내기')) return;
    exportArticlesToJSON(currentQuery, filteredArticles, dataset.axes);
    setIsExportMenuOpen(false);
  };

  const handleShareArticle = (art: Article) => {
    const summaryText = art.summary_3lines ? art.summary_3lines.map((l) => `• ${l}`).join('\n') : '';
    const shareText = `[NSight 3D 뉴스 분석]\n📰 제목: ${art.title}\n🏢 언론사: ${art.publisher} (${art.pub_date})\n📍 3D 좌표: X(${art.coordinates.x.toFixed(2)}) Y(${art.coordinates.y.toFixed(2)}) Z(${art.coordinates.z.toFixed(2)})${art.coordinates.color_label ? ` | 🎨 ${art.coordinates.color_label}` : ''}\n📝 3줄 요약:\n${summaryText}\n🔗 원문: ${art.origin_link}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setArticleShareToast('기사 요약 및 3D 분석 데이터가 복사되었습니다.');
        setTimeout(() => setArticleShareToast(null), 3500);
      });
    }
  };

  const handleSelectDataset = (key: string) => {
    setCurrentQuery(key);
    setSearchFilter('');
    const newDataset = DEMO_DATASETS[key];
    setDataset(newDataset);
    setCustomAxes({ ...newDataset.axes });
    setEnableColorAxis(Boolean(newDataset.axes.color_axis && newDataset.axes.color_axis.trim()));
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
    const finalAxes: CustomAxes = {
      ...customAxes,
      color_axis: enableColorAxis ? customAxes.color_axis : ''
    };
    setDataset((prev) => ({
      ...prev,
      axes: finalAxes
    }));
    setAxisSaveToast('설정한 축 기준이 3D 공간에 적용되었습니다.');
    setTimeout(() => setAxisSaveToast(null), 3000);
  };

  // Perform real-time Search & 4D Vectorization
  const handlePerformSearch = async (e?: React.FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();
    const query = (queryOverride || searchFilter).trim();
    if (!query) return;

    if (queryOverride) {
      setSearchFilter(queryOverride);
    }

    setIsSearching(true);
    setIsCustomSettingsOpen(false);

    const axesToUse: CustomAxes = {
      ...customAxes,
      color_axis: enableColorAxis ? customAxes.color_axis : ''
    };

    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          display_count: Math.min(100, Math.max(1, searchCount)),
          custom_axes: axesToUse
        })
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        const dynamicDataset: DatasetItem = {
          id: `dynamic_${Date.now()}`,
          name: query,
          axes: data.axes || axesToUse,
          articles: data.articles
        };
        setDataset(dynamicDataset);
        setCurrentQuery(query);
        setCustomAxes({ ...dynamicDataset.axes });
        setEnableColorAxis(Boolean(dynamicDataset.axes.color_axis && dynamicDataset.axes.color_axis.trim()));
        setSelectedArticle(data.articles[0]);
        setCameraPresetCommand('RESET');
        setActivePreset('RESET');
        setSearchFeedbackToast(null);
        setAppMode('EXPLORER');

        // Automatically record to search history for Verified/Admin users
        if (currentUser) {
          const historyStorageKey = `nsight_history_${currentUser.id}`;
          try {
            const prevHist: SearchHistoryItem[] = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
            const newHistItem: SearchHistoryItem = {
              id: `hist_${Date.now()}`,
              query,
              createdAt: new Date().toLocaleString('ko-KR'),
              count: data.articles.length
            };
            const updatedHist = [newHistItem, ...prevHist.filter((h) => h.query !== query)].slice(0, 50);
            localStorage.setItem(historyStorageKey, JSON.stringify(updatedHist));
          } catch {}
        }
      } else {
        setSearchFeedbackToast(
          data.message || `‘${query}’ 관련 실제 언론사 보도 기사를 찾지 못했습니다. 보다 대중적인 키워드로 검색해 보세요.`
        );
        setTimeout(() => setSearchFeedbackToast(null), 5000);
      }
    } catch (err) {
      console.error('[Search Error]:', err);
      setSearchFeedbackToast('뉴스 수집 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setTimeout(() => setSearchFeedbackToast(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredArticles = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
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

  // Check whether 4D Color axis is actively used in the current dataset
  const isColorAxisActive = Boolean(dataset.axes.color_axis && dataset.axes.color_axis.trim());

  // Render Landing View when on first visit before searching
  if (appMode === 'LANDING') {
    return (
      <>
        <LandingView
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onSearch={handlePerformSearch}
          isSearching={isSearching}
          searchCount={searchCount}
          setSearchCount={setSearchCount}
          customAxes={customAxes}
          setCustomAxes={setCustomAxes}
          enableColorAxis={enableColorAxis}
          setEnableColorAxis={setEnableColorAxis}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSnapshots={() => {
            if (requireAuth('3D 스냅샷 및 검색 히스토리')) {
              setIsSnapshotsDrawerOpen(true);
            }
          }}
          onOpenAdmin={() => {
            if (requireAuth('관리자 대시보드', 'ADMIN')) {
              setIsAdminModalOpen(true);
            }
          }}
          searchFeedbackToast={searchFeedbackToast}
          onClearFeedbackToast={() => setSearchFeedbackToast(null)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <SnapshotsDrawer
          isOpen={isSnapshotsDrawerOpen}
          onClose={() => setIsSnapshotsDrawerOpen(false)}
          userId={currentUser?.id || 'guest'}
          currentDataset={dataset}
          currentAxes={dataset.axes}
          currentQuery={currentQuery}
          onLoadSnapshot={(snapshot) => {
            setDataset(snapshot.dataset);
            setCurrentQuery(snapshot.query);
            setCustomAxes(snapshot.axes);
            setEnableColorAxis(Boolean(snapshot.axes.color_axis && snapshot.axes.color_axis.trim()));
            setSelectedArticle(snapshot.dataset.articles[0] || null);
            setIsSnapshotsDrawerOpen(false);
            setAppMode('EXPLORER');
          }}
          onSelectHistoryQuery={(q) => {
            setSearchFilter(q);
            handlePerformSearch(undefined, q);
            setIsSnapshotsDrawerOpen(false);
          }}
        />
        <AdminDashboardModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          currentUser={currentUser}
          totalArticlesCount={dataset.articles.length}
          currentQuery={currentQuery}
          onRoleChange={handleRoleChange}
        />
        <RbacGuardModal
          isOpen={isRbacGuardOpen}
          onClose={() => setIsRbacGuardOpen(false)}
          featureName={rbacGuardFeature}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      </>
    );
  }

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
          // On mobile touch devices, don't trigger mouse hover tooltips
          if (!isMobile) {
            setHoveredArticle(art);
            if (pos) setHoverPos(pos);
          }
        }}
      />

      {/* Floating 2D UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none p-2 sm:p-4 flex flex-col justify-between">
        
        {/* Top Header Panel (Responsive for Mobile, Tablet, Desktop) */}
        <header className="pointer-events-auto clean-panel p-2.5 sm:p-3.5 rounded-xl border border-white/10 shadow-2xl space-y-2">
          {/* Row 1: Brand & Search Bar & Mobile Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Logo & Branding with Home Navigation */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setAppMode('LANDING')}
                className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
                title="첫 검색 랜딩 화면으로 이동 (홈)"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-base sm:text-lg text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  N
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                      NSight 3D
                    </h1>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-semibold hidden xs:inline">
                      SMARTLAB
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-400 font-medium flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    <span>홈으로 가기</span>
                  </p>
                </div>
              </button>
            </div>

            {/* Clean Responsive Search Bar */}
            <form
              onSubmit={handlePerformSearch}
              className="relative flex items-center bg-slate-900/95 rounded-lg border border-blue-500/40 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all text-xs flex-1 max-w-xs sm:max-w-md min-w-[180px]"
            >
              {/* Settings / Customize Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCustomSettingsOpen(!isCustomSettingsOpen)}
                className={`ml-1 px-2 py-1.5 rounded-md flex items-center gap-1 transition-all ${
                  isCustomSettingsOpen
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="검색 조건 커스터마이징"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] sm:text-[11px] font-semibold">
                  {searchCount}개
                </span>
              </button>

              <div className="w-[1px] h-3.5 bg-slate-700/80 mx-0.5 sm:mx-1" />

              {/* Short & Clean Placeholder */}
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="검색어를 입력하세요"
                aria-label="뉴스 키워드 검색"
                className="bg-transparent text-white placeholder-slate-400 px-2 py-1.5 w-full focus:outline-none text-xs"
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
                className="mr-1 px-2.5 sm:px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center shadow-sm shadow-blue-600/30 shrink-0"
                title="검색 실행"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </form>

            {/* Mobile Left Panel Drawer Trigger Button (Only on Mobile screens) */}
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              className="md:hidden px-2.5 py-1.5 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-blue-500/50 flex items-center gap-1 text-[11px] font-semibold shrink-0"
              title="축 범주 및 공간 설정"
            >
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>축 설정</span>
            </button>
          </div>

          {/* Row 2: Swipeable Horizontal Strip for Camera Presets & Topics (Touch-optimized) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800/80 text-xs">
            {/* Camera View Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0">
              <span className="text-slate-400 px-1 text-[10px] font-medium flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-400" />
                시점:
              </span>
              <button
                onClick={() => handleSetPreset('RESET')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-all ${
                  activePreset === 'RESET'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                3D 입체
              </button>
              <button
                onClick={() => handleSetPreset('FRONT')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                  activePreset === 'FRONT'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                정면
              </button>
              <button
                onClick={() => handleSetPreset('TOP')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                  activePreset === 'TOP'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                평면
              </button>
              <button
                onClick={() => handleSetPreset('SIDE')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                  activePreset === 'SIDE'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                측면
              </button>
            </div>

            {/* User Account / Profile Button in Explorer Top Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 text-[11px] font-semibold transition-all shadow-sm"
                  title="내 계정 정보"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[80px]">{currentUser.name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all shadow-sm"
                  title="로그인 / 회원가입"
                >
                  <LogIn className="w-3 h-3" />
                  <span>로그인</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Anti-Hallucination Search Feedback Toast */}
        {searchFeedbackToast && (
          <div className="pointer-events-auto fixed top-24 left-1/2 -translate-x-1/2 z-50 clean-panel px-4 py-2.5 rounded-xl border border-amber-500/50 bg-slate-900/95 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 max-w-[calc(100vw-2rem)] w-auto">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-snug text-center">{searchFeedbackToast}</span>
            <button
              onClick={() => setSearchFeedbackToast(null)}
              className="ml-auto text-slate-400 hover:text-white p-1"
              title="닫기"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Customization Modal Panel (Responsive Centered Modal with Backdrop) */}
        {isCustomSettingsOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto clean-panel p-4.5 sm:p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">검색 커스터마이징 & 축 설정</h3>
                </div>
                <button
                  onClick={() => setIsCustomSettingsOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Article Count Selection (1 ~ 100, default 30) */}
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                {/* Preset Quick Buttons */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  {[10, 20, 30, 50, 100].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSearchCount(cnt)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${
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

              {/* 2. Custom Axes Configuration Inputs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    분석 축 상세 설정
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {enableColorAxis ? '4차원 (X·Y·Z·Color)' : '3차원 (X·Y·Z)'}
                  </span>
                </div>

                {/* Preset Template Quick Selector */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                  <span className="text-slate-400 shrink-0 mr-1 text-[10px]">프리셋:</span>
                  {Object.entries(AXIS_PRESET_TEMPLATES).map(([name, axes]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setCustomAxes({ ...axes });
                        setEnableColorAxis(Boolean(axes.color_axis && axes.color_axis.trim()));
                        setIsAutoAxesEnabled(false);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                    >
                      {name.split(' ')[0]}
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
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, x_axis: e.target.value });
                        setIsAutoAxesEnabled(false);
                      }}
                      placeholder="예: 진보 성향 (-1.0) ↔ 중도 (0.0) ↔ 보수 성향 (+1.0)"
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
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, y_axis: e.target.value });
                        setIsAutoAxesEnabled(false);
                      }}
                      placeholder="예: 낮은 정국 파급력 (-1.0) ↔ 높은 사회적 논란/파급력 (+1.0)"
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
                      onChange={(e) => {
                        setCustomAxes({ ...customAxes, z_axis: e.target.value });
                        setIsAutoAxesEnabled(false);
                      }}
                      placeholder="예: 정치적 의혹/공방 (-1.0) ↔ 공인 팩트/실증 (+1.0)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 text-xs"
                    />
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
                                color_axis: '기사 성향 (핵심, 우려, 진흥, 윤리, 건설적)'
                              });
                            }
                            setIsAutoAxesEnabled(false);
                          }}
                          className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <Palette className="w-3.5 h-3.5" />
                          4차원 (Color) 색상 축 사용
                        </span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {enableColorAxis ? '4D 활성화' : '3D 기본색 유지'}
                      </span>
                    </div>

                    {enableColorAxis && (
                      <input
                        type="text"
                        value={customAxes.color_axis}
                        onChange={(e) => {
                          setCustomAxes({ ...customAxes, color_axis: e.target.value });
                          setIsAutoAxesEnabled(false);
                        }}
                        placeholder="예: 정치 성향 (보수: 빨강 #EF4444, 진보: 파랑 #3B82F6, 중립: 흰색 #F8FAFC)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-blue-500/30 text-white focus:outline-none focus:border-blue-400 text-xs"
                      />
                    )}
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
          </div>
        )}

        {/* Left Side Controls & Legend Panel (Desktop floating or Mobile drawer) */}
        {isLeftPanelOpen ? (
          <div
            className={`pointer-events-auto z-30 transition-all duration-300 ease-out ${
              isMobile
                ? 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-start p-2'
                : 'absolute top-28 left-4 w-80 max-w-[calc(100vw-2rem)]'
            }`}
          >
            <div
              className={`clean-panel p-3.5 rounded-2xl border border-white/10 shadow-2xl space-y-2.5 max-h-[82vh] overflow-y-auto ${
                isMobile ? 'w-full max-w-sm rounded-b-none border-b-0' : 'w-full'
              }`}
            >
              {/* Header with Collapse / Dismiss Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white">축 범주 & 공간 제어</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="패널 닫기"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>닫기</span>
                </button>
              </div>

              {/* 4D Continuous Color Scale & Criteria */}
              {isColorAxisActive && (
                (() => {
                  const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);
                  return (
                    <div className="clean-panel p-2.5 rounded-xl text-xs space-y-2 border border-slate-700/80 shadow-md">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-200">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <Palette className="w-3.5 h-3.5" />
                          <span>4차원 색상 기준</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          수치별 색상 분기
                        </span>
                      </div>

                      {/* Continuous Gradient Bar */}
                      <div className="space-y-1">
                        <div
                          className="w-full h-2.5 rounded-full border border-white/20 shadow-inner"
                          style={{
                            background: isPol
                              ? 'linear-gradient(to right, #1E3A8A 0%, #2563EB 25%, #93C5FD 45%, #FFFFFF 50%, #FCA5A5 55%, #DC2626 75%, #991B1B 100%)'
                              : 'linear-gradient(to right, #991B1B 0%, #DC2626 25%, #F87171 45%, #FFFFFF 50%, #6EE7B7 55%, #10B981 75%, #064E3B 100%)'
                          }}
                        />

                        {/* Numeric Scale Ticks */}
                        <div className="flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
                          <span>-1.0</span>
                          <span>-0.5</span>
                          <span className="text-white font-bold">0.0</span>
                          <span>+0.5</span>
                          <span>+1.0</span>
                        </div>
                      </div>

                      {/* Meaning of Range Poles */}
                      <div className="grid grid-cols-3 text-center text-[10px] font-semibold pt-1 border-t border-slate-800/80">
                        <div className="text-left text-blue-400">
                          {isPol ? '🔵 진보 (-1.0)' : '🔴 규제/악재'}
                        </div>
                        <div className="text-center text-white">
                          ⚪ 중립 (0.0)
                        </div>
                        <div className="text-right text-rose-400">
                          {isPol ? '🔴 보수 (+1.0)' : '🟢 진흥/호재'}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        💡 수치 크기별 채도·명도 차등 적용 (0에 가까울수록 흰색)
                      </p>
                    </div>
                  );
                })()
              )}

              {/* X · Y · Z Coordinate Axes Breakdown */}
              <div className="clean-panel p-2.5 rounded-xl space-y-2 text-xs shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 tracking-wider flex items-center gap-1.5 text-xs">
                    <span>📐 {isColorAxisActive ? 'X · Y · Z · Color 축' : 'X · Y · Z 3차원 축'}</span>
                  </h3>
                  <button
                    onClick={() => {
                      if (isMobile) setIsLeftPanelOpen(false);
                      setIsCustomSettingsOpen(true);
                    }}
                    className="text-[10px] text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1 transition-colors"
                    title="축 직접 편집하기"
                  >
                    <span>축 편집</span>
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {/* X Axis */}
                  <div className="p-2 rounded-lg bg-slate-900/80 border-l-4 border-rose-500 space-y-0.5">
                    <div className="text-rose-400 font-bold flex justify-between items-center text-xs">
                      <span>X축 (가로 쟁점)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.x_axis}
                    </p>
                  </div>

                  {/* Y Axis */}
                  <div className="p-2 rounded-lg bg-slate-900/80 border-l-4 border-emerald-500 space-y-0.5">
                    <div className="text-emerald-400 font-bold flex justify-between items-center text-xs">
                      <span>Y축 (높이 / 파급력)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.y_axis}
                    </p>
                  </div>

                  {/* Z Axis */}
                  <div className="p-2 rounded-lg bg-slate-900/80 border-l-4 border-purple-500 space-y-0.5">
                    <div className="text-purple-400 font-bold flex justify-between items-center text-xs">
                      <span>Z축 (깊이 / 신뢰도)</span>
                      <span className="text-[10px] font-mono text-slate-400">-1.0 ~ +1.0</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                      {dataset.axes.z_axis}
                    </p>
                  </div>

                  {/* Color Axis */}
                  {isColorAxisActive && (
                    <div className="p-2 rounded-lg bg-slate-900/80 border-l-4 border-blue-500 space-y-0.5">
                      <div className="text-blue-400 font-bold flex justify-between items-center text-xs">
                        <span>Color축 (4차원 성향)</span>
                        <span className="text-[10px] font-mono text-slate-400">색상 지표</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug font-medium break-words">
                        {dataset.axes.color_axis}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scale & Grid Options */}
              <div className="clean-panel p-2.5 rounded-xl space-y-2 text-xs shadow-md">
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
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
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
                      XZ
                    </button>
                    <button
                      onClick={() => setShowXYGrid(!showXYGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        showXYGrid
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      XY
                    </button>
                    <button
                      onClick={() => setShowYZGrid(!showYZGrid)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        showYZGrid
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      YZ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Minimized Floating Button when Collapsed (Desktop only, mobile has top bar button) */
          !isMobile && (
            <div className="pointer-events-auto absolute top-28 left-4 z-30">
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
            </div>
          )
        )}

        {/* Hover Tooltip (Mouse Cursor Following on Desktop only) */}
        {!isMobile && hoveredArticle && (
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

        {/* Right Detail Inspector Panel (Responsive: Desktop floating card / Mobile Bottom Sheet) */}
        {activeSelectedArticle && (
          <aside
            className={`pointer-events-auto z-40 clean-panel shadow-2xl border transition-all ${
              isMobile
                ? 'fixed bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl border-t border-slate-700 p-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 space-y-3'
                : 'absolute top-28 right-4 w-92 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-2xl border-slate-700/80 p-4 space-y-3.5 overflow-y-auto'
            }`}
          >
            {/* Mobile Drag Handle Pill */}
            {isMobile && (
              <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-1 shrink-0" />
            )}

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
                  
                  {/* Color badge with continuous gradient */}
                  {isColorAxisActive && (() => {
                    const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);
                    const colorResult = getContinuousColor(activeSelectedArticle.coordinates.x, isPol);
                    return (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1.5 shadow-sm"
                        style={{
                          backgroundColor:
                            colorResult.hex === '#FFFFFF'
                              ? 'rgba(255, 255, 255, 0.15)'
                              : `${colorResult.hex}25`,
                          color:
                            colorResult.hex === '#FFFFFF'
                              ? '#ffffff'
                              : colorResult.hex,
                          border: `1px solid ${
                            colorResult.hex === '#FFFFFF'
                              ? 'rgba(255, 255, 255, 0.4)'
                              : `${colorResult.hex}55`
                          }`
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block shadow-sm"
                          style={{ backgroundColor: colorResult.hex }}
                        />
                        <span>{colorResult.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                  {activeSelectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm transition-colors shrink-0"
                title="패널 닫기"
              >
                ✕
              </button>
            </div>

            {/* (0,0,0) Origin Coordinates with Center-Balanced Bipolar Bars */}
            <div className="space-y-2 bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                  <span>⚡ (0,0,0) 원점 기준 축별 위치</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  3 Lines
                </span>
              </div>

              {/* X Axis Meter */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] sm:text-[11px]">
                  <span className="text-rose-400 font-bold">
                    X축 ({dataset.axes.x_axis.includes('↔') ? dataset.axes.x_axis.split('↔')[0]?.trim().slice(0, 10) : '가로 쟁점'})
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    {activeSelectedArticle.coordinates.x > 0
                      ? `+${activeSelectedArticle.coordinates.x.toFixed(2)}`
                      : activeSelectedArticle.coordinates.x.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
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
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] sm:text-[11px]">
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
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] sm:text-[11px]">
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

              {/* 4D Continuous Color Spectrum Meter (Only shown when 4D Color Axis is active) */}
              {isColorAxisActive && (() => {
                const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);
                const colorResult = getContinuousColor(activeSelectedArticle.coordinates.x, isPol);
                const percent = ((activeSelectedArticle.coordinates.x + 1) / 2) * 100;
                return (
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                      <span className="font-bold flex items-center gap-1" style={{ color: colorResult.hex === '#FFFFFF' ? '#ffffff' : colorResult.hex }}>
                        <Palette className="w-3 h-3" />
                        <span>4D 색상 지표 ({colorResult.category})</span>
                      </span>
                      <span className="font-mono font-bold" style={{ color: colorResult.hex === '#FFFFFF' ? '#ffffff' : colorResult.hex }}>
                        {colorResult.label}
                      </span>
                    </div>
                    <div
                      className="relative w-full h-2 rounded-full border border-white/20 shadow-inner"
                      style={{
                        background: isPol
                          ? 'linear-gradient(to right, #1E3A8A 0%, #2563EB 25%, #93C5FD 45%, #FFFFFF 50%, #FCA5A5 55%, #DC2626 75%, #991B1B 100%)'
                          : 'linear-gradient(to right, #991B1B 0%, #DC2626 25%, #F87171 45%, #FFFFFF 50%, #6EE7B7 55%, #10B981 75%, #064E3B 100%)'
                      }}
                    >
                      {/* Pin marker for active article coordinate */}
                      <div
                        className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 transition-all duration-300 pointer-events-none"
                        style={{
                          left: `${Math.max(4, Math.min(96, percent))}%`,
                          backgroundColor: colorResult.hex
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-slate-400 px-0.5">
                      <span>{isPol ? '진보 (-1.0)' : '우려 (-1.0)'}</span>
                      <span>0.0 (중립 ⚪)</span>
                      <span>{isPol ? '보수 (+1.0)' : '호재 (+1.0)'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* AI 3-Line Summary */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-300 flex items-center gap-1">
                <span>📝 AI 3줄 요약</span>
              </h4>
              <ul className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {activeSelectedArticle.summary_3lines.map((line, idx) => (
                  <li key={idx} className="leading-snug">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 pb-1">
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
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                title="선택 해제"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}

        {/* Floating Quick Navigation & Zoom Controls (Touch / Mobile / Tablet Optimized) */}
        <div className="pointer-events-auto fixed bottom-3 sm:bottom-4 left-3 sm:left-4 z-30 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setCameraPresetCommand('ZOOM_IN_' + Date.now())}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all text-xs font-bold"
            title="화면 확대 (+)"
            aria-label="화면 확대"
          >
            <ZoomIn className="w-4 h-4 text-sky-400" />
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setCameraPresetCommand('ZOOM_OUT_' + Date.now())}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all text-xs font-bold"
            title="화면 축소 (-)"
            aria-label="화면 축소"
          >
            <ZoomOut className="w-4 h-4 text-sky-400" />
          </button>
          {/* Reset View */}
          <button
            type="button"
            onClick={() => handleSetPreset('RESET')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all text-xs font-bold flex items-center gap-1"
            title="시점 초기화"
            aria-label="시점 초기화"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] hidden md:inline">초기화</span>
          </button>

          {/* Color Guide Button (Only shown when 4D Color axis is active) */}
          {isColorAxisActive && (
            <button
              type="button"
              onClick={() => setIsColorGuideOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
              title="4D 색상 기준 가이드"
              aria-label="4D 색상 기준 가이드"
            >
              <Palette className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] hidden sm:inline">색상 기준</span>
            </button>
          )}
        </div>

        {/* 4D Continuous Color Scale Criteria Modal */}
        {isColorGuideOpen && isColorAxisActive && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto clean-panel p-4.5 sm:p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">4D 색상 기준 및 연속 스펙트럼</h3>
                </div>
                <button
                  onClick={() => setIsColorGuideOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);
                return (
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-200">
                          {isPol ? '🏛️ 정치 도메인 색상 스펙트럼' : '📈 기업·기술·일반 도메인 색상 스펙트럼'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          부호 & 수치별 분기
                        </span>
                      </div>

                      {/* Continuous Gradient Bar */}
                      <div className="space-y-1">
                        <div
                          className="w-full h-3 rounded-full border border-white/20 shadow-inner"
                          style={{
                            background: isPol
                              ? 'linear-gradient(to right, #1E3A8A 0%, #2563EB 25%, #93C5FD 45%, #FFFFFF 50%, #FCA5A5 55%, #DC2626 75%, #991B1B 100%)'
                              : 'linear-gradient(to right, #991B1B 0%, #DC2626 25%, #F87171 45%, #FFFFFF 50%, #6EE7B7 55%, #10B981 75%, #064E3B 100%)'
                          }}
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
                          <span>-1.0</span>
                          <span>-0.5</span>
                          <span className="text-white font-bold">0.0 (중립)</span>
                          <span>+0.5</span>
                          <span>+1.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Criteria Table */}
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-300 text-[11px]">수치 구간별 색상 및 의미 기준:</span>
                      <div className="space-y-1">
                        {isPol ? (
                          <>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#991B1B]">
                              <span className="font-bold text-rose-300">강한 보수 (+0.60 ~ +1.00)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#991B1B]" />
                                <span className="text-[11px] font-mono text-slate-300">짙은 진홍색</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#DC2626]">
                              <span className="font-bold text-rose-400">보수 성향 (+0.25 ~ +0.60)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                                <span className="text-[11px] font-mono text-slate-300">선명한 빨강</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#F87171]">
                              <span className="font-bold text-rose-200">온건 보수 (+0.08 ~ +0.25)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#F87171]" />
                                <span className="text-[11px] font-mono text-slate-300">파스텔 로즈</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-white">
                              <span className="font-bold text-white">중립 / 중도 (-0.08 ~ +0.08)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                                <span className="text-[11px] font-mono text-slate-300">순백색 (기준점)</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#60A5FA]">
                              <span className="font-bold text-sky-200">온건 진보 (-0.25 ~ -0.08)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#60A5FA]" />
                                <span className="text-[11px] font-mono text-slate-300">파스텔 하늘</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#2563EB]">
                              <span className="font-bold text-blue-400">진보 성향 (-0.60 ~ -0.25)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#2563EB]" />
                                <span className="text-[11px] font-mono text-slate-300">로열 블루</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#1E3A8A]">
                              <span className="font-bold text-blue-300">강한 진보 (-1.00 ~ -0.60)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#1E3A8A]" />
                                <span className="text-[11px] font-mono text-slate-300">딥 네이비</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#064E3B]">
                              <span className="font-bold text-emerald-300">강한 진흥/호재 (+0.60 ~ +1.00)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#064E3B]" />
                                <span className="text-[11px] font-mono text-slate-300">딥 에메랄드</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#059669]">
                              <span className="font-bold text-emerald-400">호재/진흥 (+0.25 ~ +0.60)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#059669]" />
                                <span className="text-[11px] font-mono text-slate-300">선명한 에메랄드</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#34D399]">
                              <span className="font-bold text-emerald-200">온건 호재 (+0.08 ~ +0.25)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#34D399]" />
                                <span className="text-[11px] font-mono text-slate-300">파스텔 민트</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-white">
                              <span className="font-bold text-white">중립 / 기준 (-0.08 ~ +0.08)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                                <span className="text-[11px] font-mono text-slate-300">순백색 (원점)</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#F87171]">
                              <span className="font-bold text-rose-300">경미한 우려 (-0.25 ~ -0.08)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#F87171]" />
                                <span className="text-[11px] font-mono text-slate-300">파스텔 코랄</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#DC2626]">
                              <span className="font-bold text-rose-400">규제/우려 (-0.60 ~ -0.25)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                                <span className="text-[11px] font-mono text-slate-300">선명한 레드</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border-l-4 border-[#991B1B]">
                              <span className="font-bold text-rose-300">강한 악재/규제 (-1.00 ~ -0.60)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#991B1B]" />
                                <span className="text-[11px] font-mono text-slate-300">다크 레드</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                      💡 <strong>연속 수치 반영 원칙:</strong> 같은 부호(+ 또는 -)라도 수치 크기에 따라 채도·명도가 정밀하게 비례하여 달라집니다. 원점(0)에 가까운 기사는 백색으로 표시됩니다.
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsColorGuideOpen(false)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                    >
                      확인
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Bottom Status Footer (Compact bottom-right placement to never overlap controls) */}
        {!activeSelectedArticle && (
          <footer className="pointer-events-auto flex items-center gap-3 text-xs text-slate-400 clean-panel px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ml-auto self-end mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] hidden sm:inline">
                상산고등학교 SMARTLAB
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono">
              <span className="text-slate-400">
                노드: {filteredArticles.length}개 ({searchCount}개)
              </span>
            </div>
          </footer>
        )}

        {/* Auth Modal for Explorer View */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default App;
