export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'initial-econ-database',
    date: '2026-05-22',
    title: '經濟資料庫請點這裡！',
    link: '/database',
    body: '',
    tag: '最新',
    highlight: 'true',
    published: 'true',
    publishFrom: '',
    publishUntil: '',
    order: '10',
  },
];

export const INITIAL_LINKS = [
  {
    id: 'initial-instagram', group: '社群媒體', title: '系學會 Instagram',
    description: '追蹤最新活動動態', url: 'https://www.instagram.com/ntueconsa/',
    icon: 'instagram', order: '10', showOnHome: 'true', published: 'true',
  },
  {
    id: 'initial-facebook', group: '社群媒體', title: '系學會 Facebook',
    description: '粉絲專頁公告與貼文', url: 'https://www.facebook.com/ntueconsa',
    icon: 'facebook', order: '20', showOnHome: 'true', published: 'true',
  },
  {
    id: 'initial-department', group: '官方資源', title: '臺大經濟系官網',
    description: '系所介紹、師資、課程資訊', url: 'http://www.econ.ntu.edu.tw/',
    icon: 'globe', order: '30', showOnHome: 'true', published: 'true',
  },
  {
    id: 'initial-giving', group: '官方資源', title: '台大財務處捐款專頁',
    description: '透過台大財務處贊助學生會', url: 'https://giving.ntu.edu.tw/',
    icon: 'globe', order: '40', showOnHome: 'false', published: 'true',
  },
  {
    id: 'initial-youtube', group: '影音頻道', title: 'NTU Econ Night YouTube',
    description: '歷年經濟之夜活動影片', url: 'https://www.youtube.com/@ntuEconNight/videos',
    icon: 'youtube', order: '50', showOnHome: 'false', published: 'true',
  },
];
