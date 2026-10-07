import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sliders,
  Sparkles,
  RotateCcw,
  Loader2,
  Newspaper,
  CheckCircle2,
  Compass,
  PlusCircle
} from 'lucide-react';
import {
  Article,
  RankedAxisItem,
  ArticleEvaluation,
  ArticlePreviewContent,
  RelatedPortalArticle
} from '../types';
import { buildPortalLinksForArticle } from '../utils/newsPortalLinks';

interface ArticleReaderModalProps {
  isOpen: boolean;
  article: Article | null;
  personalScore: number | null;
  rankedAxes: [RankedAxisItem, RankedAxisItem, RankedAxisItem];
  normalizedWeights: [number, number, number];
  existingEvaluation?: ArticleEvaluation;
  existingArticles?: Article[];
  onClose: () => void;
  onSaveEvaluation: (
    article: Article,
    preference: 1 | 0 | -1,
    calibratedCoords: { x: number; y: number; z: number }
  ) => void;
  onAddRelatedArticleTo3D?: (rel: RelatedPortalArticle) => Promise<Article | null>;
  onSelectExistingArticleIn3D?: (article: Article) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  isOpen,
  article,
  personalScore,
  rankedAxes,
  normalizedWeights,
  existingEvaluation,
  existingArticles = [],
  onClose,
  onSaveEvaluation,
  onAddRelatedArticleTo3D,
  onSelectExistingArticleIn3D
}) => {
  const [preference, setPreference] = useState<1 | 0 | -1>(1);
  const [calX, setCalX] = useState<number>(0);
  const [calY, setCalY] = useState<number>(0);
  const [calZ, setCalZ] = useState<number>(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ArticlePreviewContent | null>(null);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [addingRelIdx, setAddingRelIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!article || !isOpen) return;

    setPreference(existingEvaluation ? existingEvaluation.preference : 1);
    setCalX(
      existingEvaluation
        ? existingEvaluation.calibratedCoords.x
        : Number(article.coordinates.x.toFixed(2))
    );
    setCalY(
      existingEvaluation
        ? existingEvaluation.calibratedCoords.y
        : Number(article.coordinates.y.toFixed(2))
    );
    setCalZ(
      existingEvaluation
        ? existingEvaluation.calibratedCoords.z
        : Number(article.coordinates.z.toFixed(2))
    );
    setSavedNotice(false);

    let cancelled = false;
    setIsLoadingPreview(true);

    fetch('/api/v1/article-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        publisher: article.publisher,
        origin_link: article.origin_link,
        pub_date: article.pub_date,
        summary_3lines: article.summary_3lines,
        keywords: article.keywords,
        ai_rationale: article.ai_rationale
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.preview) {
          setPreviewData(data.preview);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [article?.id, isOpen]);

  if (!isOpen || !article) return null;

  const portalLinks = previewData?.portalLinks || buildPortalLinksForArticle(article);

  const handleResetCoords = () => {
    const orig = existingEvaluation?.originalCoords || article.coordinates;
    setCalX(Number(orig.x.toFixed(2)));
    setCalY(Number(orig.y.toFixed(2)));
    setCalZ(Number(orig.z.toFixed(2)));
  };

  const handleApplyEvaluation = () => {
    onSaveEvaluation(article, preference, {
      x: Math.max(-1, Math.min(1, Number(calX.toFixed(2)))),
      y: Math.max(-1, Math.min(1, Number(calY.toFixed(2)))),
      z: Math.max(-1, Math.min(1, Number(calZ.toFixed(2))))
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 pointer-events-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/70">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                인앱 뉴스 리더 & 뉴스 매개체 허브
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 font-semibold text-xs">
                {article.publisher}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {article.pub_date}
              </span>
              {personalScore !== null && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                  ★ 내 맞춤 일치도 {personalScore}%
                </span>
              )}
              {existingEvaluation && (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />내 평가 반영됨
                </span>
              )}
            </div>
            <h2 className="text-white font-extrabold text-base sm:text-lg leading-snug">
              {article.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            title="리더 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct External News Media Portal Bar (Naver / Google / Daum / Publisher) */}
        <div className="px-5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
            이 기사를 외부 뉴스 매개체에서 바로 열기:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={portalLinks.naver}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="font-black">N</span>
              <span>네이버 뉴스에서 보기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={portalLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="font-black">G</span>
              <span>구글 뉴스에서 보기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={portalLinks.daum}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="font-black">D</span>
              <span>다음 뉴스에서 보기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={portalLinks.original}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>{article.publisher} 원문 이동</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Body Grid: Left (Article Reader & Related Live News) + Right (Personal Evaluation & Adaptive Axis Calibration) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Cols: In-App Article Reader & Related News Media */}
          <div className="lg:col-span-7 space-y-4">
            {/* 3-Line Executive Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  핵심 3줄 요약 브리핑
                </span>
                <div className="flex flex-wrap gap-1">
                  {article.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="space-y-2 text-slate-200 text-sm leading-relaxed">
                {article.summary_3lines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extracted Article Paragraphs / Detailed Briefing */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">
                  인앱 기사 본문 및 맥락 분석
                </span>
                {isLoadingPreview && (
                  <span className="text-[11px] text-blue-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    기사 본문 및 연관 뉴스 수집 중...
                  </span>
                )}
              </div>

              <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                {previewData?.paragraphs && previewData.paragraphs.length > 0 ? (
                  previewData.paragraphs.map((para, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <>
                    <p>{article.ai_rationale}</p>
                    <p className="text-xs text-slate-400">
                      상단의 네이버 뉴스·구글 뉴스·다음 뉴스·언론사 원문 바로가기 버튼을 클릭하면 새 탭에서 해당 뉴스 매개체의 전체 페이지를 바로 확인하실 수 있습니다.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Live Related News from News Portals with 1-Click Add to 3D Space */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" />
                  관련 실시간 뉴스 보도 & 현재 3D 좌표에 추가
                </span>
                <span className="text-[11px] text-slate-400">
                  찾은 기사를 현재 3D 좌표에 점으로 추가하거나 각 포털에서 열람할 수 있습니다
                </span>
              </div>

              {isLoadingPreview ? (
                <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>관련 실시간 뉴스 기사를 불러오는 중입니다...</span>
                </div>
              ) : previewData?.relatedArticles && previewData.relatedArticles.length > 0 ? (
                <div className="divide-y divide-slate-800/80">
                  {previewData.relatedArticles.map((rel, idx) => {
                    const normTitle = (t: string) =>
                      t.replace(/[\s\[\]'\"()…·\-_]/g, '').toLowerCase();
                    const matchedExisting = existingArticles.find(
                      (a) => normTitle(a.title) === normTitle(rel.title)
                    );
                    const isAddingThis = addingRelIdx === idx;

                    return (
                      <div
                        key={idx}
                        className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <a
                            href={rel.naverLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {rel.title}
                          </a>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-300">{rel.publisher}</span>
                            <span>·</span>
                            <span>{rel.pub_date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 flex-wrap">
                          {matchedExisting ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectExistingArticleIn3D) {
                                  onSelectExistingArticleIn3D(matchedExisting);
                                }
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                              title="이미 3D 좌표에 추가된 점으로 카메라 이동"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>추가됨 · 3D 점 보기</span>
                            </button>
                          ) : (
                            onAddRelatedArticleTo3D && (
                              <button
                                type="button"
                                disabled={addingRelIdx !== null}
                                onClick={async () => {
                                  setAddingRelIdx(idx);
                                  try {
                                    const added = await onAddRelatedArticleTo3D(rel);
                                    if (added) {
                                      onClose();
                                    }
                                  } finally {
                                    setAddingRelIdx(null);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm transition-colors"
                                title="이 기사를 현재 1·2·3순위 축 기준으로 분석해 현재 3D 좌표 공간에 추가"
                              >
                                {isAddingThis ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>분석·추가 중...</span>
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle className="w-3 h-3" />
                                    <span>+ 3D 좌표에 추가</span>
                                  </>
                                )}
                              </button>
                            )
                          )}
                          <a
                            href={rel.naverLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                          >
                            네이버뉴스
                          </a>
                          <a
                            href={rel.googleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-blue-500/15 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold"
                          >
                            구글뉴스
                          </a>
                          <a
                            href={rel.daumLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold"
                          >
                            다음뉴스
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  상단의 네이버 뉴스·구글 뉴스·다음 뉴스 버튼을 눌러 관련 후속 보도를 바로 검색해 보세요.
                </p>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Personal Article Evaluation & 1st/2nd/3rd Axis Calibration */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    내 기사 평가 & 개인 좌표축 진화
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCoords}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    title="원본 AI 분석 좌표로 복원"
                  >
                    <RotateCcw className="w-3 h-3" />
                    원본 수치 복원
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  이 기사를 평가하거나 1·2·3순위 축 점수를 보정하면, 내 개인 기준점과 축별 가중치·선호방향이 자동으로 학습되어 3D 좌표 공간이 내 기준에 맞게 재정렬됩니다.
                </p>
              </div>

              {/* Step 1: Overall Preference Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  1. 이 기사에 대한 내 선호도 평가
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreference(1)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      preference === 1
                        ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>높은 공감 (+1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreference(0)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      preference === 0
                        ? 'bg-blue-600/25 border-blue-500 text-blue-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>중립 / 참고 (0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreference(-1)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      preference === -1
                        ? 'bg-rose-600/25 border-rose-500 text-rose-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>비공감 (-1)</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Direct Calibration of 1st / 2nd / 3rd Priority Axis Scores */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  2. 내가 판단한 1·2·3순위 축 점수 직접 보정 (-1.00 ~ +1.00)
                </label>

                {/* 1st Priority Axis (X) */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400">
                      1순위(X · {normalizedWeights[0]}%): {rankedAxes[0].name}
                    </span>
                    <input
                      type="number"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={calX}
                      onChange={(e) =>
                        setCalX(Math.max(-1, Math.min(1, Number(e.target.value) || 0)))
                      }
                      className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs text-white"
                    />
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={calX}
                    onChange={(e) => setCalX(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{rankedAxes[0].negativeLabel}</span>
                    <span>{rankedAxes[0].positiveLabel}</span>
                  </div>
                </div>

                {/* 2nd Priority Axis (Y) */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">
                      2순위(Y · {normalizedWeights[1]}%): {rankedAxes[1].name}
                    </span>
                    <input
                      type="number"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={calY}
                      onChange={(e) =>
                        setCalY(Math.max(-1, Math.min(1, Number(e.target.value) || 0)))
                      }
                      className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs text-white"
                    />
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={calY}
                    onChange={(e) => setCalY(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{rankedAxes[1].negativeLabel}</span>
                    <span>{rankedAxes[1].positiveLabel}</span>
                  </div>
                </div>

                {/* 3rd Priority Axis (Z) */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-400">
                      3순위(Z · {normalizedWeights[2]}%): {rankedAxes[2].name}
                    </span>
                    <input
                      type="number"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={calZ}
                      onChange={(e) =>
                        setCalZ(Math.max(-1, Math.min(1, Number(e.target.value) || 0)))
                      }
                      className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs text-white"
                    />
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.05}
                    value={calZ}
                    onChange={(e) => setCalZ(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{rankedAxes[2].negativeLabel}</span>
                    <span>{rankedAxes[2].positiveLabel}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyEvaluation}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>내 평가 반영하여 개인 좌표축 & 3D 공간 진화시키기</span>
              </button>

              {savedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    내 평가와 보정 좌표가 반영되어 개인 가중치·선호방향 및 3D 공간이 업데이트되었습니다!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
