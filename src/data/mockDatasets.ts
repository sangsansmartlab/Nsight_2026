import { Article, CustomAxes } from '../types';

export interface DatasetItem {
  id: string;
  name: string;
  axes: CustomAxes;
  articles: Article[];
}

export const DEMO_DATASETS: Record<string, DatasetItem> = {
  "AI 기본법": {
    id: "ai-act",
    name: "AI 기본법",
    axes: {
      x_axis: "규제 중심 (-1.0) ↔ 중심 (0.0) ↔ 산업 진흥 (+1.0)",
      y_axis: "낮은 파급력 (-1.0) ↔ 기준 (0.0) ↔ 높은 파급력 (+1.0)",
      z_axis: "낮은 신뢰도 (-1.0) ↔ 중립 (0.0) ↔ 높은 신뢰도 (+1.0)",
      color_axis: "기사 성향 (핵심, 우려, 진흥, 윤리, 건설적)"
    },
    articles: [
      {
        id: "art_1",
        title: "국회 AI 기본법 제정안 통과... 규제와 진흥 사이 균형 모색 (핵심 기사)",
        publisher: "조선일보",
        pub_date: "2026-09-28",
        coordinates: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          color_hex: "#F59E0B",
          color_label: "핵심/기준"
        },
        summary_3lines: [
          "AI 기본법 국회 본회의 최종 통과 완료",
          "규제와 산업 진흥 사이 완벽한 정책적 균형점 모색",
          "본 프로젝트의 공간 중앙 (0,0,0) 절대 기준점 기사"
        ],
        keywords: ["AI기본법", "국회통과", "균형모색", "기준점"],
        ai_rationale: "규제와 진흥 조항을 균형 있게 다루어 정확히 중심점 (0.00, 0.00, 0.00)에 위치하도록 벡터화되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_2",
        title: "AI 법안 과도한 규제, 스타트업 혁신 동력 상실 우려",
        publisher: "전자신문",
        pub_date: "2026-09-27",
        coordinates: {
          x: -0.75,
          y: 0.40,
          z: -0.30,
          color_hex: "#EF4444",
          color_label: "비판/규제 우려"
        },
        summary_3lines: [
          "처벌 위주의 규제 조항에 대해 스타트업 협회 강력 반발",
          "초기 혁신 기업들의 법적 준수 비용 및 행정 부담 증가",
          "글로벌 AI 경쟁 속 국내 기업의 경쟁력 약화 경고"
        ],
        keywords: ["스타트업", "규제우려", "준수비용", "혁신위축"],
        ai_rationale: "규제 부작용에 대한 우려 측면에 강하게 치우쳐 X축 -0.75, 사회적 논란 파급력 Y축 +0.40으로 산출되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_3",
        title: "글로벌 AI 주권 확보 위해 국가 차원의 파격적 지원 필수",
        publisher: "매일경제",
        pub_date: "2026-09-28",
        coordinates: {
          x: 0.85,
          y: 0.80,
          z: 0.70,
          color_hex: "#10B981",
          color_label: "진흥/긍정"
        },
        summary_3lines: [
          "국가 인공지능 컴퓨팅 인프라 지원 및 세제 혜택 법제화 찬성",
          "미·중 기술 패권 전쟁에 대응할 골든타임 사수 촉구",
          "AI 유니콘 육성을 위한 10조원 펀드 조성안 부각"
        ],
        keywords: ["AI주권", "산업진흥", "인프라지원", "10조펀드"],
        ai_rationale: "산업 진흥 성향이 뚜렷하여 X축 +0.85, 정책의 거시경제적 파급력 Y축 +0.80, 구체적 통계 지표 인용으로 Z축 +0.70 평가.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_4",
        title: "AI 기본법 속 인권 및 윤리적 가이드라인 세부 분석",
        publisher: "한겨레",
        pub_date: "2026-09-26",
        coordinates: {
          x: -0.40,
          y: -0.20,
          z: 0.50,
          color_hex: "#8B5CF6",
          color_label: "윤리/사회안전"
        },
        summary_3lines: [
          "고위험 AI 영역에 대한 투명성 검증 및 워터마크 의무화",
          "딥페이크 및 편향성으로 인한 인권 침해 방지 안전망 구축",
          "시민단체 중심의 독립적 감독 기구 설치 요구 지속"
        ],
        keywords: ["AI윤리", "고위험AI", "투명성검증", "인권안전망"],
        ai_rationale: "윤리적 위험 방지와 안전성 규제 관점을 조명하여 X축 -0.40, 실증적 가이드라인 분석으로 Z축 +0.50 산출.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_5",
        title: "과학기술정보통신부, AI 법안 시행령 제정 민관합동 T/F 가동",
        publisher: "연합뉴스",
        pub_date: "2026-09-28",
        coordinates: {
          x: 0.10,
          y: -0.50,
          z: 0.90,
          color_hex: "#3B82F6",
          color_label: "중립/건설적"
        },
        summary_3lines: [
          "과기정통부, 법안 통과 직후 세부 시행령 마련 민관 TF 공식 출범",
          "산업계 및 학계, 법조계 전문가 50여 명 참여",
          "연내 현장 의견 수렴 공청회 및 가이드라인 초안 배포 예정"
        ],
        keywords: ["과기정통부", "시행령TF", "공식발표", "민관합동"],
        ai_rationale: "정부 부처의 공식 발표 보도로서 높은 신뢰도 Z축 +0.90, 중립적 집행 내용으로 X축 +0.10에 배정되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_8",
        title: "유럽연합(EU) AI Act와의 비교: 한국형 모델의 득과 실",
        publisher: "한국경제",
        pub_date: "2026-09-29",
        coordinates: {
          x: 0.35,
          y: 0.65,
          z: 0.85,
          color_hex: "#06B6D4",
          color_label: "글로벌비교/분석"
        },
        summary_3lines: [
          "EU의 전면적 사전 규제 대비 한국은 '선허용 후규제' 기조 채택",
          "해외 빅테크 진입 장벽과 토종 AI 파운데이션 모델 보호 효과 분석",
          "글로벌 표준과의 정합성 유지 여부가 향후 수출의 관건"
        ],
        keywords: ["EU AI Act", "글로벌비교", "선허용후규제", "파운데이션모델"],
        ai_rationale: "글로벌 규제와의 비교 실증 분석을 통해 신뢰도 Z축 +0.85, 산업 육성 친화적 분석으로 X축 +0.35 평가.",
        origin_link: "https://news.naver.com"
      }
    ]
  },
  "의대 증원": {
    id: "med-school",
    name: "의대 증원",
    axes: {
      x_axis: "의료계 반발 (-1.0) ↔ 핵심/중립 (0.0) ↔ 정부 추진 (+1.0)",
      y_axis: "낮은 파급력 (-1.0) ↔ 기준 (0.0) ↔ 높은 파급력 (+1.0)",
      z_axis: "낮은 신뢰도 (-1.0) ↔ 중립 (0.0) ↔ 높은 신뢰도 (+1.0)",
      color_axis: "기사 성향 (기준, 반대, 찬성, 중재, 정책)"
    },
    articles: [
      {
        id: "art_6",
        title: "2027학년도 의대 정원 공론화위원회 최종 보고서 발표 (핵심)",
        publisher: "한국일보",
        pub_date: "2026-09-25",
        coordinates: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          color_hex: "#F59E0B",
          color_label: "핵심/기준"
        },
        summary_3lines: [
          "의대 정원 조정 공론화위원회 다자간 합의 최종 보고서 공개",
          "정부 추진안과 의료계 요구의 객관적 데이터 비교 제시",
          "의대 증원 갈등 이슈의 공간 중앙 (0,0,0) 중립 기준점"
        ],
        keywords: ["공론화위원회", "최종보고서", "중립기준", "의대정원"],
        ai_rationale: "양측 입장을 대등하게 취합한 공식 중재 보고서로 공간의 원점 (0.00, 0.00, 0.00)에 배치되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_7",
        title: "의협 '의학교육 파행 대책 없는 증원 정책 전면 철회해야'",
        publisher: "청년의사",
        pub_date: "2026-09-24",
        coordinates: {
          x: -0.80,
          y: 0.70,
          z: 0.60,
          color_hex: "#EF4444",
          color_label: "의료계/반대"
        },
        summary_3lines: [
          "대한의사협회 기자회견 통해 증원 유예 및 원점 재검토 강력 촉구",
          "의과대학 실습실 및 교수진 부족으로 교육 질 저하 경고",
          "의료 현장 혼란 장기화에 대한 정부 책임론 제기"
        ],
        keywords: ["의협", "의학교육파행", "철회요구", "의료현장"],
        ai_rationale: "의료계의 강경한 반대 입장을 대변하여 X축 -0.80, 사회적 파급력 Y축 +0.70 평가.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_9",
        title: "보건복지부, '필수의료 붕괴 방지 및 지역의료 재건 위한 증원 불가피'",
        publisher: "동아일보",
        pub_date: "2026-09-26",
        coordinates: {
          x: 0.85,
          y: 0.75,
          z: 0.80,
          color_hex: "#10B981",
          color_label: "정부추진/찬성"
        },
        summary_3lines: [
          "지방 응급실 뺑뺑이 및 소아과 오픈런 등 필수의료 공백 해소 목표",
          "OECD 평균 대비 현저히 낮은 의사 수 통계 근거 제시",
          "지역의사제 및 필수의료 보상 강화 패키지 병행 추진"
        ],
        keywords: ["보건복지부", "필수의료", "지역의료", "OECD통계"],
        ai_rationale: "정부의 정책 추진 당위성과 공식 통계를 중심으로 서술되어 X축 +0.85, 신뢰도 Z축 +0.80 평가.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_10",
        title: "환자단체연합회, '의정 갈등 속 환자 생명 볼모 잡는 극한 대립 중단하라'",
        publisher: "경향신문",
        pub_date: "2026-09-25",
        coordinates: {
          x: -0.15,
          y: 0.85,
          z: 0.40,
          color_hex: "#8B5CF6",
          color_label: "사회/환자안전"
        },
        summary_3lines: [
          "중증 암환자 및 희귀질환자 수술 지연 피해 사례 호소",
          "정부와 의협 모두 대승적 타협을 통한 조속한 진료 정상화 촉구",
          "환자 권익 보호를 위한 법적 안전장치 마련 요구"
        ],
        keywords: ["환자단체", "수술지연", "피해호소", "진료정상화"],
        ai_rationale: "정부-의료계 대립 축에서 벗어나 환자 피해 관점을 부각하여 X축 -0.15, 매우 높은 사회적 절박도 Y축 +0.85.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_11",
        title: "의대 학장단 협의회, 2027 대입 모집요강 자율 조정안 제안",
        publisher: "중앙일보",
        pub_date: "2026-09-27",
        coordinates: {
          x: 0.20,
          y: -0.30,
          z: 0.70,
          color_hex: "#3B82F6",
          color_label: "중재/학술제안"
        },
        summary_3lines: [
          "전국 의대 학장단 회의서 현실적 정원 수용 범위 연구 결과 공개",
          "대학별 인프라 역량에 따른 점진적 단계 증원 모델 제시",
          "수험생 혼란 최소화를 위한 신속한 모집요강 확정 당부"
        ],
        keywords: ["의대학장단", "자율조정", "단계적증원", "모집요강"],
        ai_rationale: "교육 현장 수용성에 기반한 절충안 제시로 X축 +0.20, 상대적으로 안정적 정책 조율로 Y축 -0.30 배정.",
        origin_link: "https://news.naver.com"
      }
    ]
  },
  "반도체 패권": {
    id: "semiconductor",
    name: "반도체 패권",
    axes: {
      x_axis: "공급망 불안/규제 (-1.0) ↔ 글로벌 기준 (0.0) ↔ 대규모 투자/지원 (+1.0)",
      y_axis: "낮은 파급력 (-1.0) ↔ 기준 (0.0) ↔ 높은 파급력 (+1.0)",
      z_axis: "추정/소문 (-1.0) ↔ 중립 (0.0) ↔ 공식 데이터 (+1.0)",
      color_axis: "기사 성향 (투자, 공급망, 안보, 기술격차)"
    },
    articles: [
      {
        id: "art_12",
        title: "글로벌 반도체 공급망 백서 2026: 3대 블록 기술 패권 지형 (핵심)",
        publisher: "매일경제",
        pub_date: "2026-09-28",
        coordinates: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          color_hex: "#F59E0B",
          color_label: "핵심/기준"
        },
        summary_3lines: [
          "한·미·대만 연합체와 유럽·일본의 반도체 동맹 현황 집대성",
          "공급망 블록화와 칩 제조 원가 상관관계 정밀 진단",
          "글로벌 반도체 지형 분석의 중심 (0,0,0) 절대 기준점 기사"
        ],
        keywords: ["공급망백서", "반도체패권", "글로벌블록", "기준점"],
        ai_rationale: "특정 국가나 규제 편향 없이 글로벌 공급망 데이터 전체를 조망하여 (0.00, 0.00, 0.00)에 배치되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_13",
        title: "삼성전자·SK하이닉스 용인 메가 클러스터에 600조 총력 투자",
        publisher: "한국경제",
        pub_date: "2026-09-27",
        coordinates: {
          x: 0.90,
          y: 0.85,
          z: 0.90,
          color_hex: "#10B981",
          color_label: "대규모투자/호재"
        },
        summary_3lines: [
          "용인 반도체 메가 클러스터 전력·용수 공급 국가 인프라 확정",
          "HBM4 차세대 AI 메모리 양산 라인 조기 착공 계획",
          "수백조 원 규모의 연관 소부장 생태계 낙수 효과 기대"
        ],
        keywords: ["용인클러스터", "메모리투자", "HBM4", "소부장"],
        ai_rationale: "초대형 투자 유치와 인프라 지원을 다루어 X축 +0.90, 압도적인 경제적 파급력 Y축 +0.85 평가.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_14",
        title: "美 첨단 장비 대중 수출 통제 강화... 국내 기업 장비 도입 불확실성 증대",
        publisher: "아시아경제",
        pub_date: "2026-09-25",
        coordinates: {
          x: -0.70,
          y: 0.60,
          z: 0.50,
          color_hex: "#EF4444",
          color_label: "수출규제/우려"
        },
        summary_3lines: [
          "EUV 등 첨단 노광장비 및 식각 장비 수출 허가 기준 추가 강화",
          "중국 내 공장 운영 중인 국내 반도체 기업들의 업그레이드 차질",
          "지정학적 리스크 심화에 따른 제조 원가 상승 압박"
        ],
        keywords: ["대중수출통제", "장비도입", "지정학리스크", "불확실성"],
        ai_rationale: "수출 규제 및 공급망 경색 위험을 분석하여 X축 -0.70, 공급망 파급 효과 Y축 +0.60.",
        origin_link: "https://news.naver.com"
      }
    ]
  },
  "정치·정당 지형": {
    id: "politics-parties",
    name: "정치·정당 지형",
    axes: {
      x_axis: "진보 성향 (-1.0) ↔ 중도/중립 (0.0) ↔ 보수 성향 (+1.0)",
      y_axis: "낮은 정국 파급력 (-1.0) ↔ 보통 (0.0) ↔ 높은 사회적 논란/파급력 (+1.0)",
      z_axis: "정치적 의혹/공방 (-1.0) ↔ 중립 (0.0) ↔ 공인 팩트/실증 근거 (+1.0)",
      color_axis: "정치 성향 (보수: 빨강 #EF4444, 진보: 파랑 #3B82F6, 중립: 흰색 #F8FAFC)"
    },
    articles: [
      {
        id: "art_pol_center",
        title: "중앙선관위, 차기 총선 선거구 획정안 및 유권자 지형 분석 보고서 (중립 기준)",
        publisher: "연합뉴스",
        pub_date: "2026-10-01",
        coordinates: {
          x: 0.0,
          y: 0.0,
          z: 0.85,
          color_hex: "#F8FAFC",
          color_label: "중립/객관"
        },
        summary_3lines: [
          "중앙선관위 공식 통계 기반 인구 비례 선거구 획정안 발표",
          "여야 정당 유불리를 배제한 헌법재판소 판결 기준 충족",
          "정치적 중립 및 객관적 통계에 기초한 절대 기준점"
        ],
        keywords: ["선관위", "선거구획정", "중립통계", "기준점"],
        ai_rationale: "특정 정당 유불리 없이 공인된 팩트 데이터에 근거하여 X축 0.00(중립), Z축 +0.85(공식 팩트), 흰색(#F8FAFC)으로 배치되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_pol_cons",
        title: "여당 지도부, '자유시장 경제 복원 및 건전재정 기조 흔들림 없이 수호'",
        publisher: "조선일보",
        pub_date: "2026-10-02",
        coordinates: {
          x: 0.78,
          y: 0.65,
          z: 0.40,
          color_hex: "#EF4444",
          color_label: "보수 성향"
        },
        summary_3lines: [
          "법인세 감세 및 규제 철폐를 통한 민간 주도 성장 드라이브",
          "국가 채무 비율 통제 및 선심성 포퓰리즘 예산 전액 삭감 방침",
          "야당의 복지 지출 확대 법안에 대해 재정 파탄 위험 경고"
        ],
        keywords: ["건전재정", "자유시장", "규제철폐", "여당"],
        ai_rationale: "보수 진영의 핵심 가치인 시장 자율과 재정 건전성을 강하게 옹호하여 X축 +0.78, 보수 성향 빨강(#EF4444)으로 산출되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_pol_prog",
        title: "야당 원내대표, '사회 안전망 대폭 확충과 부자감세 철회 집중 추진'",
        publisher: "한겨레",
        pub_date: "2026-10-02",
        coordinates: {
          x: -0.82,
          y: 0.70,
          z: 0.35,
          color_hex: "#3B82F6",
          color_label: "진보 성향"
        },
        summary_3lines: [
          "양극화 해소를 위한 초과이익 환수 및 사회보장 지출 증액",
          "기후 위기 대응 녹색 전환 및 노동 기본권 보장 입법화 촉구",
          "정부 재정 기조를 '민생 외면 긴축'으로 규정하며 전면 수정 요구"
        ],
        keywords: ["사회안전망", "부자감세철회", "노동기본권", "야당"],
        ai_rationale: "진보 진영의 가치인 소득 재분배 및 공공성 확대를 대변하여 X축 -0.82, 진보 성향 파랑(#3B82F6)으로 산출되었습니다.",
        origin_link: "https://news.naver.com"
      },
      {
        id: "art_pol_debate",
        title: "국회 예결위, 내년도 예산안 파행... 여야 '혈세 낭비 vs 민생 외면' 극한 대치",
        publisher: "경향신문",
        pub_date: "2026-10-03",
        coordinates: {
          x: 0.05,
          y: 0.90,
          z: -0.60,
          color_hex: "#F8FAFC",
          color_label: "중립/갈등 보도"
        },
        summary_3lines: [
          "정기국회 예산안 심사 첫날부터 고성과 삿대질로 정회 반복",
          "R&D 및 지역화폐 예산 편성을 둘러싼 여야 원내대표 회동 결렬",
          "법정 시한 내 처리 불투명에 따른 준예산 편성 우려 대두"
        ],
        keywords: ["국회예결위", "예산안대치", "정쟁", "파행"],
        ai_rationale: "여야 양측의 주장을 동등하게 병렬 보도하여 X축 0.05(중립 흰색 #F8FAFC), 정국 파급력 Y축 +0.90으로 평가되었습니다.",
        origin_link: "https://news.naver.com"
      }
    ]
  }
};
