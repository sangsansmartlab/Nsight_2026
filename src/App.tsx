import React, { useState, useMemo, useEffect, useRef } from 'react';
import { VectorMap3D } from './components/VectorMap3D';
import { LandingView, RANKED_AXIS_PRESETS, RankedAxisPreset } from './components/LandingView';
import { AuthModal, AuthUser } from './components/AuthModal';
import { SnapshotsDrawer, SearchHistoryItem } from './components/SnapshotsDrawer';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RbacGuardModal } from './components/RbacGuardModal';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import {
  exportArticlesToCSV,
  exportArticlesToJSON,
  captureCanvasToPNG
} from './utils/exportUtils';
import {
  buildPortalLinksForArticle,
  buildPortalLinksForQuery
} from './utils/newsPortalLinks';
import { DEMO_DATASETS, DatasetItem } from './data/mockDatasets';
import {
  Article,
  CustomAxes,
  RankedAxisItem,
  ScoredArticle,
  ArticleEvaluation,
  PersonalAnchorVector,
  RelatedPortalArticle
} from './types';
import {
  Box,
  ExternalLink,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Eye,
  Info,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings2,
  RefreshCw,
  Compass,
  Hash,
  Palette,
  ZoomIn,
  ZoomOut,
  Home,
  LogIn,
  Share2,
  Download,
  Camera,
  ShieldAlert,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Target,
  Sparkles,
  Star,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Newspaper,
  CheckCircle2,
  PlusCircle
} from 'lucide-react';
import { getContinuousColor, isPoliticsDomain } from './utils/colorScale';

// Helper to convert a RankedAxisItem into a descriptive CustomAxes string
const formatRankedAxisToString = (item: RankedAxisItem): string => {
  return `${item.name}: ${item.negativeLabel} ↔ 중립 (0.0) ↔ ${item.positiveLabel}`;
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

  // 1st / 2nd / 3rd Priority Ranked Axes State with User-Adjustable Weights
  const [rankedAxes, setRankedAxes] = useState<[RankedAxisItem, RankedAxisItem, RankedAxisItem]>([
    {
      id: 'profit_or_promo',
      name: '수익성 · 산업 진흥',
      negativeLabel: '규제/비용 부담 (-1.0)',
      positiveLabel: '고수익/산업 진흥 (+1.0)',
      preferredDirection: 1,
      weight: 50
    },
    {
      id: 'relevance_or_impact',
      name: '연관성 · 파급력',
      negativeLabel: '국소적 영향 (-1.0)',
      positiveLabel: '핵심 연관/높은 파급력 (+1.0)',
      preferredDirection: 1,
      weight: 30
    },
    {
      id: 'future_or_trust',
      name: '미래 지향성 · 신뢰도',
      negativeLabel: '단기 주장/의혹 (-1.0)',
      positiveLabel: '미래 가치/실증 데이터 (+1.0)',
      preferredDirection: 1,
      weight: 20
    }
  ]);

  // Normalized Percentage Weights [w1%, w2%, w3%] summing to 100%
  const normalizedWeights: [number, number, number] = useMemo(() => {
    const w0 = Math.max(0, Number(rankedAxes[0].weight) || 0);
    const w1 = Math.max(0, Number(rankedAxes[1].weight) || 0);
    const w2 = Math.max(0, Number(rankedAxes[2].weight) || 0);
    const sum = w0 + w1 + w2;
    if (sum <= 0) return [34, 33, 33];
    const p0 = Math.round((w0 / sum) * 100);
    const p1 = Math.round((w1 / sum) * 100);
    const p2 = Math.max(0, 100 - p0 - p1);
    return [p0, p1, p2];
  }, [rankedAxes]);

  // Personal Tendency Profile State
  const [preferredSentiment, setPreferredSentiment] = useState<
    'ALL' | '긍정/지지' | '중립/건설적' | '우려/비판'
  >('ALL');
  const [interestKeywordsInput, setInterestKeywordsInput] = useState<string>(
    'AI주권, 산업진흥, 인프라지원, 글로벌비교'
  );

  const [currentQuery, setCurrentQuery] = useState<string>('AI 기본법');
  const [dataset, setDataset] = useState<DatasetItem>(DEMO_DATASETS['AI 기본법']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(
    DEMO_DATASETS['AI 기본법'].articles[0]
  );
  const [hoveredArticle, setHoveredArticle] = useState<Article | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scaleFactor, setScaleFactor] = useState<number>(12);

  // 3D Coordinate Plane per-article tendency badge & origin vector visibility
  const [show3DTendency, setShow3DTendency] = useState<boolean>(true);

  // Responsive device detection
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  // Left & Right side panels fold/unfold states (Both collapsible; auto-collapse on search)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

  // Search customization & 1·2·3순위 settings modal state
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState<boolean>(false);

  // 4D Color Guide criteria modal state
  const [isColorGuideOpen, setIsColorGuideOpen] = useState<boolean>(false);

  // Default node count set to 30
  const [searchCount, setSearchCount] = useState<number>(30);

  // RBAC & Sharing Modals + In-App Reader Modal
  const [isSnapshotsDrawerOpen, setIsSnapshotsDrawerOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isRbacGuardOpen, setIsRbacGuardOpen] = useState<boolean>(false);
  const [rbacGuardFeature, setRbacGuardFeature] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [articleShareToast, setArticleShareToast] = useState<string | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState<boolean>(false);

  // Personal Article Evaluations & Adaptive Coordinate Axis Evolution State
  const [evaluations, setEvaluations] = useState<Record<string, ArticleEvaluation>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nsight_article_evaluations');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  const [isAdaptiveRecalibrationEnabled, setIsAdaptiveRecalibrationEnabled] =
    useState<boolean>(true);

  // Inline evaluation state in the Right Panel synced with activeSelectedArticle
  const [inlinePreference, setInlinePreference] = useState<1 | 0 | -1>(1);
  const [inlineCalX, setInlineCalX] = useState<number>(0);
  const [inlineCalY, setInlineCalY] = useState<number>(0);
  const [inlineCalZ, setInlineCalZ] = useState<number>(0);

  // Track newly added articles in the current 3D coordinate space & Direct Add Modal state
  const [addedArticleIds, setAddedArticleIds] = useState<string[]>([]);
  const [isAddArticleModalOpen, setIsAddArticleModalOpen] = useState<boolean>(false);
  const [addArticleUrlInput, setAddArticleUrlInput] = useState<string>('');
  const [addArticleTitleInput, setAddArticleTitleInput] = useState<string>('');
  const [addArticlePublisherInput, setAddArticlePublisherInput] = useState<string>('');
  const [addArticleSnippetInput, setAddArticleSnippetInput] = useState<string>('');
  const [isAddingSingleArticle, setIsAddingSingleArticle] = useState<boolean>(false);

  // Custom Axes synced with rankedAxes
  const [customAxes, setCustomAxes] = useState<CustomAxes>({
    x_axis: formatRankedAxisToString(rankedAxes[0]),
    y_axis: formatRankedAxisToString(rankedAxes[1]),
    z_axis: formatRankedAxisToString(rankedAxes[2]),
    color_axis: DEMO_DATASETS['AI 기본법'].axes.color_axis
  });

  // Toggle for 4th dimension (Color axis)
  const [enableColorAxis, setEnableColorAxis] = useState<boolean>(
    Boolean(
      DEMO_DATASETS['AI 기본법'].axes.color_axis &&
        DEMO_DATASETS['AI 기본법'].axes.color_axis.trim()
    )
  );

  const [axisSaveToast, setAxisSaveToast] = useState<string | null>(null);
  const [searchFeedbackToast, setSearchFeedbackToast] = useState<string | null>(null);

  // Grid visibility states
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showXYGrid, setShowXYGrid] = useState<boolean>(true);
  const [showYZGrid, setShowYZGrid] = useState<boolean>(true);

  // Camera preset command trigger (null on mount so initial focus centers on #1 top-matched node)
  const [cameraPresetCommand, setCameraPresetCommand] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('RESET');

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle window resizing for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update a single ranked axis item and sync customAxes
  const handleUpdateRankedAxis = (
    index: 0 | 1 | 2,
    updated: Partial<RankedAxisItem>
  ) => {
    setRankedAxes((prev) => {
      const next: [RankedAxisItem, RankedAxisItem, RankedAxisItem] = [
        { ...prev[0] },
        { ...prev[1] },
        { ...prev[2] }
      ];
      next[index] = { ...next[index], ...updated };

      const nextCustom: CustomAxes = {
        x_axis: formatRankedAxisToString(next[0]),
        y_axis: formatRankedAxisToString(next[1]),
        z_axis: formatRankedAxisToString(next[2]),
        color_axis: enableColorAxis ? customAxes.color_axis : ''
      };
      setCustomAxes(nextCustom);
      setDataset((d) => ({ ...d, axes: nextCustom }));
      return next;
    });
  };

  // Apply quick weight preset (e.g. 50:30:20, 70:20:10, 34:33:33)
  const handleApplyWeightPreset = (w1: number, w2: number, w3: number) => {
    setRankedAxes((prev) => [
      { ...prev[0], weight: w1 },
      { ...prev[1], weight: w2 },
      { ...prev[2], weight: w3 }
    ]);
    setAxisSaveToast(`가중치 비율(${w1}% : ${w2}% : ${w3}%)이 적용되었습니다.`);
    setTimeout(() => setAxisSaveToast(null), 2400);
  };

  // Swap two ranked axes (e.g., 1st <-> 2nd) and immediately swap corresponding article coordinates
  const handleSwapRankedAxes = (indexA: 0 | 1 | 2, indexB: 0 | 1 | 2) => {
    if (indexA === indexB) return;

    setRankedAxes((prev) => {
      const next: [RankedAxisItem, RankedAxisItem, RankedAxisItem] = [
        { ...prev[0] },
        { ...prev[1] },
        { ...prev[2] }
      ];
      const temp = next[indexA];
      next[indexA] = next[indexB];
      next[indexB] = temp;

      const nextCustom: CustomAxes = {
        x_axis: formatRankedAxisToString(next[0]),
        y_axis: formatRankedAxisToString(next[1]),
        z_axis: formatRankedAxisToString(next[2]),
        color_axis: enableColorAxis ? customAxes.color_axis : ''
      };
      setCustomAxes(nextCustom);

      const coordKeyMap: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
      const keyA = coordKeyMap[indexA];
      const keyB = coordKeyMap[indexB];

      setDataset((prevDataset) => {
        const swappedArticles = prevDataset.articles.map((art) => {
          const newCoords = { ...art.coordinates };
          const valA = newCoords[keyA];
          newCoords[keyA] = newCoords[keyB];
          newCoords[keyB] = valA;
          return {
            ...art,
            coordinates: newCoords
          };
        });
        return {
          ...prevDataset,
          axes: nextCustom,
          articles: swappedArticles
        };
      });

      setSelectedArticle((prevSel) => {
        if (!prevSel) return null;
        const newCoords = { ...prevSel.coordinates };
        const valA = newCoords[keyA];
        newCoords[keyA] = newCoords[keyB];
        newCoords[keyB] = valA;
        return { ...prevSel, coordinates: newCoords };
      });

      return next;
    });

    setAxisSaveToast('1·2·3순위 축 순서와 3D 공간 좌표가 즉시 반영되었습니다.');
    setTimeout(() => setAxisSaveToast(null), 2600);
  };

  // Apply a preset of 1st/2nd/3rd ranked axes
  const handleApplyPresetRankedAxes = (preset: RankedAxisPreset) => {
    const nextRanked: [RankedAxisItem, RankedAxisItem, RankedAxisItem] = [
      { ...preset.axes[0] },
      { ...preset.axes[1] },
      { ...preset.axes[2] }
    ];
    setRankedAxes(nextRanked);
    const nextCustom: CustomAxes = {
      x_axis: formatRankedAxisToString(nextRanked[0]),
      y_axis: formatRankedAxisToString(nextRanked[1]),
      z_axis: formatRankedAxisToString(nextRanked[2]),
      color_axis: enableColorAxis ? preset.colorAxis : ''
    };
    setCustomAxes(nextCustom);
    setDataset((prev) => ({
      ...prev,
      axes: nextCustom
    }));
    setAxisSaveToast(`‘${preset.label}’ 1·2·3순위 기준이 적용되었습니다.`);
    setTimeout(() => setAxisSaveToast(null), 2600);
  };

  // RBAC Permission Guard helper
  const requireAuth = (
    featureName: string,
    minRole: 'VERIFIED' | 'ADMIN' = 'VERIFIED'
  ): boolean => {
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

  // Compute Personal Match Score (0~100%) using User-Configured Weights + sentiment + keywords
  const interestKeywordsList = useMemo(() => {
    return interestKeywordsInput
      .split(/[,#]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [interestKeywordsInput]);

  const computeAxisAlignment = (val: number, preferredDir: 1 | 0 | -1): number => {
    if (preferredDir === 1) {
      return Math.max(0, Math.min(1, (val + 1) / 2));
    }
    if (preferredDir === -1) {
      return Math.max(0, Math.min(1, (1 - val) / 2));
    }
    return Math.max(0, Math.min(1, 1 - Math.abs(val)));
  };

  // Compute Personal Ideal Anchor Vector (Px, Py, Pz) from user's article evaluations
  const personalAnchor: PersonalAnchorVector = useMemo(() => {
    const evalList = Object.values(evaluations);
    if (evalList.length === 0) {
      return { x: 0, y: 0, z: 0, evaluationCount: 0 };
    }
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let totalW = 0;

    evalList.forEach((ev) => {
      const signMultiplier = ev.preference === 1 ? 1.0 : ev.preference === -1 ? -0.85 : 0.35;
      const weight = ev.preference === 0 ? 0.5 : 1.0;
      sumX += ev.calibratedCoords.x * signMultiplier * weight;
      sumY += ev.calibratedCoords.y * signMultiplier * weight;
      sumZ += ev.calibratedCoords.z * signMultiplier * weight;
      totalW += weight;
    });

    const clamp = (v: number) => Math.max(-1, Math.min(1, Number(v.toFixed(2))));
    return {
      x: totalW > 0 ? clamp(sumX / totalW) : 0,
      y: totalW > 0 ? clamp(sumY / totalW) : 0,
      z: totalW > 0 ? clamp(sumZ / totalW) : 0,
      evaluationCount: evalList.length
    };
  }, [evaluations]);

  // Save an article evaluation & evolve user's coordinate axes (weights, preferred directions, rank order)
  const handleSaveArticleEvaluation = (
    article: Article,
    preference: 1 | 0 | -1,
    calibratedCoords: { x: number; y: number; z: number }
  ) => {
    const existing = evaluations[article.id];
    const originalCoords = existing
      ? existing.originalCoords
      : {
          x: article.coordinates.x,
          y: article.coordinates.y,
          z: article.coordinates.z
        };

    const newEval: ArticleEvaluation = {
      articleId: article.id,
      title: article.title,
      preference,
      calibratedCoords,
      originalCoords,
      updatedAt: new Date().toLocaleString('ko-KR')
    };

    const nextEvaluations = {
      ...evaluations,
      [article.id]: newEval
    };
    setEvaluations(nextEvaluations);
    try {
      localStorage.setItem('nsight_article_evaluations', JSON.stringify(nextEvaluations));
    } catch {}

    // 1. Update dataset article coordinates with user's calibrated coordinates
    const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);
    const updatedColorInfo = getContinuousColor(calibratedCoords.x, isPol);

    setDataset((prev) => ({
      ...prev,
      articles: prev.articles.map((art) =>
        art.id === article.id
          ? {
              ...art,
              coordinates: {
                ...art.coordinates,
                x: calibratedCoords.x,
                y: calibratedCoords.y,
                z: calibratedCoords.z,
                color_hex: updatedColorInfo.hex,
                color_label: updatedColorInfo.label
              }
            }
          : art
      )
    }));

    setSelectedArticle((prevSel) =>
      prevSel && prevSel.id === article.id
        ? {
            ...prevSel,
            coordinates: {
              ...prevSel.coordinates,
              x: calibratedCoords.x,
              y: calibratedCoords.y,
              z: calibratedCoords.z,
              color_hex: updatedColorInfo.hex,
              color_label: updatedColorInfo.label
            }
          }
        : prevSel
    );

    // 2. Adaptive Axis Evolution: Learn weights & preferred directions from all evaluations
    const evalList = Object.values(nextEvaluations);
    if (evalList.length > 0) {
      setRankedAxes((prevAxes) => {
        const nextAxes: [RankedAxisItem, RankedAxisItem, RankedAxisItem] = [
          { ...prevAxes[0] },
          { ...prevAxes[1] },
          { ...prevAxes[2] }
        ];

        const keys: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
        const signals = keys.map((k) => {
          let dirSum = 0;
          let magSum = 0;
          evalList.forEach((ev) => {
            const mult = ev.preference === 1 ? 1.0 : ev.preference === -1 ? -0.85 : 0.3;
            const val = ev.calibratedCoords[k];
            dirSum += val * mult;
            magSum += Math.abs(val) * (ev.preference === 0 ? 0.5 : 1.0);
          });
          return {
            avgDir: dirSum / evalList.length,
            avgMag: magSum / evalList.length
          };
        });

        const totalMag = signals[0].avgMag + signals[1].avgMag + signals[2].avgMag;

        keys.forEach((_, idx) => {
          const sig = signals[idx];
          // Adapt preferred direction (+1, 0, -1)
          if (sig.avgDir > 0.12) {
            nextAxes[idx].preferredDirection = 1;
          } else if (sig.avgDir < -0.12) {
            nextAxes[idx].preferredDirection = -1;
          } else {
            nextAxes[idx].preferredDirection = 0;
          }

          // Blend user's current weight (68%) with evaluation signal intensity (32%)
          if (totalMag > 0.05) {
            const learnedShare = (sig.avgMag / totalMag) * 100;
            const blended = Math.round(nextAxes[idx].weight * 0.68 + learnedShare * 0.32);
            nextAxes[idx].weight = Math.max(10, Math.min(90, blended));
          }
        });

        return nextAxes;
      });
    }

    setAxisSaveToast(
      `‘${article.title.slice(0, 18)}…’ 평가가 반영되어 개인 기준점과 축 가중치가 진화했습니다.`
    );
    setTimeout(() => setAxisSaveToast(null), 3200);
  };

  // Reset all personal evaluations and restore original coordinates
  const handleResetAllEvaluations = () => {
    setDataset((prev) => ({
      ...prev,
      articles: prev.articles.map((art) => {
        const ev = evaluations[art.id];
        if (!ev) return art;
        return {
          ...art,
          coordinates: {
            ...art.coordinates,
            x: ev.originalCoords.x,
            y: ev.originalCoords.y,
            z: ev.originalCoords.z
          }
        };
      })
    }));
    setEvaluations({});
    try {
      localStorage.removeItem('nsight_article_evaluations');
    } catch {}
    setAxisSaveToast('모든 기사 평가 이력과 보정 좌표가 초기화되었습니다.');
    setTimeout(() => setAxisSaveToast(null), 2600);
  };

  const scoredArticles: ScoredArticle[] = useMemo(() => {
    const queryLower = searchFilter.trim().toLowerCase();
    const isPol = isPoliticsDomain(dataset.axes.color_axis, dataset.axes.x_axis);

    // Apply adaptive coordinate recalibration when enabled and user has evaluations
    const adaptedArticles = dataset.articles.map((article) => {
      const ev = evaluations[article.id];
      if (ev) {
        return {
          ...article,
          coordinates: {
            ...article.coordinates,
            x: ev.calibratedCoords.x,
            y: ev.calibratedCoords.y,
            z: ev.calibratedCoords.z
          }
        };
      }
      if (!isAdaptiveRecalibrationEnabled || personalAnchor.evaluationCount === 0) {
        return article;
      }

      // Subtle adaptive drift toward user's learned axis directions (15% blend) so the 3D space reorganizes around personal evaluations
      const clamp = (n: number) => Math.max(-1, Math.min(1, Number(n.toFixed(2))));
      const nx = clamp(article.coordinates.x * 0.88 + personalAnchor.x * 0.12);
      const ny = clamp(article.coordinates.y * 0.88 + personalAnchor.y * 0.12);
      const nz = clamp(article.coordinates.z * 0.88 + personalAnchor.z * 0.12);
      const cInfo = getContinuousColor(nx, isPol);

      return {
        ...article,
        coordinates: {
          ...article.coordinates,
          x: nx,
          y: ny,
          z: nz,
          color_hex: cInfo.hex
        }
      };
    });

    const baseList = adaptedArticles.filter((article) => {
      if (!queryLower || isSearching) return true;
      const inTitle = article.title.toLowerCase().includes(queryLower);
      const inKeywords = article.keywords.some((kw) => kw.toLowerCase().includes(queryLower));
      const inSummary = article.summary_3lines.some((line) =>
        line.toLowerCase().includes(queryLower)
      );
      const inPublisher = article.publisher.toLowerCase().includes(queryLower);
      return inTitle || inKeywords || inSummary || inPublisher;
    });

    const w1Ratio = normalizedWeights[0] / 100;
    const w2Ratio = normalizedWeights[1] / 100;
    const w3Ratio = normalizedWeights[2] / 100;

    const scored = baseList.map((article) => {
      const s1 = computeAxisAlignment(
        article.coordinates.x,
        rankedAxes[0].preferredDirection
      );
      const s2 = computeAxisAlignment(
        article.coordinates.y,
        rankedAxes[1].preferredDirection
      );
      const s3 = computeAxisAlignment(
        article.coordinates.z,
        rankedAxes[2].preferredDirection
      );

      // Weighted Axis Score using user's custom/learned weights (w1Ratio + w2Ratio + w3Ratio = 1.0)
      let weightedScore = (s1 * w1Ratio + s2 * w2Ratio + s3 * w3Ratio) * 78;

      // Personal Anchor Proximity & Direct Evaluation Bonus
      const userEval = evaluations[article.id];
      if (userEval) {
        if (userEval.preference === 1) weightedScore += 14;
        else if (userEval.preference === -1) weightedScore -= 18;
      } else if (personalAnchor.evaluationCount > 0) {
        const dist = Math.sqrt(
          Math.pow(article.coordinates.x - personalAnchor.x, 2) +
            Math.pow(article.coordinates.y - personalAnchor.y, 2) +
            Math.pow(article.coordinates.z - personalAnchor.z, 2)
        );
        // Closer to personal anchor (0 ~ 3.46) gives up to +8 bonus
        weightedScore += Math.max(0, (1 - dist / 2.2) * 8);
      }

      // Sentiment Preference Bonus (up to +12 pts)
      const label = article.coordinates.color_label || '';
      const xVal = article.coordinates.x;
      if (preferredSentiment === 'ALL') {
        weightedScore += 8;
      } else if (
        preferredSentiment === '긍정/지지' &&
        (xVal > 0.15 || label.includes('긍정') || label.includes('진흥') || label.includes('찬성'))
      ) {
        weightedScore += 12;
      } else if (
        preferredSentiment === '중립/건설적' &&
        (Math.abs(xVal) <= 0.25 || label.includes('중립') || label.includes('균형') || label.includes('기준'))
      ) {
        weightedScore += 12;
      } else if (
        preferredSentiment === '우려/비판' &&
        (xVal < -0.15 || label.includes('우려') || label.includes('비판') || label.includes('규제') || label.includes('반대'))
      ) {
        weightedScore += 12;
      }

      // Personal Interest Keywords Bonus (up to +10 pts)
      if (interestKeywordsList.length > 0) {
        const textBlob = `${article.title} ${article.keywords.join(' ')} ${article.summary_3lines.join(' ')}`.toLowerCase();
        let matchedCount = 0;
        interestKeywordsList.forEach((kw) => {
          if (textBlob.includes(kw)) matchedCount += 1;
        });
        weightedScore += Math.min(10, matchedCount * 4);
      }

      // Query Exact Match Bonus when searching
      if (queryLower) {
        if (article.title.toLowerCase().includes(queryLower)) weightedScore += 6;
        if (article.keywords.some((k) => k.toLowerCase().includes(queryLower)))
          weightedScore += 4;
      }

      const personalScore = Math.max(15, Math.min(99, Math.round(weightedScore)));

      return {
        article,
        personalScore,
        axis1Score: Math.round(s1 * 100),
        axis2Score: Math.round(s2 * 100),
        axis3Score: Math.round(s3 * 100)
      };
    });

    // Sort descending by personalScore so the highest-matching article is ALWAYS at the top (#1)
    scored.sort((a, b) => b.personalScore - a.personalScore);
    return scored;
  }, [
    dataset.articles,
    dataset.axes.color_axis,
    dataset.axes.x_axis,
    evaluations,
    isAdaptiveRecalibrationEnabled,
    personalAnchor,
    searchFilter,
    isSearching,
    rankedAxes,
    normalizedWeights,
    preferredSentiment,
    interestKeywordsList
  ]);

  const filteredArticles = useMemo(
    () => scoredArticles.map((sa) => sa.article),
    [scoredArticles]
  );

  const topMatchedScoredArticle: ScoredArticle | null =
    scoredArticles.length > 0 ? scoredArticles[0] : null;

  const activeSelectedArticle = useMemo(() => {
    if (!selectedArticle) return null;
    const matchInFiltered = filteredArticles.find((a) => a.id === selectedArticle.id);
    return matchInFiltered || filteredArticles[0] || null;
  }, [filteredArticles, selectedArticle]);

  const activeSelectedScore = useMemo(() => {
    if (!activeSelectedArticle) return null;
    return (
      scoredArticles.find((sa) => sa.article.id === activeSelectedArticle.id) || null
    );
  }, [scoredArticles, activeSelectedArticle]);

  // Sync Right Panel inline evaluation controls whenever activeSelectedArticle changes
  useEffect(() => {
    if (!activeSelectedArticle) return;
    const ev = evaluations[activeSelectedArticle.id];
    setInlinePreference(ev ? ev.preference : 1);
    setInlineCalX(
      ev
        ? ev.calibratedCoords.x
        : Number(activeSelectedArticle.coordinates.x.toFixed(2))
    );
    setInlineCalY(
      ev
        ? ev.calibratedCoords.y
        : Number(activeSelectedArticle.coordinates.y.toFixed(2))
    );
    setInlineCalZ(
      ev
        ? ev.calibratedCoords.z
        : Number(activeSelectedArticle.coordinates.z.toFixed(2))
    );
  }, [activeSelectedArticle?.id, evaluations]);

  // All available keywords in current dataset for quick #keyword filtering in dropdown
  const availableKeywords = useMemo(() => {
    const set = new Set<string>();
    dataset.articles.forEach((art) => {
      art.keywords.forEach((kw) => set.add(kw));
    });
    return Array.from(set).slice(0, 10);
  }, [dataset.articles]);

  // When user types in the search bar, auto-collapse left & right panels and focus camera on #1 matched article
  const handleSearchInputChange = (val: string) => {
    setSearchFilter(val);
    setIsSearchDropdownOpen(true);
    setIsLeftPanelOpen(false);
    setIsRightPanelOpen(false);
  };

  const handleSearchInputFocus = () => {
    setIsSearchDropdownOpen(true);
    setIsLeftPanelOpen(false);
    setIsRightPanelOpen(false);
  };

  // Automatically select (press) the #1 highest personal-match node when entering 3D Explorer or loading a dataset
  useEffect(() => {
    if (appMode === 'EXPLORER' && topMatchedScoredArticle) {
      setSelectedArticle(topMatchedScoredArticle.article);
      setIsRightPanelOpen(true);
    }
  }, [dataset.id, appMode]);

  // Auto-focus 3D camera onto the #1 top-matched article when filtering
  useEffect(() => {
    if (searchFilter.trim() && topMatchedScoredArticle) {
      setSelectedArticle(topMatchedScoredArticle.article);
    }
  }, [searchFilter, topMatchedScoredArticle?.article.id]);

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
    const summaryText = art.summary_3lines
      ? art.summary_3lines.map((l) => `• ${l}`).join('\n')
      : '';
    const shareText = `[NSight 3D 뉴스 분석]\n제목: ${art.title}\n언론사: ${art.publisher} (${art.pub_date})\n1·2·3순위 좌표: 1순위[${rankedAxes[0].name} ${normalizedWeights[0]}%](${art.coordinates.x.toFixed(2)}) · 2순위[${rankedAxes[1].name} ${normalizedWeights[1]}%](${art.coordinates.y.toFixed(2)}) · 3순위[${rankedAxes[2].name} ${normalizedWeights[2]}%](${art.coordinates.z.toFixed(2)})\n3줄 요약:\n${summaryText}\n원문: ${art.origin_link}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setArticleShareToast('기사 요약 및 3D 분석 데이터가 클립보드에 복사되었습니다.');
        setTimeout(() => setArticleShareToast(null), 3500);
      });
    }
  };

  const handleSelectDataset = (key: string) => {
    const newDataset = DEMO_DATASETS[key];
    if (!newDataset) return;
    setCurrentQuery(key);
    setSearchFilter('');
    setIsSearchDropdownOpen(false);
    setDataset({
      ...newDataset,
      axes: {
        x_axis: formatRankedAxisToString(rankedAxes[0]),
        y_axis: formatRankedAxisToString(rankedAxes[1]),
        z_axis: formatRankedAxisToString(rankedAxes[2]),
        color_axis: enableColorAxis ? newDataset.axes.color_axis : ''
      }
    });
    setActivePreset('RESET');
    setIsRightPanelOpen(true);
  };

  const handleSetPreset = (preset: string) => {
    setActivePreset(preset);
    setCameraPresetCommand(`${preset}_${Date.now()}`);
  };

  // Apply custom axes to current dataset view immediately and select #1 highest-matching node
  const handleApplyAxesToCurrentView = () => {
    const finalAxes: CustomAxes = {
      x_axis: formatRankedAxisToString(rankedAxes[0]),
      y_axis: formatRankedAxisToString(rankedAxes[1]),
      z_axis: formatRankedAxisToString(rankedAxes[2]),
      color_axis: enableColorAxis ? customAxes.color_axis : ''
    };
    setCustomAxes(finalAxes);
    setDataset((prev) => ({
      ...prev,
      axes: finalAxes
    }));
    if (topMatchedScoredArticle) {
      setSelectedArticle(topMatchedScoredArticle.article);
      setIsRightPanelOpen(true);
    }
    setAxisSaveToast('설정한 1·2·3순위 축, 가중치 및 개인 경향성 기준이 적용되었습니다.');
    setTimeout(() => setAxisSaveToast(null), 3000);
  };

  // Add a single discovered/external article directly into the current 3D coordinate space
  const handleAddSingleArticleToSpace = async (params: {
    url?: string;
    title?: string;
    publisher?: string;
    pub_date?: string;
    snippet?: string;
  }): Promise<Article | null> => {
    const axesToUse: CustomAxes = {
      x_axis: formatRankedAxisToString(rankedAxes[0]),
      y_axis: formatRankedAxisToString(rankedAxes[1]),
      z_axis: formatRankedAxisToString(rankedAxes[2]),
      color_axis: enableColorAxis ? customAxes.color_axis : ''
    };

    setIsAddingSingleArticle(true);
    try {
      const res = await fetch('/api/v1/add-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          custom_axes: axesToUse,
          ranked_axes: rankedAxes
        })
      });

      if (!res.ok) throw new Error('Failed to add article');
      const data = await res.json();
      const addedArt: Article | undefined = data?.article;
      if (!addedArt) throw new Error('Empty article returned');

      const normTitle = (t: string) =>
        t.replace(/[\s\[\]'\"()…·\-_]/g, '').toLowerCase();

      setDataset((prev) => {
        const exists = prev.articles.find(
          (a) => normTitle(a.title) === normTitle(addedArt.title)
        );
        if (exists) {
          return prev;
        }
        return {
          ...prev,
          articles: [addedArt, ...prev.articles]
        };
      });

      setAddedArticleIds((prev) =>
        prev.includes(addedArt.id) ? prev : [addedArt.id, ...prev]
      );
      setSelectedArticle(addedArt);
      setIsRightPanelOpen(true);
      setIsSearchDropdownOpen(false);
      setAppMode('EXPLORER');
      setAxisSaveToast(
        `‘${addedArt.title.slice(0, 22)}…’ 기사가 현재 3D 좌표 공간에 새로운 점으로 추가되었습니다!`
      );
      setTimeout(() => setAxisSaveToast(null), 3500);
      return addedArt;
    } catch (err) {
      console.error('[Add Single Article Error]:', err);
      setSearchFeedbackToast(
        '기사를 3D 좌표에 추가하는 중 오류가 발생했습니다. 제목이나 링크를 확인해 주세요.'
      );
      setTimeout(() => setSearchFeedbackToast(null), 3500);
      return null;
    } finally {
      setIsAddingSingleArticle(false);
    }
  };

  // Perform real-time Search & 4D Vectorization via Express Backend
  // Supports both creating a fresh 3D space (default) and merging into the current 3D space (mergeIntoCurrentSpace = true)
  const handlePerformSearch = async (
    e?: React.FormEvent,
    queryOverride?: string,
    mergeIntoCurrentSpace: boolean = false
  ) => {
    if (e) e.preventDefault();
    const query = (queryOverride || searchFilter || currentQuery).trim();
    if (!query) return;

    if (queryOverride) {
      setSearchFilter(queryOverride);
    }

    setIsSearching(true);
    setIsCustomSettingsOpen(false);
    setIsSearchDropdownOpen(false);
    setIsLeftPanelOpen(false);
    setIsRightPanelOpen(false);

    const axesToUse: CustomAxes = {
      x_axis: formatRankedAxisToString(rankedAxes[0]),
      y_axis: formatRankedAxisToString(rankedAxes[1]),
      z_axis: formatRankedAxisToString(rankedAxes[2]),
      color_axis: enableColorAxis ? customAxes.color_axis : ''
    };

    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          display_count: mergeIntoCurrentSpace
            ? Math.min(20, Math.max(5, Math.floor(searchCount / 2)))
            : Math.min(100, Math.max(1, searchCount)),
          custom_axes: axesToUse,
          ranked_axes: rankedAxes
        })
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        if (mergeIntoCurrentSpace) {
          const normTitle = (t: string) =>
            t.replace(/[\s\[\]'\"()…·\-_]/g, '').toLowerCase();
          const existingNorms = new Set(dataset.articles.map((a) => normTitle(a.title)));
          const freshArticles: Article[] = data.articles.filter(
            (a: Article) => !existingNorms.has(normTitle(a.title))
          );

          if (freshArticles.length > 0) {
            setDataset((prev) => ({
              ...prev,
              articles: [...freshArticles, ...prev.articles]
            }));
            setAddedArticleIds((prev) => [
              ...freshArticles.map((a) => a.id),
              ...prev
            ]);
            setSelectedArticle(freshArticles[0]);
            setIsRightPanelOpen(true);
            setSearchFilter('');
            setAppMode('EXPLORER');
            setAxisSaveToast(
              `‘${query}’ 관련 신규 기사 ${freshArticles.length}건이 현재 3D 좌표 공간에 누적 추가되었습니다!`
            );
            setTimeout(() => setAxisSaveToast(null), 3500);
          } else {
            setAxisSaveToast(`‘${query}’ 검색 기사가 이미 현재 3D 좌표 공간에 포함되어 있습니다.`);
            setTimeout(() => setAxisSaveToast(null), 3000);
          }
        } else {
          const dynamicDataset: DatasetItem = {
            id: `dynamic_${Date.now()}`,
            name: query,
            axes: data.axes || axesToUse,
            articles: data.articles
          };
          setDataset(dynamicDataset);
          setAddedArticleIds([]);
          setCurrentQuery(query);
          setSearchFilter('');
          setCustomAxes({ ...dynamicDataset.axes });
          setEnableColorAxis(
            Boolean(dynamicDataset.axes.color_axis && dynamicDataset.axes.color_axis.trim())
          );
          setActivePreset('RESET');
          setSearchFeedbackToast(null);
          setIsRightPanelOpen(true);
          setAppMode('EXPLORER');
        }

        if (currentUser) {
          const historyStorageKey = `nsight_history_${currentUser.id}`;
          try {
            const prevHist: SearchHistoryItem[] = JSON.parse(
              localStorage.getItem(historyStorageKey) || '[]'
            );
            const newHistItem: SearchHistoryItem = {
              id: `hist_${Date.now()}`,
              query,
              createdAt: new Date().toLocaleString('ko-KR'),
              count: data.articles.length
            };
            const updatedHist = [
              newHistItem,
              ...prevHist.filter((h) => h.query !== query)
            ].slice(0, 50);
            localStorage.setItem(historyStorageKey, JSON.stringify(updatedHist));
          } catch {}
        }
      } else {
        setSearchFeedbackToast(
          data.message ||
            `‘${query}’ 관련 실제 언론사 보도 기사를 찾지 못했습니다. 다른 키워드로 검색해 보세요.`
        );
        setTimeout(() => setSearchFeedbackToast(null), 5000);
      }
    } catch (err) {
      console.error('[Search Error]:', err);
      setSearchFeedbackToast(
        '실시간 뉴스 수집 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
      setTimeout(() => setSearchFeedbackToast(null), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  // Check whether 4D Color axis is actively used in the current dataset
  const isColorAxisActive = Boolean(
    dataset.axes.color_axis && dataset.axes.color_axis.trim()
  );

  // Render Landing View when in LANDING mode
  if (appMode === 'LANDING') {
    return (
      <>
        <LandingView
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          onSearch={handlePerformSearch}
          onEnterExplorer={() => {
            handleApplyAxesToCurrentView();
            setAppMode('EXPLORER');
          }}
          isSearching={isSearching}
          searchCount={searchCount}
          setSearchCount={setSearchCount}
          customAxes={customAxes}
          setCustomAxes={setCustomAxes}
          rankedAxes={rankedAxes}
          normalizedWeights={normalizedWeights}
          onUpdateRankedAxis={handleUpdateRankedAxis}
          onApplyWeightPreset={handleApplyWeightPreset}
          onSwapRankedAxes={handleSwapRankedAxes}
          onApplyPresetRankedAxes={handleApplyPresetRankedAxes}
          preferredSentiment={preferredSentiment}
          setPreferredSentiment={setPreferredSentiment}
          interestKeywordsInput={interestKeywordsInput}
          setInterestKeywordsInput={setInterestKeywordsInput}
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
            setEnableColorAxis(
              Boolean(snapshot.axes.color_axis && snapshot.axes.color_axis.trim())
            );
            setIsSnapshotsDrawerOpen(false);
            setIsRightPanelOpen(true);
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
        rankedAxes={rankedAxes}
        selectedArticle={activeSelectedArticle}
        hoveredArticle={hoveredArticle}
        topMatchedArticleId={topMatchedScoredArticle?.article.id || null}
        personalAnchor={personalAnchor}
        evaluatedArticleIds={Object.keys(evaluations)}
        addedArticleIds={addedArticleIds}
        scaleFactor={scaleFactor}
        showFloorGrid={showFloorGrid}
        showXYGrid={showXYGrid}
        showYZGrid={showYZGrid}
        show3DTendency={show3DTendency}
        cameraPresetCommand={cameraPresetCommand}
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          if (art) {
            setIsRightPanelOpen(true);
            setIsSearchDropdownOpen(false);
          }
        }}
        onHoverArticle={(art, pos) => {
          if (!isMobile) {
            setHoveredArticle(art);
            if (pos) setHoverPos(pos);
          }
        }}
      />

      {/* Floating 2D UI Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none p-2 sm:p-3.5 flex flex-col justify-between">
        {/* TOP SECTION: Header + Standalone Center Floating Search Bar Directly Below Header */}
        <div className="space-y-2">
          {/* 1. Top Header Bar */}
          <header className="pointer-events-auto clean-panel px-3 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center justify-between gap-2 flex-wrap">
            {/* Brand & Home Navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAppMode('LANDING')}
                className="flex items-center gap-2 text-left group cursor-pointer"
                title="첫 랜딩 화면으로 이동 (홈)"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  N
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                      NSight 3D
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                    <Home className="w-2.5 h-2.5" />
                    <span>랜딩 홈</span>
                  </p>
                </div>
              </button>
            </div>

            {/* Camera View Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
              <span className="text-slate-400 px-1 text-[10px] font-medium flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-400" />
                <span className="hidden xs:inline">시점:</span>
              </span>
              {[
                { id: 'RESET', label: '3D 입체' },
                { id: 'FRONT', label: '정면(XY)' },
                { id: 'TOP', label: '평면(XZ)' },
                { id: 'SIDE', label: '측면(YZ)' }
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSetPreset(v.id)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-all whitespace-nowrap ${
                    activePreset === v.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Right Actions: Priority Axis & Weight Settings, Snapshots, Export, Admin, Auth */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomSettingsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all whitespace-nowrap"
                title="좌표축 1·2·3순위, 가중치(%) 및 개인 경향성 설정"
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  축 순위·가중치 ({normalizedWeights[0]}:{normalizedWeights[1]}:{normalizedWeights[2]})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (requireAuth('3D 스냅샷 및 검색 히스토리')) {
                    setIsSnapshotsDrawerOpen(true);
                  }
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 text-[11px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap"
                title="스냅샷 및 검색 히스토리"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">스냅샷</span>
              </button>

              {/* Export / Share Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500/50 text-[11px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap"
                  title="데이터 내보내기 및 공유"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">내보내기</span>
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 clean-panel p-1.5 rounded-xl border border-slate-700 shadow-2xl z-50 text-xs space-y-1">
                    <button
                      type="button"
                      onClick={handleShareSpaceURL}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-left"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>3D 공간 링크 복사</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCapturePNG}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-left"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>3D 화면 PNG 캡처</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-left"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>분석 데이터 CSV 저장</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>분석 데이터 JSON 저장</span>
                    </button>
                  </div>
                )}
              </div>

              {currentUser?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all"
                  title="관리자 대시보드"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-all whitespace-nowrap"
                  title="내 계정 정보"
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[70px]">{currentUser.name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3 h-3" />
                  <span>로그인</span>
                </button>
              )}
            </div>
          </header>

          {/* 2. Standalone Center Floating Search Bar Directly Below Header (Never Obscured, Auto-Collapses Side Panels) */}
          <div
            ref={searchContainerRef}
            className="pointer-events-auto relative z-30 mx-auto w-full max-w-2xl"
          >
            <form
              onSubmit={handlePerformSearch}
              className="flex items-center bg-slate-900/95 backdrop-blur-md rounded-xl border-2 border-blue-500/60 shadow-2xl shadow-blue-500/15 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all p-1"
            >
              <div className="flex items-center gap-1.5 pl-2.5 pr-2 text-blue-400 text-xs font-bold shrink-0">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">기사 검색</span>
              </div>

              <div className="w-[1px] h-4 bg-slate-700/80 mr-1 shrink-0" />

              <input
                type="text"
                value={searchFilter}
                onFocus={handleSearchInputFocus}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="키워드 입력 시 3D 노드 실시간 필터링 & 맞춤 1위 포커스 (Enter: 신규 뉴스 실시간 탐색)"
                aria-label="기사 검색 및 실시간 탐색"
                className="bg-transparent text-white placeholder-slate-400 px-2 py-1.5 w-full focus:outline-none text-xs sm:text-sm font-medium"
              />

              {/* Filtered Node Count Indicator */}
              <span className="text-[11px] font-mono tabular-nums text-slate-400 px-2 shrink-0 hidden xs:inline">
                {filteredArticles.length}/{dataset.articles.length}개
              </span>

              {searchFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-1 shrink-0"
                  title="검색어 지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={isSearching || !searchFilter.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/30 shrink-0 whitespace-nowrap"
                title="입력한 키워드로 새로운 3D 좌표 공간 생성"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>탐색 중</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>새로 탐색</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSearching || !searchFilter.trim()}
                onClick={() => handlePerformSearch(undefined, searchFilter, true)}
                className="ml-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap"
                title="현재 3D 좌표 공간을 유지한 채 검색된 기사들을 새로운 점으로 누적 추가"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ 현재 좌표에 추가</span>
                <span className="sm:hidden">+추가</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddArticleModalOpen(true)}
                className="ml-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs transition-all flex items-center gap-1 shrink-0 whitespace-nowrap"
                title="외부 뉴스 URL이나 기사 제목을 직접 입력해 현재 3D 좌표에 추가"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">기사 직접 추가</span>
              </button>
            </form>

            {/* Live Search Results Dropdown (Sorted by Personal Tendency & User-Configured Weight Score) */}
            {isSearchDropdownOpen && (
              <div className="mt-1.5 w-full clean-panel rounded-2xl border border-blue-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden text-xs animate-in fade-in duration-150">
                {/* Top Summary Bar: Active Personal Criteria & Priority Weights */}
                <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>
                      내 가중치 정렬: 1순위[{rankedAxes[0].name} {normalizedWeights[0]}%] · 2순위[{rankedAxes[1].name} {normalizedWeights[1]}%] · 3순위[{rankedAxes[2].name} {normalizedWeights[2]}%]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchDropdownOpen(false);
                        setIsCustomSettingsOpen(true);
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline whitespace-nowrap"
                    >
                      순위·가중치 조절
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchDropdownOpen(false)}
                      className="text-slate-400 hover:text-white p-0.5"
                      title="드롭다운 닫기"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Direct External News Media Portal Bar for Search Query */}
                {(() => {
                  const qLinks = buildPortalLinksForQuery(searchFilter || currentQuery);
                  return (
                    <div className="px-3.5 py-2 bg-slate-900/95 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          ‘{(searchFilter || currentQuery).trim()}’ 외부 뉴스 매개체 바로 열기:
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <a
                          href={qLinks.naver}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <span>N 네이버 뉴스</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={qLinks.google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <span>G 구글 뉴스</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={qLinks.daum}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <span>D 다음 뉴스</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Web Search Action Trigger (When user types a search query) */}
                {searchFilter.trim() && (
                  <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 border-b border-blue-500/30 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300 min-w-0">
                      <Sparkles className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                      <span className="truncate">
                        ‘<strong className="text-white">{searchFilter}</strong>’ 실시간 웹 뉴스 수집 & Groq 4D 분석
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isSearching}
                        onClick={() => handlePerformSearch(undefined, searchFilter, false)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="입력한 키워드로 웹 전체 실시간 뉴스 수집 및 4D 벡터화 (Enter)"
                      >
                        {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        <span>새 3D 공간 탐색 (Enter)</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSearching}
                        onClick={() => handlePerformSearch(undefined, searchFilter, true)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="현재 3D 좌표 공간에 검색된 기사를 새로운 점으로 추가"
                      >
                        <PlusCircle className="w-3 h-3 text-cyan-300" />
                        <span>+ 현재 좌표에 추가</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick #Keyword Filter Bar */}
                {availableKeywords.length > 0 && (
                  <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-slate-400 shrink-0">추천 키워드:</span>
                    {availableKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleSearchInputChange(kw)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                          searchFilter.toLowerCase() === kw.toLowerCase()
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        #{kw}
                      </button>
                    ))}
                  </div>
                )}

                {/* Ranked Article Results List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/70">
                  {scoredArticles.length === 0 ? (
                    <div className="p-5 text-center space-y-2.5">
                      <p className="text-slate-400 text-xs">
                        현재 로드된 노드 중 ‘{searchFilter}’와 일치하는 기사가 없습니다.
                      </p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handlePerformSearch(undefined, searchFilter, true)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>‘{searchFilter}’ 기사를 찾아 현재 3D 좌표에 누적 추가하기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePerformSearch(undefined, searchFilter, false)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>‘{searchFilter}’ 새 3D 공간으로 탐색</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    scoredArticles.map((item, idx) => {
                      const { article, personalScore } = item;
                      const isTop1 = idx === 0;
                      const isSel = activeSelectedArticle?.id === article.id;
                      const hasEval = Boolean(evaluations[article.id]);
                      const isNewlyAdded = addedArticleIds.includes(article.id);
                      const artLinks = buildPortalLinksForArticle(article);
                      return (
                        <div
                          key={article.id}
                          className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-start justify-between gap-3 ${
                            isSel
                              ? 'bg-blue-600/20 hover:bg-blue-600/25'
                              : isTop1
                              ? 'bg-amber-500/10 hover:bg-amber-500/15'
                              : 'hover:bg-slate-900/90'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsSearchDropdownOpen(false);
                              setIsRightPanelOpen(true);
                            }}
                            className="space-y-1 min-w-0 flex-1 text-left"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isTop1 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] whitespace-nowrap">
                                  ★ 맞춤 1위 ({personalScore}% 일치)
                                </span>
                              )}
                              {!isTop1 && (
                                <span className="text-[10px] font-mono tabular-nums text-blue-400 font-semibold">
                                  #{idx + 1} · 맞춤 {personalScore}%
                                </span>
                              )}
                              {isNewlyAdded && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 font-extrabold text-[10px]">
                                  NEW 좌표 추가됨
                                </span>
                              )}
                              {hasEval && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                                  ★ 내 평가 반영
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                · {article.publisher} · {article.pub_date}
                              </span>
                            </div>
                            <p className="font-bold text-white text-xs truncate">
                              {article.title}
                            </p>
                          </button>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedArticle(article);
                                  setIsSearchDropdownOpen(false);
                                  setIsReaderModalOpen(true);
                                }}
                                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1"
                                title="인앱 뉴스 리더 모달로 기사 펼치기 및 평가"
                              >
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>인앱 리더</span>
                              </button>
                              <a
                                href={artLinks.naver}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]"
                                title="네이버 뉴스에서 이 기사 검색 결과 열기"
                              >
                                N뉴스
                              </a>
                            </div>
                            <div className="font-mono tabular-nums text-[10px] text-slate-400">
                              1순위 {article.coordinates.x >= 0 ? '+' : ''}
                              {article.coordinates.x.toFixed(2)} · 2순위{' '}
                              {article.coordinates.y >= 0 ? '+' : ''}
                              {article.coordinates.y.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        {(searchFeedbackToast || axisSaveToast || articleShareToast) && (
          <div className="pointer-events-auto fixed top-28 left-1/2 -translate-x-1/2 z-50 clean-panel px-4 py-2 rounded-xl border border-amber-500/50 bg-slate-900/95 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2 max-w-[calc(100vw-2rem)]">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{searchFeedbackToast || axisSaveToast || articleShareToast}</span>
            <button
              onClick={() => {
                setSearchFeedbackToast(null);
                setAxisSaveToast(null);
                setArticleShareToast(null);
              }}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search Customization & 1st/2nd/3rd Priority Ranked Axes + Weight Modal */}
        {isCustomSettingsOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto clean-panel p-4.5 sm:p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    좌표축 1·2·3순위 & 개인 가중치(%) · 경향성 커스터마이징
                  </h3>
                </div>
                <button
                  onClick={() => setIsCustomSettingsOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Domain Ranked Axis Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">분야별 추천 순위 프리셋:</span>
                {RANKED_AXIS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPresetRankedAxes(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-slate-200 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Weight Ratio Quick Presets Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-semibold">반영 가중치 비율:</span>
                  <span className="font-mono tabular-nums font-bold text-amber-300">
                    1순위 {normalizedWeights[0]}% : 2순위 {normalizedWeights[1]}% : 3순위 {normalizedWeights[2]}%
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleApplyWeightPreset(50, 30, 20)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    기본 (50:30:20)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWeightPreset(70, 20, 10)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    1순위 집중 (70:20:10)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWeightPreset(34, 33, 33)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono"
                  >
                    균등 (34:33:33)
                  </button>
                </div>
              </div>

              {/* 1st / 2nd / 3rd Priority Axes Configuration + Weight Sliders */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>각 축의 가중치(0~100)를 슬라이더나 숫자로 직접 조절하세요</span>
                  <span className="font-mono text-amber-400">↑/↓ 클릭 시 순위·좌표 즉시 스왑</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {rankedAxes.map((axisItem, idx) => {
                    const rankIdx = idx as 0 | 1 | 2;
                    const colors = [
                      'border-rose-500/40 text-rose-400',
                      'border-emerald-500/40 text-emerald-400',
                      'border-purple-500/40 text-purple-400'
                    ];
                    const accents = ['accent-rose-500', 'accent-emerald-500', 'accent-purple-500'];
                    const axisCode = [
                      `X축 (1순위 · ${normalizedWeights[0]}%)`,
                      `Y축 (2순위 · ${normalizedWeights[1]}%)`,
                      `Z축 (3순위 · ${normalizedWeights[2]}%)`
                    ][rankIdx];

                    return (
                      <div
                        key={axisItem.id + idx}
                        className={`p-3 rounded-xl bg-slate-900 border ${colors[rankIdx]} space-y-2`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">{axisCode}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={rankIdx === 0}
                              onClick={() =>
                                handleSwapRankedAxes(rankIdx, (rankIdx - 1) as 0 | 1 | 2)
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
                              title="순위 올리기"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={rankIdx === 2}
                              onClick={() =>
                                handleSwapRankedAxes(rankIdx, (rankIdx + 1) as 0 | 1 | 2)
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
                              title="순위 내리기"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Individual Weight Control */}
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-300 font-semibold">가중치 조절</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={axisItem.weight}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  handleUpdateRankedAxis(rankIdx, {
                                    weight: isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
                                  });
                                }}
                                className="w-12 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-center font-mono tabular-nums font-bold text-amber-300 text-[11px] focus:outline-none"
                              />
                              <span className="text-slate-400 font-mono">
                                ({normalizedWeights[rankIdx]}%)
                              </span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={axisItem.weight}
                            onChange={(e) =>
                              handleUpdateRankedAxis(rankIdx, {
                                weight: Number(e.target.value)
                              })
                            }
                            className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${accents[rankIdx]}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block">기준명</label>
                          <input
                            type="text"
                            value={axisItem.name}
                            onChange={(e) =>
                              handleUpdateRankedAxis(rankIdx, { name: e.target.value })
                            }
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-[10px]">
                          <input
                            type="text"
                            value={axisItem.negativeLabel}
                            onChange={(e) =>
                              handleUpdateRankedAxis(rankIdx, { negativeLabel: e.target.value })
                            }
                            placeholder="음(-1.0) 설명"
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                          />
                          <input
                            type="text"
                            value={axisItem.positiveLabel}
                            onChange={(e) =>
                              handleUpdateRankedAxis(rankIdx, { positiveLabel: e.target.value })
                            }
                            placeholder="양(+1.0) 설명"
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                          {[
                            { dir: 1 as const, label: '양(+) 선호' },
                            { dir: 0 as const, label: '중립 선호' },
                            { dir: -1 as const, label: '음(-) 선호' }
                          ].map((opt) => (
                            <button
                              key={opt.dir}
                              type="button"
                              onClick={() =>
                                handleUpdateRankedAxis(rankIdx, { preferredDirection: opt.dir })
                              }
                              className={`py-1 rounded font-semibold ${
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
                    );
                  })}
                </div>
              </div>

              {/* Personal Sentiment & Interest Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    선호 기사 성향 (검색 최상단 노출 기준)
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['ALL', '긍정/지지', '중립/건설적', '우려/비판'] as const).map((sent) => (
                      <button
                        key={sent}
                        type="button"
                        onClick={() => setPreferredSentiment(sent)}
                        className={`py-1.5 px-1.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
                          preferredSentiment === sent
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {sent === 'ALL' ? '전체' : sent}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200 block">
                    내 관심 키워드 (쉼표 구분)
                  </label>
                  <input
                    type="text"
                    value={interestKeywordsInput}
                    onChange={(e) => setInterestKeywordsInput(e.target.value)}
                    placeholder="예: AI주권, 수익성, 반도체, 투자"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Article Count & 4D Color Axis */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                    실시간 수집 기사 수량: {searchCount}개
                  </span>
                  <div className="flex gap-1">
                    {[10, 20, 30, 50, 100].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSearchCount(cnt)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          searchCount === cnt
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cnt}개
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableColorAxis}
                      onChange={(e) => setEnableColorAxis(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600"
                    />
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Palette className="w-3.5 h-3.5" />
                      4차원 (Color) 연속 색상 축 사용
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyAxesToCurrentView();
                    setIsCustomSettingsOpen(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>현재 3D 화면에 즉시 적용</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyAxesToCurrentView();
                    handlePerformSearch();
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>이 기준으로 실시간 재탐색</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEFT SIDE PANEL: Collapsible 1·2·3순위 Axes, Live Weight Sliders & 3D Space Controls */}
        {isLeftPanelOpen ? (
          <div
            className={`pointer-events-auto z-20 transition-all duration-200 ${
              isMobile
                ? 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-start p-2 z-40'
                : 'absolute top-28 left-3.5 w-80 max-w-[calc(100vw-2rem)]'
            }`}
          >
            <div
              className={`clean-panel p-3.5 rounded-2xl border border-white/10 shadow-2xl space-y-2.5 max-h-[calc(100vh-9rem)] overflow-y-auto ${
                isMobile ? 'w-full max-w-sm' : 'w-full'
              }`}
            >
              {/* Header with Collapse Toggle Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white">
                    1·2·3순위 축 · 가중치 & 공간 제어
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="좌측 패널 접기"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>접기</span>
                </button>
              </div>

              {/* Adaptive Personal Evaluation Status & Coordinate Recalibration Card */}
              <div className="clean-panel p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/15 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    개인 평가 기반 좌표축 진화
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono text-[10px] font-bold">
                    {personalAnchor.evaluationCount}건 평가됨
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  <span>내 기준점(Anchor):</span>
                  <span className="text-cyan-300 font-bold">
                    ({personalAnchor.x >= 0 ? '+' : ''}
                    {personalAnchor.x.toFixed(2)}, {personalAnchor.y >= 0 ? '+' : ''}
                    {personalAnchor.y.toFixed(2)}, {personalAnchor.z >= 0 ? '+' : ''}
                    {personalAnchor.z.toFixed(2)})
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAdaptiveRecalibrationEnabled(!isAdaptiveRecalibrationEnabled)
                    }
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                      isAdaptiveRecalibrationEnabled
                        ? 'bg-cyan-600/30 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isAdaptiveRecalibrationEnabled
                      ? '개인 평가 3D 재정렬 ON'
                      : '개인 평가 3D 재정렬 OFF'}
                  </button>
                  {personalAnchor.evaluationCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetAllEvaluations}
                      className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-[10px] font-semibold"
                      title="평가 이력 및 보정 좌표 초기화"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </div>

              {/* 1st / 2nd / 3rd Priority Coordinate Axes Breakdown with Instant Rank Swap & Weight Sliders */}
              <div className="clean-panel p-2.5 rounded-xl space-y-2 text-xs border border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <span>1 · 2 · 3순위 축 & 가중치 조절</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCustomSettingsOpen(true)}
                    className="text-[10px] text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>상세 편집</span>
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {rankedAxes.map((item, idx) => {
                    const rankIdx = idx as 0 | 1 | 2;
                    const borderColors = [
                      'border-rose-500',
                      'border-emerald-500',
                      'border-purple-500'
                    ];
                    const textColors = [
                      'text-rose-400',
                      'text-emerald-400',
                      'text-purple-400'
                    ];
                    const accents = [
                      'accent-rose-500',
                      'accent-emerald-500',
                      'accent-purple-500'
                    ];
                    const axisCode = [
                      `1순위·X (${normalizedWeights[0]}%)`,
                      `2순위·Y (${normalizedWeights[1]}%)`,
                      `3순위·Z (${normalizedWeights[2]}%)`
                    ][rankIdx];

                    return (
                      <div
                        key={item.id + idx}
                        className={`p-2 rounded-lg bg-slate-900/90 border-l-4 ${borderColors[rankIdx]} space-y-1`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`${textColors[rankIdx]} font-bold text-xs truncate`}>
                            {axisCode}: {item.name}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={rankIdx === 0}
                              onClick={() =>
                                handleSwapRankedAxes(rankIdx, (rankIdx - 1) as 0 | 1 | 2)
                              }
                              className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-25 text-slate-300"
                              title="순위 올리기"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={rankIdx === 2}
                              onClick={() =>
                                handleSwapRankedAxes(rankIdx, (rankIdx + 1) as 0 | 1 | 2)
                              }
                              className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-25 text-slate-300"
                              title="순위 내리기"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Live Weight Slider in Left Panel */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 shrink-0">가중치:</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.weight}
                            onChange={(e) =>
                              handleUpdateRankedAxis(rankIdx, {
                                weight: Number(e.target.value)
                              })
                            }
                            className={`flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${accents[rankIdx]}`}
                          />
                          <span className="text-[10px] font-mono tabular-nums text-amber-300 font-bold w-9 text-right">
                            {normalizedWeights[rankIdx]}%
                          </span>
                        </div>

                        <p className="text-slate-400 text-[10px] leading-snug">
                          {item.negativeLabel} ↔ {item.positiveLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3D Coordinate Plane Tendency Vector Toggle */}
              <div className="clean-panel p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-[11px]">
                    3D 원점 경향성 벡터선
                  </span>
                  <button
                    type="button"
                    onClick={() => setShow3DTendency(!show3DTendency)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                      show3DTendency
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {show3DTendency ? '표시 중 (ON)' : '숨김 (OFF)'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  원점(0,0,0)에서 각 기사 구체로 뻗어 나가는 경향성 벡터선을 깔끔하게 표시합니다.
                </p>
              </div>

              {/* 4D Continuous Color Scale & Criteria */}
              {isColorAxisActive &&
                (() => {
                  const isPol = isPoliticsDomain(
                    dataset.axes.color_axis,
                    dataset.axes.x_axis
                  );
                  return (
                    <div className="clean-panel p-2.5 rounded-xl text-xs space-y-1.5 border border-slate-800">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-200">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <Palette className="w-3.5 h-3.5" />
                          <span>4차원 색상 스펙트럼</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsColorGuideOpen(true)}
                          className="text-[10px] text-slate-400 hover:text-white underline"
                        >
                          기준표 보기
                        </button>
                      </div>

                      <div
                        className="w-full h-2 rounded-full border border-white/20"
                        style={{
                          background: isPol
                            ? 'linear-gradient(to right, #1E3A8A 0%, #2563EB 25%, #93C5FD 45%, #FFFFFF 50%, #FCA5A5 55%, #DC2626 75%, #991B1B 100%)'
                            : 'linear-gradient(to right, #991B1B 0%, #DC2626 25%, #F87171 45%, #FFFFFF 50%, #6EE7B7 55%, #10B981 75%, #064E3B 100%)'
                        }}
                      />

                      <div className="flex justify-between text-[9px] font-mono tabular-nums text-slate-400">
                        <span>-1.0</span>
                        <span className="text-white font-bold">0.0 (중립)</span>
                        <span>+1.0</span>
                      </div>
                    </div>
                  );
                })()}

              {/* Scale & Grid Options */}
              <div className="clean-panel p-2.5 rounded-xl space-y-2 text-xs border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    공간 간격 확대
                  </span>
                  <span className="text-blue-400 font-mono tabular-nums text-xs">
                    {scaleFactor}x
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">좌표평면 격자:</span>
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
          /* Minimized Left Panel Unfold Toggle Button */
          <div className="pointer-events-auto absolute top-28 left-3.5 z-20">
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen(true)}
              className="clean-panel px-3 py-2 rounded-xl border border-blue-500/40 shadow-2xl flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 transition-all"
              title="좌측 1·2·3순위 축, 가중치 및 공간 제어 패널 펼치기"
            >
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>1·2·3순위 축 & 가중치 제어</span>
            </button>
          </div>
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
            <div className="flex items-center gap-2 pt-1 text-[10px] font-mono tabular-nums text-slate-300">
              <span className="text-rose-400">
                1순위({rankedAxes[0].name}): {hoveredArticle.coordinates.x >= 0 ? '+' : ''}
                {hoveredArticle.coordinates.x.toFixed(2)}
              </span>
              <span className="text-emerald-400">
                2순위: {hoveredArticle.coordinates.y >= 0 ? '+' : ''}
                {hoveredArticle.coordinates.y.toFixed(2)}
              </span>
              <span className="text-purple-400">
                3순위: {hoveredArticle.coordinates.z >= 0 ? '+' : ''}
                {hoveredArticle.coordinates.z.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* RIGHT SIDE PANEL: Collapsible Article Detail & 1·2·3순위 Coordinate Inspector */}
        {activeSelectedArticle &&
          (isRightPanelOpen ? (
            <aside
              className={`pointer-events-auto z-20 clean-panel shadow-2xl border transition-all ${
                isMobile
                  ? 'fixed bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl border-t border-slate-700 p-4 overflow-y-auto z-40 space-y-3'
                  : 'absolute top-28 right-3.5 w-92 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8.5rem)] rounded-2xl border-slate-700/80 p-4 space-y-3 overflow-y-auto'
              }`}
            >
              {/* Header: Personal Match Score & Fold / Close Controls */}
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                    {activeSelectedScore && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono tabular-nums">
                        ★ 맞춤 일치도 {activeSelectedScore.personalScore}%
                      </span>
                    )}
                    {addedArticleIds.includes(activeSelectedArticle.id) && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 font-extrabold text-[10px]">
                        NEW 신규 추가됨
                      </span>
                    )}
                    <span className="text-blue-400 font-bold">
                      {activeSelectedArticle.publisher}
                    </span>
                    <span className="text-slate-400 font-mono">
                      · {activeSelectedArticle.pub_date}
                    </span>
                  </div>

                  <h2 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {activeSelectedArticle.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsRightPanelOpen(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="우측 상세 패널 접기"
                  >
                    <span>접기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* (0,0,0) Origin Coordinates with 1st/2nd/3rd Priority Bipolar Bars */}
              <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 text-[11px]">
                    (0,0,0) 원점 기준 1·2·3순위 축 위치
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    가중치 {normalizedWeights[0]}:{normalizedWeights[1]}:{normalizedWeights[2]}
                  </span>
                </div>

                {/* 1st Priority (X Axis) Meter */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-rose-400 font-bold">
                      1순위(X · {normalizedWeights[0]}%): {rankedAxes[0].name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-rose-400">
                      {activeSelectedArticle.coordinates.x > 0
                        ? `+${activeSelectedArticle.coordinates.x.toFixed(2)}`
                        : activeSelectedArticle.coordinates.x.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10" />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.abs(activeSelectedArticle.coordinates.x) * 50}%`,
                        marginLeft:
                          activeSelectedArticle.coordinates.x >= 0
                            ? '50%'
                            : `${50 - Math.abs(activeSelectedArticle.coordinates.x) * 50}%`
                      }}
                    />
                  </div>
                </div>

                {/* 2nd Priority (Y Axis) Meter */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      2순위(Y · {normalizedWeights[1]}%): {rankedAxes[1].name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-emerald-400">
                      {activeSelectedArticle.coordinates.y > 0
                        ? `+${activeSelectedArticle.coordinates.y.toFixed(2)}`
                        : activeSelectedArticle.coordinates.y.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10" />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.abs(activeSelectedArticle.coordinates.y) * 50}%`,
                        marginLeft:
                          activeSelectedArticle.coordinates.y >= 0
                            ? '50%'
                            : `${50 - Math.abs(activeSelectedArticle.coordinates.y) * 50}%`
                      }}
                    />
                  </div>
                </div>

                {/* 3rd Priority (Z Axis) Meter */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-purple-400 font-bold">
                      3순위(Z · {normalizedWeights[2]}%): {rankedAxes[2].name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-purple-400">
                      {activeSelectedArticle.coordinates.z > 0
                        ? `+${activeSelectedArticle.coordinates.z.toFixed(2)}`
                        : activeSelectedArticle.coordinates.z.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500 z-10" />
                    <div
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.abs(activeSelectedArticle.coordinates.z) * 50}%`,
                        marginLeft:
                          activeSelectedArticle.coordinates.z >= 0
                            ? '50%'
                            : `${50 - Math.abs(activeSelectedArticle.coordinates.z) * 50}%`
                      }}
                    />
                  </div>
                </div>

                {/* 4D Continuous Color Spectrum Meter */}
                {isColorAxisActive &&
                  (() => {
                    const isPol = isPoliticsDomain(
                      dataset.axes.color_axis,
                      dataset.axes.x_axis
                    );
                    const colorResult = getContinuousColor(
                      activeSelectedArticle.coordinates.x,
                      isPol
                    );
                    const percent = ((activeSelectedArticle.coordinates.x + 1) / 2) * 100;
                    return (
                      <div className="space-y-1 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-300">
                            4D 경향성 ({colorResult.category})
                          </span>
                          <span className="font-mono font-bold text-white">
                            {activeSelectedArticle.coordinates.color_label || colorResult.label}
                          </span>
                        </div>
                        <div
                          className="relative w-full h-2 rounded-full border border-white/20"
                          style={{
                            background: isPol
                              ? 'linear-gradient(to right, #1E3A8A 0%, #2563EB 25%, #93C5FD 45%, #FFFFFF 50%, #FCA5A5 55%, #DC2626 75%, #991B1B 100%)'
                              : 'linear-gradient(to right, #991B1B 0%, #DC2626 25%, #F87171 45%, #FFFFFF 50%, #6EE7B7 55%, #10B981 75%, #064E3B 100%)'
                          }}
                        >
                          <div
                            className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2"
                            style={{
                              left: `${Math.max(4, Math.min(96, percent))}%`,
                              backgroundColor: colorResult.hex
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* AI 3-Line Summary */}
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-300">핵심 3줄 요약</h4>
                <ul className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {activeSelectedArticle.summary_3lines.map((line, idx) => (
                    <li key={idx} className="leading-snug">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Coordinate Rationale */}
              {activeSelectedArticle.ai_rationale && (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-300">좌표 산출 근거</h4>
                  <p className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    {activeSelectedArticle.ai_rationale}
                  </p>
                </div>
              )}

              {/* Interactive #Keyword Filter Buttons */}
              {activeSelectedArticle.keywords && activeSelectedArticle.keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {activeSelectedArticle.keywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => handleSearchInputChange(kw)}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-blue-600/30 text-blue-300 border border-slate-800 hover:border-blue-500/40 text-[11px] font-medium transition-colors"
                    >
                      #{kw}
                    </button>
                  ))}
                </div>
              )}

              {/* In-App Smart Reader & External News Media Portal Hub (Naver / Google / Daum / Publisher) */}
              {(() => {
                const portalLinks = buildPortalLinksForArticle(activeSelectedArticle);
                return (
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsReaderModalOpen(true)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>인앱 뉴스 리더 & 연관뉴스 띄우기</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareArticle(activeSelectedArticle)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                        title="기사 요약 및 좌표 복사"
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Newspaper className="w-3 h-3 text-emerald-400" />
                        외부 뉴스 매개체로 바로 이동:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <a
                          href={portalLinks.naver}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between transition-colors"
                        >
                          <span>N 네이버 뉴스</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={portalLinks.google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-between transition-colors"
                        >
                          <span>G 구글 뉴스</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={portalLinks.daum}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-between transition-colors"
                        >
                          <span>D 다음 뉴스</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={portalLinks.original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-between transition-colors"
                        >
                          <span className="truncate">{activeSelectedArticle.publisher} 원문</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Inline Personal Article Evaluation & 1st/2nd/3rd Axis Calibration Card */}
              <div className="bg-slate-900/95 p-3 rounded-xl border border-cyan-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-[11px] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    내 기사 평가 & 좌표축 진화 반영
                  </span>
                  {evaluations[activeSelectedArticle.id] && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      평가됨
                    </span>
                  )}
                </div>

                {/* 3-Step Preference Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInlinePreference(1)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      inlinePreference === 1
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>공감 (+1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInlinePreference(0)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      inlinePreference === 0
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                    <span>중립 (0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInlinePreference(-1)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      inlinePreference === -1
                        ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>비공감 (-1)</span>
                  </button>
                </div>

                {/* Compact 1st/2nd/3rd Axis Calibration Sliders */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>1·2·3순위 축 점수 직접 보정 (-1.0 ~ +1.0)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-400 w-20 truncate">
                      1순위({rankedAxes[0].name})
                    </span>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={inlineCalX}
                      onChange={(e) => setInlineCalX(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <span className="text-[10px] font-mono text-white w-9 text-right">
                      {inlineCalX >= 0 ? `+${inlineCalX.toFixed(2)}` : inlineCalX.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 w-20 truncate">
                      2순위({rankedAxes[1].name})
                    </span>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={inlineCalY}
                      onChange={(e) => setInlineCalY(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-[10px] font-mono text-white w-9 text-right">
                      {inlineCalY >= 0 ? `+${inlineCalY.toFixed(2)}` : inlineCalY.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-400 w-20 truncate">
                      3순위({rankedAxes[2].name})
                    </span>
                    <input
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={inlineCalZ}
                      onChange={(e) => setInlineCalZ(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-[10px] font-mono text-white w-9 text-right">
                      {inlineCalZ >= 0 ? `+${inlineCalZ.toFixed(2)}` : inlineCalZ.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveArticleEvaluation(activeSelectedArticle, inlinePreference, {
                      x: inlineCalX,
                      y: inlineCalY,
                      z: inlineCalZ
                    })
                  }
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>내 평가 반영하여 좌표축 진화시키기</span>
                </button>
              </div>
            </aside>
          ) : (
            /* Minimized Right Panel Unfold Toggle Button */
            <div className="pointer-events-auto absolute top-28 right-3.5 z-20">
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(true)}
                className="clean-panel px-3 py-2 rounded-xl border border-amber-500/40 shadow-2xl flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 transition-all"
                title="우측 기사 상세 분석 패널 펼치기"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>기사 상세 분석 ({activeSelectedScore?.personalScore ?? 90}%)</span>
              </button>
            </div>
          ))}

        {/* Floating Quick Navigation & Zoom Controls */}
        <div className="pointer-events-auto fixed bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setCameraPresetCommand('ZOOM_IN_' + Date.now())}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all"
            title="화면 확대 (+)"
            aria-label="화면 확대"
          >
            <ZoomIn className="w-4 h-4 text-sky-400" />
          </button>
          <button
            type="button"
            onClick={() => setCameraPresetCommand('ZOOM_OUT_' + Date.now())}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all"
            title="화면 축소 (-)"
            aria-label="화면 축소"
          >
            <ZoomOut className="w-4 h-4 text-sky-400" />
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('RESET')}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all text-xs font-bold flex items-center gap-1"
            title="시점 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] hidden md:inline">초기화</span>
          </button>
          <button
            type="button"
            onClick={() => setShow3DTendency(!show3DTendency)}
            className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              show3DTendency
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="3D 좌표평면 내 기사별 경향성 배지 표시 전환"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] hidden sm:inline">3D 경향성</span>
          </button>
        </div>

        {/* 4D Continuous Color Scale Criteria Modal */}
        {isColorGuideOpen && isColorAxisActive && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto clean-panel p-5 rounded-2xl border border-blue-500/40 shadow-2xl space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">4D 색상 기준 및 연속 스펙트럼</h3>
                </div>
                <button
                  onClick={() => setIsColorGuideOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                1순위(X축) 수치의 부호와 크기에 비례하여 연속 색상 스펙트럼이 적용됩니다. 원점(0.0)에 가까울수록 순백색(#FFFFFF)으로 표시되어 편향 없는 기준점을 나타냅니다.
              </p>
              <button
                type="button"
                onClick={() => setIsColorGuideOpen(false)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* All Modals Connected in Explorer View */}
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
            setEnableColorAxis(
              Boolean(snapshot.axes.color_axis && snapshot.axes.color_axis.trim())
            );
            setIsSnapshotsDrawerOpen(false);
            setIsRightPanelOpen(true);
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
        <ArticleReaderModal
          isOpen={isReaderModalOpen}
          article={activeSelectedArticle}
          personalScore={activeSelectedScore?.personalScore ?? null}
          rankedAxes={rankedAxes}
          normalizedWeights={normalizedWeights}
          existingEvaluation={
            activeSelectedArticle ? evaluations[activeSelectedArticle.id] : undefined
          }
          existingArticles={dataset.articles}
          onClose={() => setIsReaderModalOpen(false)}
          onSaveEvaluation={handleSaveArticleEvaluation}
          onAddRelatedArticleTo3D={async (rel: RelatedPortalArticle) => {
            return await handleAddSingleArticleToSpace({
              url: rel.link,
              title: rel.title,
              publisher: rel.publisher,
              pub_date: rel.pub_date,
              snippet: rel.title
            });
          }}
          onSelectExistingArticleIn3D={(art: Article) => {
            setSelectedArticle(art);
            setIsRightPanelOpen(true);
          }}
        />

        {/* Direct External News Article Add to 3D Space Modal */}
        {isAddArticleModalOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg clean-panel p-5 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">
                    찾은 뉴스 기사를 현재 3D 좌표 공간에 추가
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddArticleModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed text-[11px]">
                네이버 뉴스·구글 뉴스·다음 뉴스 등에서 찾은 <strong>기사 링크(URL)</strong> 또는{' '}
                <strong>기사 제목·핵심 내용</strong>을 입력하면, 현재 설정된{' '}
                <strong className="text-cyan-300">
                  1순위({rankedAxes[0].name}) · 2순위({rankedAxes[1].name}) · 3순위(
                  {rankedAxes[2].name})
                </strong>{' '}
                기준으로 3D 좌표를 산출해 현재 공간에 새로운 점으로 즉시 추가합니다.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    기사 링크 URL (선택 · 입력 시 제목과 본문 자동 추출)
                  </label>
                  <input
                    type="url"
                    value={addArticleUrlInput}
                    onChange={(e) => setAddArticleUrlInput(e.target.value)}
                    placeholder="https://n.news.naver.com/... 또는 언론사 기사 URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-200 block">
                      기사 제목 또는 검색 키워드 (필수 또는 URL 입력)
                    </label>
                    <input
                      type="text"
                      value={addArticleTitleInput}
                      onChange={(e) => setAddArticleTitleInput(e.target.value)}
                      placeholder="예: AI 기본법 하위법령 제정 방향과 산업계 입장"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-200 block">언론사명 (선택)</label>
                    <input
                      type="text"
                      value={addArticlePublisherInput}
                      onChange={(e) => setAddArticlePublisherInput(e.target.value)}
                      placeholder="예: 한국경제, 연합뉴스"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200 block">
                    핵심 문단 또는 요약 내용 (선택 · 입력 시 더 정밀한 3D 좌표 산출)
                  </label>
                  <textarea
                    rows={3}
                    value={addArticleSnippetInput}
                    onChange={(e) => setAddArticleSnippetInput(e.target.value)}
                    placeholder="기사 본문 일부나 핵심 요약 내용을 붙여넣으면 1·2·3순위 축 좌표를 더욱 정밀하게 계산합니다."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={
                    isAddingSingleArticle ||
                    (!addArticleUrlInput.trim() && !addArticleTitleInput.trim())
                  }
                  onClick={async () => {
                    const added = await handleAddSingleArticleToSpace({
                      url: addArticleUrlInput,
                      title: addArticleTitleInput,
                      publisher: addArticlePublisherInput,
                      snippet: addArticleSnippetInput
                    });
                    if (added) {
                      setAddArticleUrlInput('');
                      setAddArticleTitleInput('');
                      setAddArticlePublisherInput('');
                      setAddArticleSnippetInput('');
                      setIsAddArticleModalOpen(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {isAddingSingleArticle ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>3D 좌표 산출 및 추가 중...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>현재 3D 좌표에 점으로 추가</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
