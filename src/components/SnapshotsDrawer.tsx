import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  History,
  Clock,
  Trash2,
  FolderOpen,
  Plus,
  Check,
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import { DatasetItem } from '../data/mockDatasets';
import { CustomAxes } from '../types';

export interface MapSnapshot {
  id: string;
  title: string;
  query: string;
  createdAt: string;
  axes: CustomAxes;
  dataset: DatasetItem;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
  count: number;
}

interface SnapshotsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentDataset: DatasetItem;
  currentAxes: CustomAxes;
  currentQuery: string;
  onLoadSnapshot: (snapshot: MapSnapshot) => void;
  onSelectHistoryQuery: (query: string) => void;
}

export const SnapshotsDrawer: React.FC<SnapshotsDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  currentDataset,
  currentAxes,
  currentQuery,
  onLoadSnapshot,
  onSelectHistoryQuery
}) => {
  const [activeTab, setActiveTab] = useState<'SNAPSHOTS' | 'HISTORY'>('SNAPSHOTS');
  const [snapshots, setSnapshots] = useState<MapSnapshot[]>([]);
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const snapshotStorageKey = `nsight_snapshots_${userId}`;
  const historyStorageKey = `nsight_history_${userId}`;

  // Load from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedSnaps = localStorage.getItem(snapshotStorageKey);
      if (savedSnaps) setSnapshots(JSON.parse(savedSnaps));

      const savedHist = localStorage.getItem(historyStorageKey);
      if (savedHist) setHistoryItems(JSON.parse(savedHist));
    } catch (e) {
      console.error('Failed to load snapshots/history', e);
    }
  }, [isOpen, snapshotStorageKey, historyStorageKey]);

  if (!isOpen) return null;

  const handleSaveCurrentSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `${currentQuery} 분석 3D 지도 (${new Date().toLocaleDateString('ko-KR')})`;
    
    const newSnapshot: MapSnapshot = {
      id: `snap_${Date.now()}`,
      title,
      query: currentQuery,
      createdAt: new Date().toLocaleString('ko-KR'),
      axes: currentAxes,
      dataset: currentDataset
    };

    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    try {
      localStorage.setItem(snapshotStorageKey, JSON.stringify(updated));
    } catch {}

    setNewTitle('');
    setIsSaving(false);
    setFeedbackMsg('현재 3D 지도가 스냅샷으로 저장되었습니다.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    try {
      localStorage.setItem(snapshotStorageKey, JSON.stringify(updated));
    } catch {}
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(historyStorageKey);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full clean-panel border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250">
        
        {/* Top Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">3D 스냅샷 및 검색 히스토리</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('SNAPSHOTS')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'SNAPSHOTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>저장된 스냅샷 ({snapshots.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>검색 히스토리 ({historyItems.length})</span>
            </button>
          </div>

          {feedbackMsg && (
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {activeTab === 'SNAPSHOTS' ? (
            <div className="space-y-3">
              {/* Save New Snapshot Trigger / Form */}
              {!isSaving ? (
                <button
                  type="button"
                  onClick={() => setIsSaving(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>현재 3D 공간을 스냅샷으로 저장하기</span>
                </button>
              ) : (
                <form onSubmit={handleSaveCurrentSnapshot} className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 text-xs">
                  <span className="font-semibold text-white block">새 스냅샷 이름 지정:</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={`예: ${currentQuery} 3차원 분석`}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-400 text-xs"
                    autoFocus
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      저장 완료
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSaving(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}

              {/* Snapshots List */}
              {snapshots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-1">
                  <FolderOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p>저장된 3D 스냅샷이 없습니다.</p>
                  <p className="text-[11px] text-slate-600">위 버튼을 눌러 현재 분석 화면을 보관해 보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="clean-panel p-3 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all space-y-2 text-xs group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                            {snap.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>검색어: ‘{snap.query}’</span>
                            <span>·</span>
                            <span>노드: {snap.dataset.articles.length}개</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                          title="스냅샷 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                        <span className="text-slate-500 font-mono">{snap.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onLoadSnapshot(snap);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>3D 뷰로 불러오기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Search History Timeline */
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px] text-slate-400 pb-1">
                <span>최근 검색한 키워드 타임라인:</span>
                {historyItems.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-rose-400 hover:text-rose-300 text-[10px] underline"
                  >
                    기록 전체 삭제
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p>검색 히스토리가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="clean-panel p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Search className="w-3.5 h-3.5 text-blue-400" />
                          <span>{item.query}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectHistoryQuery(item.query);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white font-medium text-[11px] transition-colors"
                      >
                        재탐색
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Close Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
