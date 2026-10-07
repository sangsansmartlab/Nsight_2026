// NSight Domain & Data Types

export interface CoordinateScore {
  x: number; // Normalized to [-1.0, 1.0] (1순위 축)
  y: number; // Normalized to [-1.0, 1.0] (2순위 축)
  z: number; // Normalized to [-1.0, 1.0] (3순위 축)
  color_hex: string;
  color_label: string;
}

export interface Article {
  id: string;
  title: string;
  publisher: string;
  origin_link: string;
  pub_date: string;
  summary_3lines: string[];
  keywords: string[];
  coordinates: CoordinateScore;
  ai_rationale: string;
  body_snippet?: string;
}

export interface CustomAxes {
  x_axis: string;
  y_axis: string;
  z_axis: string;
  color_axis: string;
}

export interface RankedAxisItem {
  id: string;
  name: string; // e.g., "수익성", "연관성", "미래 지향성"
  negativeLabel: string; // e.g., "손실/비용 부담 (-)"
  positiveLabel: string; // e.g., "고수익/가치 창출 (+)"
  preferredDirection: 1 | 0 | -1; // 1: 양(+) 선호, 0: 균형/무관, -1: 음(-) 선호
  weight: number; // 사용자 설정 가중치 (예: 50, 30, 20)
}

export interface UserPreferenceProfile {
  rankedAxes: [RankedAxisItem, RankedAxisItem, RankedAxisItem]; // [1순위(X), 2순위(Y), 3순위(Z)]
  preferredSentiment: 'ALL' | '긍정/지지' | '중립/건설적' | '우려/비판';
  interestKeywords: string[];
  displayCount: number;
  hasCompletedOnboarding: boolean;
}

export interface ScoredArticle {
  article: Article;
  personalScore: number; // 0 ~ 100
  axis1Score: number;
  axis2Score: number;
  axis3Score: number;
}

export interface SearchRequest {
  query: string;
  custom_urls?: string[] | null;
  display_count: number;
  custom_axes: CustomAxes;
  ranked_axes?: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
}

export interface SearchResponse {
  status: 'success' | 'error';
  total: number;
  source?: 'live_naver' | 'live_rss' | 'synthesized_live';
  axes: CustomAxes;
  articles: Article[];
  message?: string;
}

export interface Snapshot {
  id: string;
  title: string;
  query: string;
  created_at: string;
  axes: CustomAxes;
  articles: Article[];
  articleCount: number;
}

export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  role: UserRole;
}

export type ViewMode = '3D_SPACE' | 'LIST_VIEW' | 'MATRIX_2D';
