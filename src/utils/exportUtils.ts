import { Article, CustomAxes } from '../types';

/**
 * Exports articles data to a formatted CSV file and triggers download
 */
export function exportArticlesToCSV(query: string, articles: Article[], axes: CustomAxes) {
  if (!articles || articles.length === 0) return;

  const headers = [
    'ID',
    '기사제목',
    '언론사',
    '발행일',
    `X축 (${axes.x_axis})`,
    `Y축 (${axes.y_axis})`,
    `Z축 (${axes.z_axis})`,
    '색상코드',
    '성향라벨',
    '3줄요약',
    'AI_Rationale',
    '원문링크'
  ];

  const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const rows = articles.map((art) => [
    escapeCSV(art.id),
    escapeCSV(art.title),
    escapeCSV(art.publisher),
    escapeCSV(art.pub_date),
    art.coordinates.x,
    art.coordinates.y,
    art.coordinates.z,
    escapeCSV(art.coordinates.color_hex),
    escapeCSV(art.coordinates.color_label),
    escapeCSV(art.summary_3lines ? art.summary_3lines.join(' / ') : ''),
    escapeCSV(art.ai_rationale || ''),
    escapeCSV(art.origin_link)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NSight_${query.replace(/\s+/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports articles data to a formatted JSON file and triggers download
 */
export function exportArticlesToJSON(query: string, articles: Article[], axes: CustomAxes) {
  if (!articles || articles.length === 0) return;

  const data = {
    platform: 'NSight',
    query,
    exportedAt: new Date().toISOString(),
    total: articles.length,
    axes,
    articles
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NSight_${query.replace(/\s+/g, '_')}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Captures high-res PNG from 3D WebGL Canvas
 */
export function captureCanvasToPNG(filename = 'NSight_3D_Space.png') {
  const container = document.getElementById('canvas-container');
  const canvas = container ? container.querySelector('canvas') : document.querySelector('canvas');
  if (!canvas) {
    alert('3D 캔버스를 찾을 수 없습니다.');
    return;
  }

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to capture canvas:', err);
  }
}
