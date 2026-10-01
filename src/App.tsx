import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            N
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">NSight</h1>
            <p className="text-[10px] text-slate-400">상산고등학교 SMARTLAB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/80 font-medium">
            기획 & 규범 헌장 준비 완료
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60 text-blue-400 mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
          NSight 프로젝트 베이스라인 구축 완료
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          기획서 사양을 기반으로 한 핵심 프로젝트 안내서(<code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">README.md</code>)와 
          향후 모든 AI 모델이 일관된 가치관과 규칙을 준수하도록 규정하는 AI 헌장(<code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">PROJECT_RULES.md</code>)이 
          성공적으로 정립되었습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold text-slate-200 mb-1">📄 README.md</div>
            <p className="text-xs text-slate-400 leading-normal">
              프로젝트 개요, 4차원 좌표계, 수집 파이프라인, REST API 스펙, RBAC 권한 매트릭스 수록 (TMI 및 보안 이슈 정제 완료)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold text-slate-200 mb-1">⚖️ PROJECT_RULES.md</div>
            <p className="text-xs text-slate-400 leading-normal">
              사용자 지시 최우선 원칙, AI 임의 수정 금지, 사전 차이점 설명 및 확인 의무, 디자인/서버 유보 조항 수록
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-slate-900 px-6 flex items-center justify-between text-xs text-slate-500">
        <div>상산고등학교 SMARTLAB (김태호, 박민수, 김이현, 차민혁)</div>
        <div className="text-[10px] text-slate-400 font-mono">made by SMARTLAB 김태호</div>
      </footer>
    </div>
  );
};

export default App;
