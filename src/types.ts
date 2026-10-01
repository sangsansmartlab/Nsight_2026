// NSight Domain & Data Types

export interface CoordinateScore {
  x: number; // Normalized to [-1.0, 1.0]
  y: number; // Normalized to [-1.0, 1.0]
  z: number; // Normalized to [-1.0, 1.0]
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

export interface SearchRequest {
  query: string;
  custom_urls?: string[] | null;
  display_count: number;
  custom_axes: CustomAxes;
}

export interface SearchResponse {
  status: 'success' | 'error';
  total: number;
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
