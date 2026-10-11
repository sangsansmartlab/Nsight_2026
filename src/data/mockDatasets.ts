import {
  Article,
  CustomAxes,
  SearchModeId,
  SearchVisualizationModeSpec
} from '../types';

export interface DatasetItem {
  id: string;
  name: string;
  modeId?: SearchModeId;
  axes: CustomAxes;
  articles: Article[];
}

export const SEARCH_VISUALIZATION_MODES: SearchVisualizationModeSpec[] = [
  {
    id: 'news',
    mode: '뉴스 모드',
    purpose: '사안·이슈·최신 소식 보기',
    axes: {
      x: '반대 ↔ 찬성',
      y: '파급력',
      z: '신뢰도',
      color: '논조'
    },
    rankedAxes: [
      {
        id: 'news_x',
        name: '반대 ↔ 찬성',
        negativeLabel: '반대/우려 (-1.0)',
        positiveLabel: '찬성/지지 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'news_y',
        name: '파급력',
        negativeLabel: '국소적 파급 (-1.0)',
        positiveLabel: '사회적 핵심 파급력 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'news_z',
        name: '신뢰도',
        negativeLabel: '단순 주장/의혹 (-1.0)',
        positiveLabel: '공인 팩트/높은 신뢰도 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '논조 (찬성/긍정 · 중립 · 반대/비판)',
    accentColor: 'blue',
    queryContextKeywords: ['이슈', '찬반', '논란', '발표', '속보']
  },
  {
    id: 'shopping',
    mode: '쇼핑 모드',
    purpose: '제품 비교하고 고르기',
    axes: {
      x: '저가 ↔ 고가',
      y: '품질·성능',
      z: '후기 신뢰도',
      color: '가성비'
    },
    rankedAxes: [
      {
        id: 'shop_x',
        name: '저가 ↔ 고가',
        negativeLabel: '실속/저가형 (-1.0)',
        positiveLabel: '프리미엄/고가형 (+1.0)',
        preferredDirection: 0,
        weight: 50
      },
      {
        id: 'shop_y',
        name: '품질·성능',
        negativeLabel: '보급형 성능 (-1.0)',
        positiveLabel: '최상급 품질·성능 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'shop_z',
        name: '후기 신뢰도',
        negativeLabel: '단순 홍보성 후기 (-1.0)',
        positiveLabel: '실사용 벤치마크 검증 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '가성비 (최고 가성비 · 적정 가격 · 고가 프리미엄)',
    accentColor: 'emerald',
    queryContextKeywords: ['비교', '가격', '성능', '후기', '가성비', '리뷰']
  },
  {
    id: 'paper',
    mode: '논문 모드',
    purpose: '학술 근거 찾기',
    axes: {
      x: '이론 ↔ 응용',
      y: '근거 강도',
      z: '최신성',
      color: '분야'
    },
    rankedAxes: [
      {
        id: 'paper_x',
        name: '이론 ↔ 응용',
        negativeLabel: '기초 이론/수리 모델 (-1.0)',
        positiveLabel: '실증 응용/산업 적용 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'paper_y',
        name: '근거 강도',
        negativeLabel: '탐색적 가설 (-1.0)',
        positiveLabel: '엄밀한 실험·높은 근거 강도 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'paper_z',
        name: '최신성',
        negativeLabel: '선행 기반 연구 (-1.0)',
        positiveLabel: '최신 학술 발표 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '분야 (공학/AI · 자연과학 · 의학/바이오 · 사회과학)',
    accentColor: 'indigo',
    queryContextKeywords: ['논문', '학술', '연구', '실험', '분석', '학회']
  },
  {
    id: 'patent',
    mode: '특허 모드',
    purpose: '기술·아이디어 선행 조사 (KIPRIS)',
    axes: {
      x: '기초 ↔ 응용',
      y: '권리 범위',
      z: '최신성',
      color: '출원인 유형'
    },
    rankedAxes: [
      {
        id: 'patent_x',
        name: '기초 ↔ 응용',
        negativeLabel: '원천/기초 기술 특허 (-1.0)',
        positiveLabel: '상용/응용 시스템 특허 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'patent_y',
        name: '권리 범위',
        negativeLabel: '세부 공정/좁은 청구항 (-1.0)',
        positiveLabel: '핵심 표준/넓은 권리 범위 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'patent_z',
        name: '최신성',
        negativeLabel: '기존 등록 선행특허 (-1.0)',
        positiveLabel: '최신 공개/출원 특허 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '출원인 유형 (글로벌 빅테크 · 국내 대기업 · 대학/국책연구소 · 스타트업)',
    accentColor: 'amber',
    queryContextKeywords: ['특허', 'KIPRIS', '출원', '선행기술', '청구항', '원천기술']
  },
  {
    id: 'stats',
    mode: '통계 모드',
    purpose: '공공데이터·수치 근거 찾기',
    axes: {
      x: '영향 범위',
      y: '데이터 신뢰도',
      z: '최신성',
      color: '기관 유형'
    },
    rankedAxes: [
      {
        id: 'stats_x',
        name: '영향 범위',
        negativeLabel: '특정 표본/국소 범위 (-1.0)',
        positiveLabel: '국가/전산업 거시 범위 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'stats_y',
        name: '데이터 신뢰도',
        negativeLabel: '민간 추정/단순 설문 (-1.0)',
        positiveLabel: '국가승인/공식 전수 통계 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'stats_z',
        name: '최신성',
        negativeLabel: '과거 시계열 데이터 (-1.0)',
        positiveLabel: '최신 공표 통계 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '기관 유형 (정부/통계청 · 국제기구 · 국책연구원 · 민간리서치)',
    accentColor: 'cyan',
    queryContextKeywords: ['통계', '수치', '공공데이터', '비율', '보고서', '지표']
  },
  {
    id: 'knowledge',
    mode: '지식 모드',
    purpose: '개념·원리 이해하기',
    axes: {
      x: '쉬움 ↔ 전문적',
      y: '핵심도',
      z: '정확도',
      color: '자료 유형'
    },
    rankedAxes: [
      {
        id: 'know_x',
        name: '쉬움 ↔ 전문적',
        negativeLabel: '입문/쉬운 기초 해설 (-1.0)',
        positiveLabel: '심화/전문 아키텍처 원리 (+1.0)',
        preferredDirection: 0,
        weight: 50
      },
      {
        id: 'know_y',
        name: '핵심도',
        negativeLabel: '주변 배경 지식 (-1.0)',
        positiveLabel: '본질적 작동 원리/핵심 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'know_z',
        name: '정확도',
        negativeLabel: '직관적 비유 중심 (-1.0)',
        positiveLabel: '표준 명세/높은 정확도 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '자료 유형 (개념백과 · 원리해설 · 아키텍처 가이드 · 용어사전)',
    accentColor: 'purple',
    queryContextKeywords: ['개념', '원리', '해설', '구조', '가이드', '정의']
  },
  {
    id: 'deep',
    mode: '심층 모드',
    purpose: '복합 주제 깊게 조사하기',
    axes: {
      x: 'AI가 정함',
      y: 'AI가 정함',
      z: '신뢰도',
      color: '하위 질문'
    },
    rankedAxes: [
      {
        id: 'deep_x',
        name: 'AI가 정함 (자율 혁신 ↔ 안전 통제)',
        negativeLabel: '안전 통제/거버넌스 우선 (-1.0)',
        positiveLabel: '자율 혁신/초격차 확장 (+1.0)',
        preferredDirection: 1,
        weight: 50
      },
      {
        id: 'deep_y',
        name: 'AI가 정함 (장기 구조적 파급도)',
        negativeLabel: '단기 현안/미시적 적응 (-1.0)',
        positiveLabel: '장기 패러다임 전환 (+1.0)',
        preferredDirection: 1,
        weight: 30
      },
      {
        id: 'deep_z',
        name: '신뢰도',
        negativeLabel: '단일 관점 추론 (-1.0)',
        positiveLabel: '다중 교차검증 심층 근거 (+1.0)',
        preferredDirection: 1,
        weight: 20
      }
    ],
    colorAxisDescription: '하위 질문 (Q1.기술주권 · Q2.규제거버넌스 · Q3.산업생태계 · Q4.윤리안전)',
    accentColor: 'rose',
    queryContextKeywords: ['심층분석', '쟁점', '전망', '과제', '구조적영향', '전략']
  }
];

export const getModeSpecById = (modeId: SearchModeId): SearchVisualizationModeSpec => {
  return (
    SEARCH_VISUALIZATION_MODES.find((m) => m.id === modeId) ||
    SEARCH_VISUALIZATION_MODES[0]
  );
};

// Dedicated 3D Graph Datasets per Mode — each mode graph contains ONLY articles of that mode's category
export const MODE_DEMO_GRAPHS: Record<SearchModeId, DatasetItem> = {
  news: {
    id: 'mode-graph-news',
    name: 'AI 기본법 (뉴스 모드)',
    modeId: 'news',
    axes: {
      x_axis: '반대 ↔ 찬성: 반대/우려 (-1.0) ↔ 중립 (0.0) ↔ 찬성/지지 (+1.0)',
      y_axis: '파급력: 국소적 파급 (-1.0) ↔ 중립 (0.0) ↔ 사회적 핵심 파급력 (+1.0)',
      z_axis: '신뢰도: 단순 주장/의혹 (-1.0) ↔ 중립 (0.0) ↔ 공인 팩트/높은 신뢰도 (+1.0)',
      color_axis: '논조 (찬성/긍정 · 중립 · 반대/비판)'
    },
    articles: [
      {
        id: 'news_art_1',
        modeCategory: 'news',
        title: '국회 AI 기본법 제정안 본회의 통과... 찬반 격론 끝 정책 균형점 도출',
        publisher: '조선일보',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.0,
          y: 0.85,
          z: 0.9,
          color_hex: '#F59E0B',
          color_label: '논조: 중립/핵심보도'
        },
        summary_3lines: [
          'AI 기본법 국회 본회의 최종 통과 및 공포 절차 돌입',
          '산업계 찬성 입장과 시민사회 규제 강화 요구 사이 절충안 반영',
          '뉴스 모드 그래프의 중심 기준이 되는 핵심 속보 기사'
        ],
        keywords: ['AI기본법', '국회통과', '찬반균형', '최신속보'],
        ai_rationale: '사안의 찬반 양측 논조를 균형 있게 보도하여 X축(반대↔찬성) 0.00, 사회적 파급력 Y축 +0.85, 공식 의결 팩트 신뢰도 Z축 +0.90에 배치되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'news_art_2',
        modeCategory: 'news',
        title: '벤처·스타트업 업계 "과도한 고위험 AI 규제 조항, 신산업 싹 자른다" 반대 성명',
        publisher: '전자신문',
        pub_date: '2026-09-27',
        coordinates: {
          x: -0.78,
          y: 0.62,
          z: 0.45,
          color_hex: '#EF4444',
          color_label: '논조: 반대/비판'
        },
        summary_3lines: [
          '초기 AI 스타트업 단체, 처벌 및 사전 검열 우려하며 법안 개정 촉구',
          '컴플라이언스 비용 급증으로 해외 이전 도미노 현상 경고',
          '현장 기업인들의 강한 반대 여론을 담은 이슈 보도'
        ],
        keywords: ['스타트업반대', '규제비판', '준수비용', '혁신위축'],
        ai_rationale: '규제 법안에 대한 강한 반대 논조를 띠어 X축 -0.78, 업계 파급력 Y축 +0.62로 산출되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'news_art_3',
        modeCategory: 'news',
        title: '경제단체 일제히 환영 "국가 AI 컴퓨팅 인프라 지원 법제화 적극 찬성"',
        publisher: '매일경제',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.86,
          y: 0.82,
          z: 0.75,
          color_hex: '#10B981',
          color_label: '논조: 찬성/지지'
        },
        summary_3lines: [
          '국가 AI 데이터센터 세제 혜택 및 10조 펀드 법적 근거 마련에 찬성',
          '미·중 AI 패권 경쟁 속 국가 전략산업 육성 골든타임 확보 평가',
          '산업 진흥 조항에 대한 경제계 지지 여론 집중 조명'
        ],
        keywords: ['경제계찬성', 'AI주권', '인프라지원', '10조펀드'],
        ai_rationale: '법안 통과와 지원책에 대한 뚜렷한 찬성 논조로 X축 +0.86, 거시경제 파급력 Y축 +0.82, 신뢰도 Z축 +0.75에 배치되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'news_art_4',
        modeCategory: 'news',
        title: '시민단체 "딥페이크·알고리즘 차별 막을 실질적 처벌 조항 빠져" 비판 기자회견',
        publisher: '한겨레',
        pub_date: '2026-09-26',
        coordinates: {
          x: -0.55,
          y: 0.48,
          z: 0.58,
          color_hex: '#F87171',
          color_label: '논조: 우려/비판'
        },
        summary_3lines: [
          '고위험 AI 영역의 시민 인권 보호 의무가 선언적 수준에 그쳤다고 지적',
          '피해자 입증 책임 완화 및 독립 감독기구 신설 요구',
          '사회적 안전망 측면에서의 법안 반대·보완 촉구 보도'
        ],
        keywords: ['시민단체비판', 'AI윤리', '인권침해우려', '독립감독기구'],
        ai_rationale: '현행 통과안에 대한 비판·반대 입장을 다루어 X축 -0.55, 사회적 파급력 Y축 +0.48로 분석되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'news_art_5',
        modeCategory: 'news',
        title: '과기정통부, AI 기본법 하위 시행령 제정 민관합동 TF 공식 출범 발표',
        publisher: '연합뉴스',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.22,
          y: 0.55,
          z: 0.92,
          color_hex: '#3B82F6',
          color_label: '논조: 중립/팩트'
        },
        summary_3lines: [
          '정부 부처 공식 브리핑을 통해 연내 세부 가이드라인 제정 일정 발표',
          '산·학·연 전문가 50인이 참여하는 분과별 시행령 수립 착수',
          '객관적 행정 절차를 전달하는 고신뢰 정책 뉴스'
        ],
        keywords: ['과기정통부', '시행령TF', '공식발표', '행정절차'],
        ai_rationale: '정부 공식 발표 팩트 위주 보도로 신뢰도 Z축 +0.92, 온건 찬성/추진 맥락 X축 +0.22에 위치합니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'news_art_6',
        modeCategory: 'news',
        title: '여야 정책위의장, AI 추경 예산 2조원 편성 전격 합의... 초당적 협력 물꼬',
        publisher: '한국경제',
        pub_date: '2026-09-29',
        coordinates: {
          x: 0.68,
          y: 0.76,
          z: 0.84,
          color_hex: '#34D399',
          color_label: '논조: 찬성/합의'
        },
        summary_3lines: [
          '여야가 국가 AI 컴퓨팅 센터 확충을 위한 추경 예산 편성에 합의',
          '정쟁을 넘어 미래 먹거리 산업 지원에 한목소리 찬성',
          '정책 실행력을 높이는 긍정적 정국 소식 보도'
        ],
        keywords: ['여야합의', 'AI추경예산', '초당적협력', '컴퓨팅센터'],
        ai_rationale: '초당적 찬성 합의 소식으로 X축 +0.68, 높은 예산 파급력 Y축 +0.76, 공식 합의 신뢰도 Z축 +0.84로 산출되었습니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  shopping: {
    id: 'mode-graph-shopping',
    name: 'AI 디바이스·솔루션 비교 (쇼핑 모드)',
    modeId: 'shopping',
    axes: {
      x_axis: '저가 ↔ 고가: 실속/저가형 (-1.0) ↔ 중립 (0.0) ↔ 프리미엄/고가형 (+1.0)',
      y_axis: '품질·성능: 보급형 성능 (-1.0) ↔ 중립 (0.0) ↔ 최상급 품질·성능 (+1.0)',
      z_axis: '후기 신뢰도: 단순 홍보성 후기 (-1.0) ↔ 중립 (0.0) ↔ 실사용 벤치마크 검증 (+1.0)',
      color_axis: '가성비 (최고 가성비 · 적정 가격 · 고가 프리미엄)'
    },
    articles: [
      {
        id: 'shop_art_1',
        modeCategory: 'shopping',
        title: '[실사용 비교] 2026 차세대 NPU 탑재 AI 노트북 5종 가격·벤치마크 완벽 가이드',
        publisher: '다나와리서치',
        pub_date: '2026-09-29',
        coordinates: {
          x: -0.15,
          y: 0.82,
          z: 0.94,
          color_hex: '#10B981',
          color_label: '가성비: 최고 추천'
        },
        summary_3lines: [
          '100만원대 중반 가격에 50 TOPS NPU 성능을 구현한 올라운더 모델 선정',
          '실제 구매자 1,200명 장기 사용 후기 및 발열·배터리 실측 데이터 검증',
          '가격 대비 AI 추론 품질·성능이 가장 뛰어난 가성비 1위 비교 기사'
        ],
        keywords: ['AI노트북비교', 'NPU성능', '실사용후기', '최고가성비'],
        ai_rationale: '합리적 중저가(X축 -0.15)이면서 품질·성능(Y축 +0.82)과 실측 후기 신뢰도(Z축 +0.94)가 매우 높아 최고 가성비 노드로 배치되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'shop_art_2',
        modeCategory: 'shopping',
        title: '보급형 온디바이스 AI 태블릿 40만원대 모델, 학생용 가성비 실사용 리뷰',
        publisher: 'IT동아',
        pub_date: '2026-09-27',
        coordinates: {
          x: -0.82,
          y: 0.35,
          z: 0.78,
          color_hex: '#34D399',
          color_label: '가성비: 실속 보급형'
        },
        summary_3lines: [
          '40만원대 저가형 포지션에도 실시간 음성 요약 및 번역 기능 원활 작동',
          '고부하 3D 작업에는 한계가 있으나 학습·문서 작성용 품질은 우수',
          '내돈내산 학부모·학생 구매 인증 리뷰 500건 분석'
        ],
        keywords: ['저가형태블릿', '학생용추천', '내돈내산후기', '가성비모델'],
        ai_rationale: '저가형 가격대(X축 -0.82), 실용적 품질(Y축 +0.35), 높은 실구매자 후기 신뢰도(Z축 +0.78)로 평가되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'shop_art_3',
        modeCategory: 'shopping',
        title: '워크스테이션급 플래그십 AI 프로 랩탑(450만원) 극한 성능 벤치마크 테스트',
        publisher: '퀘이사존리포트',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.92,
          y: 0.96,
          z: 0.88,
          color_hex: '#3B82F6',
          color_label: '가성비: 하이엔드/고성능'
        },
        summary_3lines: [
          '450만원 초고가 플래그십 모델로 로컬 70B LLM 구동 가능한 압도적 성능',
          '전문 개발자 및 연구소 타겟의 최상급 빌드 퀄리티와 냉각 설계',
          '정밀 계측 장비를 통한 객관적 벤치마크 후기 데이터 수록'
        ],
        keywords: ['플래그십AI랩탑', '고가하이엔드', '최상급성능', '벤치마크'],
        ai_rationale: '초고가 포지션(X축 +0.92)과 타협 없는 최상급 품질·성능(Y축 +0.96), 정밀 계측 신뢰도(Z축 +0.88)를 기록했습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'shop_art_4',
        modeCategory: 'shopping',
        title: 'SNS 협찬 광고 넘치는 AI 스마트 워치, 실구매자 불만 후기 급증 주의보',
        publisher: '소비자고발저널',
        pub_date: '2026-09-25',
        coordinates: {
          x: 0.45,
          y: -0.58,
          z: -0.72,
          color_hex: '#EF4444',
          color_label: '가성비: 낮음/주의'
        },
        summary_3lines: [
          '출시가 80만원대의 높은 가격에도 AI 음성인식 오류 및 배터리 광탈 현상 빈발',
          '초기 인플루언서 홍보성 리뷰와 달리 실제 사용자 평점은 2.1점 기록',
          '가격 대비 품질과 후기 신뢰도가 모두 낮아 구매 시 주의 필요'
        ],
        keywords: ['협찬광고주의', '가성비불만', '품질결함', '후기검증'],
        ai_rationale: '다소 높은 가격(X축 +0.45) 대비 낮은 품질·성능(Y축 -0.58)과 홍보성 후기 거품(Z축 -0.72)으로 가성비 주의 등급에 위치합니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'shop_art_5',
        modeCategory: 'shopping',
        title: '기업용 AI 회의록 마이크 스피커 3종 비교: 중소기업 도입 가성비 베스트는?',
        publisher: '테크월드',
        pub_date: '2026-09-26',
        coordinates: {
          x: -0.35,
          y: 0.68,
          z: 0.81,
          color_hex: '#10B981',
          color_label: '가성비: 우수'
        },
        summary_3lines: [
          '구독료 없는 하드웨어 일체형 모델이 3년 총소유비용(TCO) 기준 42% 절감',
          '화자 분리 인식률 97.4%로 고가 장비 못지않은 음성 품질 입증',
          '도입 기업 담당자 80개사 실사용 만족도 조사 기반 비교'
        ],
        keywords: ['AI회의록장비', '가격비교', '음성인식성능', '도입후기'],
        ai_rationale: '중저가 도입 비용(X축 -0.35)에 높은 인식 품질(Y축 +0.68)과 검증된 기업 후기(Z축 +0.81)를 갖춘 우수 가성비 제품군입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'shop_art_6',
        modeCategory: 'shopping',
        title: '가정용 AI 로봇청소기 올인원 프라임(220만원), 가격 값 할까? 6개월 롱텀 후기',
        publisher: '디지털투데이',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.62,
          y: 0.74,
          z: 0.85,
          color_hex: '#F59E0B',
          color_label: '가성비: 적정 프리미엄'
        },
        summary_3lines: [
          '200만원대 고가이나 사물 인식 회피 성능과 자동 살균 세척 품질은 최고 수준',
          '6개월간 무고장 실사용 로그와 소모품 유지비까지 투명하게 공개',
          '예산이 충분한 소비자에게 추천되는 프리미엄 가전 비교 리뷰'
        ],
        keywords: ['AI로봇청소기', '롱텀리뷰', '프리미엄가전', '성능검증'],
        ai_rationale: '고가 라인업(X축 +0.62)에 걸맞은 뛰어난 품질(Y축 +0.74)과 6개월 실사용 후기 신뢰도(Z축 +0.85)를 보여줍니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  paper: {
    id: 'mode-graph-paper',
    name: '생성형 AI 안전성·경량화 연구 (논문 모드)',
    modeId: 'paper',
    axes: {
      x_axis: '이론 ↔ 응용: 기초 이론/수리 모델 (-1.0) ↔ 중립 (0.0) ↔ 실증 응용/산업 적용 (+1.0)',
      y_axis: '근거 강도: 탐색적 가설 (-1.0) ↔ 중립 (0.0) ↔ 엄밀한 실험·높은 근거 강도 (+1.0)',
      z_axis: '최신성: 선행 기반 연구 (-1.0) ↔ 중립 (0.0) ↔ 최신 학술 발표 (+1.0)',
      color_axis: '분야 (공학/AI · 자연과학 · 의학/바이오 · 사회과학)'
    },
    articles: [
      {
        id: 'paper_art_1',
        modeCategory: 'paper',
        title: '[NeurIPS 2026 채택 논문] 양자화 신경망의 정보 손실 하한선에 관한 수리적 증명',
        publisher: 'KAIST AI대학원 학술지',
        pub_date: '2026-09-29',
        coordinates: {
          x: -0.78,
          y: 0.92,
          z: 0.95,
          color_hex: '#6366F1',
          color_label: '분야: 기초수리/AI이론'
        },
        summary_3lines: [
          '2비트 초저정밀도 양자화 시 발생하는 엔트로피 손실의 수학적 하한 정리 규명',
          '12개 표준 벤치마크 데이터셋에서 이론적 예측치와 실험값의 99.2% 일치 입증',
          '차세대 경량화 모델 설계의 학술적 토대를 제공한 최신 이론 논문'
        ],
        keywords: ['NeurIPS논문', '양자화이론', '수리적증명', '학술근거'],
        ai_rationale: '기초 수리 이론 연구(X축 -0.78)이면서 엄밀한 수학적 증명과 실험 근거 강도(Y축 +0.92), 2026 최신 발표(Z축 +0.95)를 갖춘 논문입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'paper_art_2',
        modeCategory: 'paper',
        title: '[Nature Medicine] 멀티모달 의료 AI의 응급실 패혈증 조기 진단 다기관 임상 실증 논문',
        publisher: '서울대의대·하버드 공동연구팀',
        pub_date: '2026-09-26',
        coordinates: {
          x: 0.88,
          y: 0.95,
          z: 0.9,
          color_hex: '#10B981',
          color_label: '분야: 의학/바이오 응용'
        },
        summary_3lines: [
          '국내외 15개 대학병원 환자 24만 명 임상 데이터를 활용한 대규모 전향적 코호트 연구',
          '기존 진단 프로토콜 대비 패혈증 발견 시간을 평균 4.8시간 단축(p < 0.0001)',
          '실제 의료 현장에 즉시 적용 가능한 최고 수준의 응용 임상 학술 근거'
        ],
        keywords: ['NatureMedicine', '임상실증논문', '의료AI응용', '다기관코호트'],
        ai_rationale: '실제 병원 임상 응용 연구(X축 +0.88), 24만 명 코호트 기반 최고 근거 강도(Y축 +0.95), 최신 학술지 게재(Z축 +0.90)로 평가되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'paper_art_3',
        modeCategory: 'paper',
        title: '대규모 언어모델(LLM)의 환각 현상 억제를 위한 검색증강생성(RAG) 아키텍처 비교 연구',
        publisher: '한국정보과학회 논문지',
        pub_date: '2026-09-20',
        coordinates: {
          x: 0.45,
          y: 0.76,
          z: 0.72,
          color_hex: '#3B82F6',
          color_label: '분야: 컴퓨터공학/NLP'
        },
        summary_3lines: [
          '그래프 기반 RAG와 밀집 벡터 RAG의 한국어 법률·금융 문서 사실성 비교 실험',
          '복합 추론 질의에서 하이브리드 검색 기법이 환각률을 64% 감소시킴을 실증',
          '기업용 지식베이스 구축 시 참조할 수 있는 실용 공학 논문'
        ],
        keywords: ['RAG논문', '환각억제실험', '정보과학회', '한국어벤치마크'],
        ai_rationale: '시스템 응용 연구(X축 +0.45), 정량적 벤치마크 근거 강도(Y축 +0.76), 최신 연구(Z축 +0.72)에 해당합니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'paper_art_4',
        modeCategory: 'paper',
        title: '생성형 AI 규제 법안이 스타트업 R&D 투자에 미치는 거시경제 모형 분석 논문',
        publisher: '한국경제학회 학술지',
        pub_date: '2026-09-18',
        coordinates: {
          x: -0.25,
          y: 0.68,
          z: 0.65,
          color_hex: '#F59E0B',
          color_label: '분야: 경제/사회과학'
        },
        summary_3lines: [
          'OECD 28개국 AI 규제 강도 지수와 벤처캐피탈 투자 유입량의 패널 회귀분석',
          '사전 인증 의무화 시 초기 시드 투자가 단기 18% 감소하나 표준화 이후 회복세 규명',
          '정책 입안의 계량경제학적 학술 근거를 제시한 연구'
        ],
        keywords: ['계량경제논문', '패널회귀분석', '규제영향연구', 'OECD데이터'],
        ai_rationale: '경제 이론 및 실증 모형 결합(X축 -0.25), 28개국 패널 데이터 근거 강도(Y축 +0.68), 최신성(Z축 +0.65)으로 배치되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'paper_art_5',
        modeCategory: 'paper',
        title: '트랜스포머 어텐션 메커니즘의 위상수학적 해석에 관한 기초 이론 논문',
        publisher: '대한수학회·AI융합심포지엄',
        pub_date: '2026-08-30',
        coordinates: {
          x: -0.92,
          y: 0.81,
          z: 0.42,
          color_hex: '#8B5CF6',
          color_label: '분야: 순수이론/수학'
        },
        summary_3lines: [
          '고차원 토큰 임베딩 공간의 매니폴드 곡률 변화를 위상수학적으로 정식화',
          '층이 깊어질수록 발생하는 표현 붕괴(Representation Collapse) 조건 도출',
          '순수 이론적 관점에서 신경망의 내재적 한계를 규명한 학술 연구'
        ],
        keywords: ['위상수학이론', '어텐션수리모델', '매니폴드가설', '기초연구'],
        ai_rationale: '순수 기초 이론 연구의 정점(X축 -0.92)이며 수리적 증명 근거 강도(Y축 +0.81)가 높습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'paper_art_6',
        modeCategory: 'paper',
        title: '자율주행 엣지 디바이스용 초저전력 스파이킹 신경망(SNN) 칩 구현 및 실차 주행 논문',
        publisher: 'IEEE ISSCC 발표 논문',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.94,
          y: 0.88,
          z: 0.91,
          color_hex: '#06B6D4',
          color_label: '분야: 반도체/시스템응용'
        },
        summary_3lines: [
          '3나노 공정 기반 뉴로모픽 SNN 프로세서 실리콘 웨이퍼 제작 및 실차 탑재 검증',
          '기존 GPU 대비 소비전력 1/18 수준으로 야간 객체 인식 정확도 98.1% 달성',
          '하드웨어 칩 구현부터 실차 응용까지 완료한 고강도 실증 논문'
        ],
        keywords: ['ISSCC논문', '뉴로모픽칩구현', '실차주행실증', '초저전력SNN'],
        ai_rationale: '실제 반도체 칩 제작 및 실차 응용(X축 +0.94), 실리콘 측정 데이터 근거 강도(Y축 +0.88), 최신 학회 발표(Z축 +0.91)입니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  patent: {
    id: 'mode-graph-patent',
    name: 'AI 반도체·모델 선행특허 (특허 모드 · KIPRIS)',
    modeId: 'patent',
    axes: {
      x_axis: '기초 ↔ 응용: 원천/기초 기술 특허 (-1.0) ↔ 중립 (0.0) ↔ 상용/응용 시스템 특허 (+1.0)',
      y_axis: '권리 범위: 세부 공정/좁은 청구항 (-1.0) ↔ 중립 (0.0) ↔ 핵심 표준/넓은 권리 범위 (+1.0)',
      z_axis: '최신성: 기존 등록 선행특허 (-1.0) ↔ 중립 (0.0) ↔ 최신 공개/출원 특허 (+1.0)',
      color_axis: '출원인 유형 (글로벌 빅테크 · 국내 대기업 · 대학/국책연구소 · 스타트업)'
    },
    articles: [
      {
        id: 'pat_art_1',
        modeCategory: 'patent',
        title: '[KIPRIS 공개특허] HBM4 적층 메모리 내장형 PIM 연산 아키텍처 및 제어 방법',
        publisher: '삼성전자 출원 (10-2026-0098412)',
        pub_date: '2026-09-28',
        coordinates: {
          x: -0.45,
          y: 0.92,
          z: 0.94,
          color_hex: '#3B82F6',
          color_label: '출원인: 국내 대기업'
        },
        summary_3lines: [
          '메모리 뱅크 내부에서 행렬 곱셈 연산을 직접 수행하는 원천 PIM 회로 구조 청구',
          '독립항 5개 및 종속항 38개로 구성된 광범위한 표준 필수 특허급 권리 범위 확보',
          'KIPRIS 및 미국 특허청(USPTO) 동시 우선권 주장 최신 공개 특허'
        ],
        keywords: ['KIPRIS특허', 'HBM4_PIM', '원천회로특허', '삼성전자출원'],
        ai_rationale: '원천 하드웨어 아키텍처(X축 -0.45)에 대한 매우 넓은 청구항 권리 범위(Y축 +0.92)와 최신 출원(Z축 +0.94)을 가진 핵심 특허입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'pat_art_2',
        modeCategory: 'patent',
        title: '[KIPRIS 등록특허] 온디바이스 AI 기반 실시간 보이스피싱 문맥 탐지 및 통화 차단 장치',
        publisher: '핀테크보안 스타트업 출원 (10-2026-0071205)',
        pub_date: '2026-09-25',
        coordinates: {
          x: 0.86,
          y: 0.58,
          z: 0.88,
          color_hex: '#10B981',
          color_label: '출원인: 국내 스타트업'
        },
        summary_3lines: [
          '스마트폰 NPU에서 외부 서버 전송 없이 통화 음성의 사기 의도를 실시간 판별하는 응용 특허',
          '금융 앱 연동 자동 송금 지연 프로세스까지 포함한 상용 서비스 직결 청구항',
          '기술 사업화 및 라이선싱이 즉시 가능한 응용 기술 특허'
        ],
        keywords: ['응용특허', '온디바이스보안', '스타트업출원', '상용시스템'],
        ai_rationale: '상용 서비스 직결 응용 기술(X축 +0.86)이며 실용적 권리 범위(Y축 +0.58)와 높은 최신성(Z축 +0.88)을 지닙니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'pat_art_3',
        modeCategory: 'patent',
        title: '[선행특허 분석] 희소 어텐션(Sparse Attention) 가속을 위한 동적 토큰 프루닝 원천 특허',
        publisher: '한국전자통신연구원(ETRI) 출원',
        pub_date: '2026-09-15',
        coordinates: {
          x: -0.84,
          y: 0.85,
          z: 0.72,
          color_hex: '#8B5CF6',
          color_label: '출원인: 국책연구소/대학'
        },
        summary_3lines: [
          '추론 시 불필요한 어텐션 연산을 실시간 생략하는 기초 알고리즘 및 하드웨어 매핑 원천 특허',
          '다양한 트랜스포머 변형 모델에 포괄 적용되는 핵심 독립항 보유',
          '국책연구기관이 확보한 AI 경량화 핵심 선행 기술'
        ],
        keywords: ['ETRI원천특허', '토큰프루닝', '선행기술조사', '핵심청구항'],
        ai_rationale: '기초 알고리즘 원천 특허(X축 -0.84)로서 포괄적인 권리 범위(Y축 +0.85)를 확보하고 있습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'pat_art_4',
        modeCategory: 'patent',
        title: '[PCT 국제출원] 생성형 이미지 워터마크 비가시성 삽입 및 위변조 역추적 시스템 특허',
        publisher: '글로벌 빅테크 출원 (WO-2026-114029)',
        pub_date: '2026-09-22',
        coordinates: {
          x: 0.52,
          y: 0.89,
          z: 0.86,
          color_hex: '#F59E0B',
          color_label: '출원인: 글로벌 빅테크'
        },
        summary_3lines: [
          'AI 기본법 워터마크 의무화에 대응하는 주파수 영역 암호화 서명 삽입 특허',
          '이미지 캡처·압축·편집 후에도 99.5% 복원되는 넓은 보호 범위 청구',
          '회피 설계가 까다로운 글로벌 표준 후보 특허로 선행 조사 필수 대상'
        ],
        keywords: ['AI워터마크특허', 'PCT국제출원', '빅테크특허장벽', '회피설계필수'],
        ai_rationale: '상용 규제 대응 응용 특허(X축 +0.52)이면서 회피가 어려운 광범위 권리 범위(Y축 +0.89)를 형성하고 있습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'pat_art_5',
        modeCategory: 'patent',
        title: '[KIPRIS 선행기술] 신경망 가중치 행렬 압축 저장 방법 (2021년 등록 선행특허 비교)',
        publisher: 'KAIST 산학협력단 등록특허',
        pub_date: '2025-11-10',
        coordinates: {
          x: -0.65,
          y: 0.42,
          z: -0.55,
          color_hex: '#8B5CF6',
          color_label: '출원인: 국책연구소/대학'
        },
        summary_3lines: [
          '신규 특허 출원 시 진보성 거절이유로 자주 인용되는 핵심 선행 등록특허',
          '기존 블록 단위 양자화 방식을 정의하고 있어 후속 출원 시 청구항 보정 기준점 역할',
          '선행 기술 조사에서 권리 저촉 여부 판단을 위한 필수 대조 문헌'
        ],
        keywords: ['선행등록특허', '진보성판단', '청구항대조', '가중치압축'],
        ai_rationale: '기초 원천 성격(X축 -0.65)의 선행 등록특허(최신성 Z축 -0.55)로 신규 출원 시 비교 기준이 되는 문헌입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'pat_art_6',
        modeCategory: 'patent',
        title: '[KIPRIS 출원] 스마트팩토리 비전 검사 AI의 불량 패턴 자가학습 공정 제어 특허',
        publisher: '현대오토에버 출원 (10-2026-0089310)',
        pub_date: '2026-09-27',
        coordinates: {
          x: 0.91,
          y: 0.64,
          z: 0.9,
          color_hex: '#3B82F6',
          color_label: '출원인: 국내 대기업'
        },
        summary_3lines: [
          '제조 라인 카메라 영상에서 미세 결함을 실시간 검출하고 로봇 공정을 즉시 보정하는 응용 특허',
          '소량의 불량 샘플만으로 현장에서 재학습하는 파이프라인 청구',
          '산업 현장 적용성이 매우 높은 최신 제조 AI 특허'
        ],
        keywords: ['스마트팩토리특허', '비전검사AI', '공정제어출원', '제조응용'],
        ai_rationale: '현장 제조 공정 응용 특허(X축 +0.91), 공정 제어 청구 범위(Y축 +0.64), 2026년 9월 최신 출원(Z축 +0.90)입니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  stats: {
    id: 'mode-graph-stats',
    name: 'AI 산업·고용 실태 수치 (통계 모드)',
    modeId: 'stats',
    axes: {
      x_axis: '영향 범위: 특정 표본/국소 범위 (-1.0) ↔ 중립 (0.0) ↔ 국가/전산업 거시 범위 (+1.0)',
      y_axis: '데이터 신뢰도: 민간 추정/단순 설문 (-1.0) ↔ 중립 (0.0) ↔ 국가승인/공식 전수 통계 (+1.0)',
      z_axis: '최신성: 과거 시계열 데이터 (-1.0) ↔ 중립 (0.0) ↔ 최신 공표 통계 (+1.0)',
      color_axis: '기관 유형 (정부/통계청 · 국제기구 · 국책연구원 · 민간리서치)'
    },
    articles: [
      {
        id: 'stat_art_1',
        modeCategory: 'stats',
        title: '[국가승인통계] 2026 인공지능 산업실태조사: 국내 AI 매출 12.4조원 돌파 (전년비 +28.6%)',
        publisher: '과학기술정보통신부·통계청 (KOSIS)',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.92,
          y: 0.96,
          z: 0.94,
          color_hex: '#06B6D4',
          color_label: '기관: 정부/국가승인통계'
        },
        summary_3lines: [
          '전국 AI 공급·수요 기업 3,500개사 전수 조사 기반 국가승인 공식 통계 공표',
          '기업 AI 도입률 38.2% 달성, AI 전문 인력 부족률은 24.5%로 핵심 수치 제시',
          '정책 수립 및 보고서 인용 시 최우선 근거로 활용되는 1등급 공공데이터'
        ],
        keywords: ['국가승인통계', 'KOSIS공공데이터', 'AI매출12조', '도입률38%'],
        ai_rationale: '전산업 거시 영향 범위(X축 +0.92), 국가승인 전수조사 최고 데이터 신뢰도(Y축 +0.96), 최신 공표(Z축 +0.94)를 갖춘 통계입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'stat_art_2',
        modeCategory: 'stats',
        title: '[OECD 공식 지표] 회원국 38개국 생성형 AI 노동생산성 기여도 및 직무 대체율 비교 통계',
        publisher: 'OECD 경제통계국',
        pub_date: '2026-09-24',
        coordinates: {
          x: 0.95,
          y: 0.91,
          z: 0.88,
          color_hex: '#3B82F6',
          color_label: '기관: 국제기구(OECD)'
        },
        summary_3lines: [
          '한국의 AI 업무 활용률은 OECD 3위(41.8%), 사무·행정 직무 생산성 +19.4% 향상 수치 확인',
          '단순 반복 직무의 14.2%가 자동화 고위험군으로 분류된 반면 신규 AI 직무는 +22% 증가',
          '글로벌 국가 간 객관적 수치 비교를 위한 국제 표준 통계 지표'
        ],
        keywords: ['OECD통계', '노동생산성수치', '국가별AI활용률', '국제비교지표'],
        ai_rationale: '글로벌 거시 영향 범위(X축 +0.95)와 국제기구 공식 데이터 신뢰도(Y축 +0.91), 최신 발표(Z축 +0.88)를 기록했습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'stat_art_3',
        modeCategory: 'stats',
        title: '[KDI 경제동향 수치] AI 반도체 수출이 2026년 한국 GDP 성장률에 미친 기여도 1.1%p 분석',
        publisher: '한국개발연구원(KDI)',
        pub_date: '2026-09-26',
        coordinates: {
          x: 0.84,
          y: 0.88,
          z: 0.9,
          color_hex: '#10B981',
          color_label: '기관: 국책연구원(KDI)'
        },
        summary_3lines: [
          'HBM 등 고부가 AI 메모리 수출액이 전체 반도체 수출의 46.8% 차지',
          '설비투자 증가율 15.3% 견인하며 내수 둔화를 상쇄한 실증 거시경제 수치',
          '한국은행 산업연관표와 관세청 통관 데이터를 결합한 고정밀 통계 보고서'
        ],
        keywords: ['KDI통계보고서', 'GDP기여도수치', '반도체수출비중', '거시경제지표'],
        ai_rationale: '국가 거시경제 영향 범위(X축 +0.84)와 국책연구원 실증 데이터 신뢰도(Y축 +0.88)가 매우 높습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'stat_art_4',
        modeCategory: 'stats',
        title: '[민간 설문 통계] 직장인 1,000명 대상 생성형 AI 유료 구독 지출액 및 체감 만족도 조사',
        publisher: '오픈서베이 리서치',
        pub_date: '2026-09-27',
        coordinates: {
          x: -0.35,
          y: 0.32,
          z: 0.86,
          color_hex: '#F59E0B',
          color_label: '기관: 민간리서치'
        },
        summary_3lines: [
          '응답 직장인의 62.4%가 월평균 2만 8,500원을 AI 서비스 구독에 지출 중',
          '문서 초안 작성(74%)과 코딩 보조(58%)에서 시간 단축 체감도가 가장 높게 집계',
          '표본 설문조사 특성상 소비자 트렌드 파악용 보조 수치로 활용 권장'
        ],
        keywords: ['직장인설문통계', 'AI구독료수치', '소비자트렌드', '표본조사'],
        ai_rationale: '직장인 1,000명 표본 범위(X축 -0.35), 민간 설문 데이터 신뢰도(Y축 +0.32), 최신 조사(Z축 +0.86)로 분류되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'stat_art_5',
        modeCategory: 'stats',
        title: '[전력거래소 공공데이터] AI 데이터센터 확산에 따른 2020~2026 수도권 전력 수요 시계열 통계',
        publisher: '한국전력거래소(KPX) 공공데이터포털',
        pub_date: '2026-09-19',
        coordinates: {
          x: 0.72,
          y: 0.93,
          z: 0.65,
          color_hex: '#06B6D4',
          color_label: '기관: 정부/공공기관'
        },
        summary_3lines: [
          '최근 6년간 데이터센터 계약전력 연평균 21.4% 급증, 수도권 비중 71.2% 편중 수치 공개',
          '2029년까지 추가 4.2GW 전력망 확충이 필요하다는 정량적 수급 데이터',
          '에너지 인프라 및 입지 정책 근거로 쓰이는 핵심 공공 시계열 통계'
        ],
        keywords: ['공공데이터포털', '데이터센터전력통계', '시계열수치', '전력거래소'],
        ai_rationale: '국가 전력 인프라 영향 범위(X축 +0.72), 공공 계측 데이터 신뢰도(Y축 +0.93)를 지닌 핵심 통계입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'stat_art_6',
        modeCategory: 'stats',
        title: '[개인정보위 통계] 최근 3년간 생성형 AI 학습데이터 관련 개인정보 분쟁조정 및 과징금 현황',
        publisher: '개인정보보호위원회 연차통계',
        pub_date: '2026-09-21',
        coordinates: {
          x: 0.25,
          y: 0.85,
          z: 0.78,
          color_hex: '#06B6D4',
          color_label: '기관: 정부/감독기구'
        },
        summary_3lines: [
          'AI 크롤링 및 학습 데이터 관련 시정권고·과징금 처분 건수 2024년 14건 → 2026년 49건 증가',
          '비식별화 조치 미흡(53%)과 사전 동의 누락(31%)이 주요 위반 유형으로 집계',
          '법률 준수 및 리스크 관리의 객관적 근거가 되는 행정 처분 통계'
        ],
        keywords: ['개인정보위통계', '과징금수치', '분쟁조정건수', '법규준수지표'],
        ai_rationale: '기업 규제 준수 범위(X축 +0.25), 정부 감독기구 공식 집계 신뢰도(Y축 +0.85), 최신성(Z축 +0.78)을 갖추었습니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  knowledge: {
    id: 'mode-graph-knowledge',
    name: 'AI 핵심 개념·작동 원리 (지식 모드)',
    modeId: 'knowledge',
    axes: {
      x_axis: '쉬움 ↔ 전문적: 입문/쉬운 기초 해설 (-1.0) ↔ 중립 (0.0) ↔ 심화/전문 아키텍처 원리 (+1.0)',
      y_axis: '핵심도: 주변 배경 지식 (-1.0) ↔ 중립 (0.0) ↔ 본질적 작동 원리/핵심 (+1.0)',
      z_axis: '정확도: 직관적 비유 중심 (-1.0) ↔ 중립 (0.0) ↔ 표준 명세/높은 정확도 (+1.0)',
      color_axis: '자료 유형 (개념백과 · 원리해설 · 아키텍처 가이드 · 용어사전)'
    },
    articles: [
      {
        id: 'know_art_1',
        modeCategory: 'knowledge',
        title: '[개념 원리 해설] 트랜스포머(Transformer)와 셀프 어텐션이 문맥을 이해하는 작동 원리',
        publisher: '네이버 지식백과 · AI 아키텍처 총서',
        pub_date: '2026-09-28',
        coordinates: {
          x: 0.15,
          y: 0.95,
          z: 0.94,
          color_hex: '#A855F7',
          color_label: '자료유형: 핵심 원리해설'
        },
        summary_3lines: [
          '쿼리(Query)·키(Key)·밸류(Value) 내적 연산을 통해 단어 간 연관 가중치를 계산하는 원리 정밀 도해',
          '순차 처리(RNN)의 한계를 넘어 대규모 병렬 학습을 가능하게 한 본질적 메커니즘 설명',
          '입문자부터 전공자까지 가장 정확하게 이해할 수 있는 표준 핵심 개념 문서'
        ],
        keywords: ['트랜스포머원리', '셀프어텐션', 'QKV연산개념', '표준원리해설'],
        ai_rationale: '균형 잡힌 난이도(X축 +0.15)에 현대 AI의 가장 본질적인 핵심도(Y축 +0.95)와 높은 기술적 정확도(Z축 +0.94)를 갖춘 문서입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'know_art_2',
        modeCategory: 'knowledge',
        title: '[쉬운 입문 가이드] 비전공자도 5분 만에 이해하는 AI 기본법 "고위험 AI"와 "워터마크" 개념',
        publisher: '한국지능정보사회진흥원(NIA) 쉬운 디지털 백과',
        pub_date: '2026-09-27',
        coordinates: {
          x: -0.82,
          y: 0.78,
          z: 0.85,
          color_hex: '#38BDF8',
          color_label: '자료유형: 입문 개념백과'
        },
        summary_3lines: [
          '의료·채용·신용평가 등 사람의 권리에 중대한 영향을 미치는 고위험 AI의 정의를 일상 사례로 풀이',
          'AI 생성물임을 표시하는 가시적·비가시적 워터마크의 작동 방식과 필요성 안내',
          '복잡한 법률·기술 용어를 누구나 쉽게 이해하도록 정리한 입문형 지식 자료'
        ],
        keywords: ['고위험AI정의', '워터마크개념', '쉬운입문해설', '디지털백과'],
        ai_rationale: '누구나 이해하기 쉬운 입문 난이도(X축 -0.82)이면서 핵심 개념(Y축 +0.78)을 정확하게(Z축 +0.85) 설명합니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'know_art_3',
        modeCategory: 'knowledge',
        title: '[심화 엔지니어링] GPU·NPU·PIM 반도체의 메모리 대역폭 병목(Memory Wall) 해결 원리',
        publisher: '반도체공학회 기술백서',
        pub_date: '2026-09-25',
        coordinates: {
          x: 0.88,
          y: 0.9,
          z: 0.96,
          color_hex: '#6366F1',
          color_label: '자료유형: 전문 아키텍처'
        },
        summary_3lines: [
          '폰노이만 구조에서 연산기(ALU)와 메모리 간 데이터 이동 에너지가 연산 자체의 100배에 달하는 물리적 원리 규명',
          'HBM TSV 수직 적층과 PIM(Processing-In-Memory)이 대역폭 한계를 돌파하는 회로 구조 해설',
          '하드웨어 아키텍처의 깊은 전문 지식을 담은 고밀도 기술 원리 자료'
        ],
        keywords: ['메모리병목원리', '폰노이만한계', 'NPU_PIM구조', '전문기술해설'],
        ai_rationale: '심화 전문 엔지니어링 수준(X축 +0.88), 하드웨어 핵심 원리(Y축 +0.90), 표준 명세 기반 최고 정확도(Z축 +0.96)입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'know_art_4',
        modeCategory: 'knowledge',
        title: '[핵심 비교 개념] 파인튜닝(Fine-Tuning) vs 검색증강생성(RAG) vs 프롬프트 엔지니어링 차이점',
        publisher: '모두의AI 기술문서',
        pub_date: '2026-09-26',
        coordinates: {
          x: -0.2,
          y: 0.86,
          z: 0.88,
          color_hex: '#10B981',
          color_label: '자료유형: 개념 비교가이드'
        },
        summary_3lines: [
          '모델 가중치를 직접 수정하는 파인튜닝과 외부 최신 문서를 참조하는 RAG의 구조적 차이 비교',
          '비용·최신성·환각 통제 측면에서 각 기법을 언제 선택해야 하는지 의사결정 트리 제시',
          '실무와 학습 모두에서 핵심 뼈대가 되는 필수 비교 지식'
        ],
        keywords: ['RAG개념비교', '파인튜닝원리', '가중치업데이트', '핵심차이점'],
        ai_rationale: '중급 눈높이(X축 -0.20)에서 실무 핵심 원리(Y축 +0.86)를 높은 정확도(Z축 +0.88)로 정리한 지식 문서입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'know_art_5',
        modeCategory: 'knowledge',
        title: '[용어 사전] AI 에이전트(Agent) · MCP(Model Context Protocol) · 함수 호출(Tool Use) 개념 정리',
        publisher: '소프트웨어정책연구소(SPRi) 용어해설집',
        pub_date: '2026-09-22',
        coordinates: {
          x: -0.45,
          y: 0.72,
          z: 0.9,
          color_hex: '#F59E0B',
          color_label: '자료유형: 표준 용어사전'
        },
        summary_3lines: [
          '단순 질의응답 챗봇을 넘어 스스로 계획을 세우고 외부 도구를 실행하는 자율형 AI 에이전트 정의',
          'AI 모델과 외부 데이터·API를 표준화된 방식으로 연결하는 MCP 프로토콜의 작동 구조',
          '최신 AI 생태계 문헌을 읽기 위한 필수 표준 용어 해설'
        ],
        keywords: ['AI에이전트정의', 'MCP프로토콜원리', '표준용어사전', '도구호출개념'],
        ai_rationale: '이해하기 쉬운 설명(X축 -0.45)과 높은 표준 정의 정확도(Z축 +0.90)를 제공하는 용어 해설 자료입니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'know_art_6',
        modeCategory: 'knowledge',
        title: '[심화 수리 원리] 확산 모델(Diffusion Model)의 정방향 노이즈 추가와 역방향 확률미분방정식(SDE)',
        publisher: '고등과학원(KIAS) AI 수리해설',
        pub_date: '2026-09-18',
        coordinates: {
          x: 0.94,
          y: 0.82,
          z: 0.95,
          color_hex: '#6366F1',
          color_label: '자료유형: 심화 수리원리'
        },
        summary_3lines: [
          '열역학 비평형 과정에서 착안한 데이터 분포의 점진적 가우시안 노이즈 변환 수식 유도',
          '스코어 매칭(Score Matching)과 역방향 확률미분방정식을 통한 고해상도 이미지 복원 원리',
          '생성형 비전 AI의 수학적 뿌리를 완벽히 해설한 최고 난이도 지식 자료'
        ],
        keywords: ['디퓨전모델원리', '확률미분방정식', '스코어매칭', '심화수리해설'],
        ai_rationale: '전문가 수준의 심화 원리(X축 +0.94), 생성모델 핵심도(Y축 +0.82), 수학적 엄밀성/정확도(Z축 +0.95)를 갖추었습니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  },

  deep: {
    id: 'mode-graph-deep',
    name: 'AI 국가 주권 & 글로벌 규범 패권 (심층 모드)',
    modeId: 'deep',
    axes: {
      x_axis: 'AI가 정함 (자율 혁신 ↔ 안전 통제): 안전 통제/거버넌스 우선 (-1.0) ↔ 중립 (0.0) ↔ 자율 혁신/초격차 확장 (+1.0)',
      y_axis: 'AI가 정함 (장기 구조적 파급도): 단기 현안/미시적 적응 (-1.0) ↔ 중립 (0.0) ↔ 장기 패러다임 전환 (+1.0)',
      z_axis: '신뢰도: 단일 관점 추론 (-1.0) ↔ 중립 (0.0) ↔ 다중 교차검증 심층 근거 (+1.0)',
      color_axis: '하위 질문 (Q1.기술주권 · Q2.규제거버넌스 · Q3.산업생태계 · Q4.윤리안전)'
    },
    articles: [
      {
        id: 'deep_art_1',
        modeCategory: 'deep',
        title: '[심층 Q1. 기술주권] 소버린 AI(Sovereign AI) 확보 없이는 디지털 식민지 전락... 독자 파운데이션 모델의 전략적 가치',
        publisher: '국가미래전략원 심층보고서',
        pub_date: '2026-09-29',
        coordinates: {
          x: 0.85,
          y: 0.92,
          z: 0.91,
          color_hex: '#10B981',
          color_label: '하위질문1: 소버린AI·기술주권'
        },
        summary_3lines: [
          '[하위 질문 1] 왜 해외 빅테크 API 의존을 넘어 독자 AI 모델과 인프라를 구축해야 하는가?',
          '국방·행정·금융 핵심 데이터의 해외 종속 리스크와 향후 10년 부가가치 유출 규모 추산',
          'AI가 설정한 X축(자율 혁신 +0.85)과 Y축(장기 패러다임 전환 +0.92)의 최상위 전략 분석'
        ],
        keywords: ['소버린AI', '하위질문_기술주권', '독자파운데이션모델', '심층전략'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q1(기술주권)에 해당하며, 자율 혁신 확장(X축 +0.85)과 국가 장기 구조적 파급(Y축 +0.92), 다중 근거 신뢰도(Z축 +0.91)로 배치되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'deep_art_2',
        modeCategory: 'deep',
        title: '[심층 Q2. 규제거버넌스] EU 브뤼셀 효과 vs 미국식 자율규제: 한국 AI 기본법의 통상 마찰 시나리오 심층 해부',
        publisher: '대외경제정책연구원(KIEP) 심층분석',
        pub_date: '2026-09-28',
        coordinates: {
          x: -0.42,
          y: 0.84,
          z: 0.93,
          color_hex: '#3B82F6',
          color_label: '하위질문2: 국제규범·통상거버넌스'
        },
        summary_3lines: [
          '[하위 질문 2] 글로벌 AI 규제 파편화 속에서 한국의 법제화는 수출 장벽이 될 것인가, 보호막이 될 것인가?',
          'EU AI Act의 역외 적용 조항과 한·미 디지털 통상 협정 간 충돌 가능성 정밀 시뮬레이션',
          '국제법·통상·기술 표준을 교차 검증한 고신뢰 심층 레포트'
        ],
        keywords: ['하위질문_규제거버넌스', '브뤼셀효과', '디지털통상마찰', '글로벌정합성'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q2(규제거버넌스) 클러스터로, 국제 규범 통제(X축 -0.42), 장기 통상 구조 파급(Y축 +0.84), 교차검증 신뢰도(Z축 +0.93)에 위치합니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'deep_art_3',
        modeCategory: 'deep',
        title: '[심층 Q3. 산업생태계] 반도체-클라우드-버티컬 AI 삼각 동맹의 수익성 구조와 빅테크 독점 해체 조건',
        publisher: '산업연구원(KIET) 밸류체인 리포트',
        pub_date: '2026-09-27',
        coordinates: {
          x: 0.68,
          y: 0.78,
          z: 0.87,
          color_hex: '#F59E0B',
          color_label: '하위질문3: 밸류체인·산업생태계'
        },
        summary_3lines: [
          '[하위 질문 3] 막대한 AI 인프라 투자비는 실제 어느 산업 계층에서 회수되고 있는가?',
          '파운데이션 모델의 오픈소스 확산에 따라 가치가 특화 도메인(의료·제조·법률) 앱으로 이동하는 구조 규명',
          '국내 메모리 반도체 우위를 AI 서비스 생태계 경쟁력으로 전환하는 로드맵 제시'
        ],
        keywords: ['하위질문_산업생태계', '밸류체인수익구조', '버티컬AI', '오픈소스확산'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q3(산업생태계)에 속하며, 산업 확장(X축 +0.68), 중장기 밸류체인 재편(Y축 +0.78), 실증 신뢰도(Z축 +0.87)로 평가되었습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'deep_art_4',
        modeCategory: 'deep',
        title: '[심층 Q4. 윤리안전] 자율형 에이전트 시대의 통제 불능(Alignment Failure) 리스크와 킬스위치 법제화 논쟁',
        publisher: 'AI안전연구소(AISI) 심층브리프',
        pub_date: '2026-09-26',
        coordinates: {
          x: -0.86,
          y: 0.89,
          z: 0.85,
          color_hex: '#F43F5E',
          color_label: '하위질문4: AI정렬·윤리안전망'
        },
        summary_3lines: [
          '[하위 질문 4] 스스로 코드를 작성하고 실행하는 차세대 AI의 실존적·사회적 위험을 어떻게 통제할 것인가?',
          '금융망 교란·사이버 공격에 악용될 수 있는 프론티어 모델의 레드팀 검증 의무화 기준',
          '안전 통제 축(X축 -0.86)의 극단에서 인류 안전망을 다룬 심층 연구'
        ],
        keywords: ['하위질문_윤리안전', 'AI안전연구소', '레드팀검증', '얼라인먼트'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q4(윤리안전) 그룹으로, 강력한 안전 통제(X축 -0.86), 장기 문명적 파급도(Y축 +0.89), 높은 신뢰도(Z축 +0.85)를 기록했습니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'deep_art_5',
        modeCategory: 'deep',
        title: '[심층 Q3. 산업생태계] 저출산·고령화 쇼크 속 AI 자동화가 한국 잠재성장률을 반등시킬 수 있는가?',
        publisher: '한국은행 경제연구원 심층논고',
        pub_date: '2026-09-25',
        coordinates: {
          x: 0.54,
          y: 0.94,
          z: 0.95,
          color_hex: '#F59E0B',
          color_label: '하위질문3: 인구구조·잠재성장률'
        },
        summary_3lines: [
          '[하위 질문 3] 생산가능인구 급감 위기를 AI 총요소생산성 향상으로 상쇄할 수 있는 조건은 무엇인가?',
          '2035년까지 AI 전면 도입 시 잠재성장률 하락 폭을 연 0.8%p 방어할 수 있다는 거시 시뮬레이션',
          '노동시장 재교육 및 직무 전환 지체 시 발생할 양극화 부작용 동시 진단'
        ],
        keywords: ['하위질문_잠재성장률', '인구절벽해법', '총요소생산성', '한국은행심층'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q3(산업·인구구조) 심층 분석으로, 국가 장기 구조 파급도(Y축 +0.94)와 최고 수준의 데이터 신뢰도(Z축 +0.95)를 보여줍니다.',
        origin_link: 'https://news.naver.com'
      },
      {
        id: 'deep_art_6',
        modeCategory: 'deep',
        title: '[심층 Q2. 규제거버넌스] 저작권법 공정이용(Fair Use) 법리와 AI 학습데이터 보상 기금 모델의 국제 비교',
        publisher: '서울대 법학연구소 기술법제 리뷰',
        pub_date: '2026-09-23',
        coordinates: {
          x: -0.18,
          y: 0.65,
          z: 0.88,
          color_hex: '#3B82F6',
          color_label: '하위질문2: 저작권·데이터거버넌스'
        },
        summary_3lines: [
          '[하위 질문 2] 언론사·창작자의 저작권 보호와 AI 학습 데이터 확보의 딜레마를 어떻게 풀 것인가?',
          '미국 뉴욕타임스 소송 판례 분석 및 유럽식 집단 라이선싱·보상 기금 제도 비교',
          '혁신과 창작 생태계 공존을 위한 법제적 해법을 제시한 심층 문헌'
        ],
        keywords: ['하위질문_저작권거버넌스', '공정이용법리', '학습데이터보상', '판례심층분석'],
        ai_rationale: '[AI 동적 축 산출] 하위 질문 Q2(저작권 거버넌스)에 해당하며, 중립적 제도 절충(X축 -0.18), 법제 파급도(Y축 +0.65), 판례 기반 신뢰도(Z축 +0.88)입니다.',
        origin_link: 'https://news.naver.com'
      }
    ]
  }
};

export const DEMO_DATASETS: Record<string, DatasetItem> = {
  "AI 기본법": MODE_DEMO_GRAPHS.news,
  "쇼핑·제품 비교": MODE_DEMO_GRAPHS.shopping,
  "학술 논문 근거": MODE_DEMO_GRAPHS.paper,
  "특허 선행 조사": MODE_DEMO_GRAPHS.patent,
  "공공 통계 수치": MODE_DEMO_GRAPHS.stats,
  "핵심 개념·원리": MODE_DEMO_GRAPHS.knowledge,
  "복합 심층 조사": MODE_DEMO_GRAPHS.deep
};

