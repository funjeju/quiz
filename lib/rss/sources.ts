// === 전국 카테고리 ===
export const RSS_SOURCES = {
  entertainment: {
    name: '연예',
    urls: [
      'https://news.google.com/rss/search?q=연예+뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=드라마+영화+연예인&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  'current-affairs': {
    name: '시사',
    urls: [
      'https://news.google.com/rss/search?q=시사+한국뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=사회이슈+오늘뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  international: {
    name: '국제',
    urls: [
      'https://news.google.com/rss/search?q=국제뉴스+해외&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=미국+중국+일본+뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  sports: {
    name: '스포츠',
    urls: [
      'https://news.google.com/rss/search?q=스포츠+야구+축구&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=손흥민+류현진+스포츠선수&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  kpop: {
    name: 'K팝',
    urls: [
      'https://news.google.com/rss/search?q=kpop+케이팝+아이돌&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=BTS+블랙핑크+뉴진스+aespa&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  'ai-tech': {
    name: 'AI',
    urls: [
      'https://news.google.com/rss/search?q=인공지능+AI+ChatGPT&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=AI기술+딥러닝+머신러닝&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  politics: {
    name: '정치',
    urls: [
      'https://news.google.com/rss/search?q=정치+국회+대통령&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=여당+야당+정치뉴스&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  travel: {
    name: '여행',
    urls: [
      'https://news.google.com/rss/search?q=여행+관광+여행지&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=해외여행+국내여행+관광지&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  people: {
    name: '인물',
    urls: [
      'https://news.google.com/rss/search?q=화제인물+인물뉴스&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=유명인+인터뷰+CEO+인물&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
  it: {
    name: 'IT',
    urls: [
      'https://news.google.com/rss/search?q=IT기술+테크뉴스+스마트폰&hl=ko&gl=KR&ceid=KR:ko',
      'https://news.google.com/rss/search?q=삼성+애플+구글+IT기업&hl=ko&gl=KR&ceid=KR:ko',
    ],
    targetCount: 25,
  },
};

// === 지역 RSS ===
export const REGION_RSS_SOURCES = {
  jeju: {       // 고정 (매일)
    name: '제주',
    url: 'https://news.google.com/rss/search?q=제주+제주도뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  seoul: {
    name: '서울',
    url: 'https://news.google.com/rss/search?q=서울+서울뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  busan: {
    name: '부산',
    url: 'https://news.google.com/rss/search?q=부산+부산뉴스&hl=ko&gl=KR&ceid=KR:ko',
  },
  daegu: { name: '대구', url: 'https://news.google.com/rss/search?q=대구뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  incheon: { name: '인천', url: 'https://news.google.com/rss/search?q=인천뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gwangju: { name: '광주', url: 'https://news.google.com/rss/search?q=광주뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  daejeon: { name: '대전', url: 'https://news.google.com/rss/search?q=대전뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  ulsan: { name: '울산', url: 'https://news.google.com/rss/search?q=울산뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  sejong: { name: '세종', url: 'https://news.google.com/rss/search?q=세종뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeonggi: { name: '경기', url: 'https://news.google.com/rss/search?q=경기도뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gangwon: { name: '강원', url: 'https://news.google.com/rss/search?q=강원뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  chungbuk: { name: '충북', url: 'https://news.google.com/rss/search?q=충북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  chungnam: { name: '충남', url: 'https://news.google.com/rss/search?q=충남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  jeonbuk: { name: '전북', url: 'https://news.google.com/rss/search?q=전북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  jeonnam: { name: '전남', url: 'https://news.google.com/rss/search?q=전남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeongbuk: { name: '경북', url: 'https://news.google.com/rss/search?q=경북뉴스&hl=ko&gl=KR&ceid=KR:ko' },
  gyeongnam: { name: '경남', url: 'https://news.google.com/rss/search?q=경남뉴스&hl=ko&gl=KR&ceid=KR:ko' },
};

// 지역 순환 순서 (제주 제외)
export const REGION_ROTATION_ORDER = [
  'seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan',
  'sejong', 'gyeonggi', 'gangwon', 'chungbuk', 'chungnam',
  'jeonbuk', 'jeonnam', 'gyeongbuk', 'gyeongnam'
];

// 오늘 순환 지역 계산 (날짜 기반)
export function getTodayRegion(date: Date): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return REGION_ROTATION_ORDER[dayOfYear % REGION_ROTATION_ORDER.length];
}
