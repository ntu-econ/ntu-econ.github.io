(function () {
  'use strict';

  var Portal = window.NtuEconPortal;
  var records = new Map();
  var bound = false;

  function field(key, label, value, type) {
    return { key: key, label: label, defaultValue: value || '', type: type || 'text' };
  }

  function group(label, fields) {
    return { label: label, fields: fields };
  }

  var PAGES = {
    about: {
      label: '關於我們', publicUrl: 'https://ntu-econ.github.io/01_about.html',
      hero: ['heroTitle', 'heroEyebrow', 'heroIntro'],
      groups: [
        group('頁首', [
          field('heroTitle', '中文標題', '關於我們'), field('heroEyebrow', '英文標題', 'ABOUT US'),
          field('heroIntro', '頁面簡介', '國立臺灣大學經濟學系學生會（NTU ECON SA）是代表臺大經濟系全體大學部學生的自治組織。', 'textarea'),
        ]),
        group('核心任務與願景', [
          field('missionTitle', '區塊標題', '核心任務與願景'),
          field('mission1Title', '任務 1 標題', '權益維護'), field('mission1Body', '任務 1 說明', '擔任系方與學生間的溝通橋樑，為學生爭取更優質的學習與生活環境', 'textarea'),
          field('mission2Title', '任務 2 標題', '資源共享'), field('mission2Body', '任務 2 說明', '建置臺大經濟資料庫，整合學習資源，並協助系友與在校生的資訊對接', 'textarea'),
          field('mission3Title', '任務 3 標題', '社群凝聚'), field('mission3Body', '任務 3 說明', '舉辦跨年級、跨系所、跨國際的交流活動，建立緊密社群脈絡', 'textarea'),
          field('mission4Title', '任務 4 標題', '專業發展'), field('mission4Body', '任務 4 說明', '透過講座、參訪等活動，縮短學術理論與職場實務的差距，佈局多元職涯賽道', 'textarea'),
        ]),
        group('組織架構', [
          field('structureTitle', '區塊標題', '組織架構'), field('structureIntro', '區塊簡介', '系學會設有會長與副會長，任期一年，設有多個部門，共同推動系務運作：', 'textarea'),
          field('department1Title', '部門 1', '會本部'), field('department1Body', '部門 1 說明', '維持各部門良好溝通、爭取學生權益及推動系學會各項政策以增加系上學生之福利。', 'textarea'),
          field('department2Title', '部門 2', '總務部'), field('department2Body', '部門 2 說明', '申請社團定籌款、統籌系學會年度資金，編列預算、審核各活動之預算及處理會務出納。', 'textarea'),
          field('department3Title', '部門 3', '活動部'), field('department3Body', '部門 3 說明', '舉辦系上大小活動，如系野餐、系烤、系酒會、經濟之夜，凝聚系上同學情誼。', 'textarea'),
          field('department4Title', '部門 4', '公關部'), field('department4Body', '部門 4 說明', '協助舉辦聯合舞會，系上活動拉贊、廠商接洽。', 'textarea'),
          field('department5Title', '部門 5', '學術部'), field('department5Body', '部門 5 說明', '主辦學術講座、職涯講座、讀書會以及一年一度的杜鵑花節，並維護系學會的學術資源庫。', 'textarea'),
          field('department6Title', '部門 6', '國際部'), field('department6Body', '部門 6 說明', '處理系上外籍生相關事務，如舉辦以英文為主的課外活動，融合本地生及外籍生，並協助推廣全英專班活動訊息。', 'textarea'),
          field('department7Title', '部門 7', '行設部'), field('department7Body', '部門 7 說明', '設計系學會年度主視覺、管理系學會官方社群帳號，宣傳活動。', 'textarea'),
          field('department8Title', '部門 8', '體育部'), field('department8Body', '部門 8 說明', '統籌系隊事務（如系籃、系排、系泳等）及與各校系學會輪流主辦「北經盃」、「大經盃」體育賽事。', 'textarea'),
        ]),
        group('年度亮點活動', [
          field('highlightsTitle', '區塊標題', '年度亮點活動'),
          field('highlight1Title', '活動 1', '經濟之夜'), field('highlight1Body', '活動 1 說明', '系上同學展現多元才藝之活動，如樂團表演、舞蹈演出、戲劇節目。', 'textarea'),
          field('highlight2Title', '活動 2', '職涯與學術講座'), field('highlight2Body', '活動 2 說明', '邀請知名系友或產業專家分享，包含金融、數據分析、學術研究等領域。', 'textarea'),
          field('highlight3Title', '活動 3', '杜鵑花節'), field('highlight3Body', '活動 3 說明', '向有興趣就讀本校系之高中生介紹本系之修課規劃及職涯發展等。', 'textarea'),
          field('highlight4Title', '活動 4', '經濟營'), field('highlight4Body', '活動 4 說明', '帶領高中生更認識經濟系及建立人際網絡。', 'textarea'),
          field('highlight5Title', '活動 5', '經濟週'), field('highlight5Body', '活動 5 說明', '販賣經濟系周邊商品、手作美食、設計小遊戲給系外同學娛樂。', 'textarea'),
          field('highlight6Title', '活動 6', '大迎新'), field('highlight6Body', '活動 6 說明', '學期初向新生介紹系學會及各系隊、邀請教授蒞臨指導。', 'textarea'),
          field('highlight7Title', '活動 7', '宿營'), field('highlight7Body', '活動 7 說明', '學長姐帶領準大一生於暑假一起於三天兩夜之團康活動同歡。', 'textarea'),
        ]),
        group('聯絡資訊', [
          field('contactTitle', '區塊標題', '聯絡我們'),
          field('contactOffice', '系學會辦公室', '國立臺灣大學社會科學院（社科院大樓）'),
          field('contactFeedback', '意見箱說明', '歡迎透過社群平台私訊或電郵向我們反映建議。', 'textarea'),
        ]),
      ],
      preview: [
        { title: 'missionTitle', pairs: [['mission1Title', 'mission1Body'], ['mission2Title', 'mission2Body'], ['mission3Title', 'mission3Body'], ['mission4Title', 'mission4Body']] },
        { title: 'structureTitle', intro: 'structureIntro', pairs: [['department1Title', 'department1Body'], ['department2Title', 'department2Body'], ['department3Title', 'department3Body'], ['department4Title', 'department4Body'], ['department5Title', 'department5Body'], ['department6Title', 'department6Body'], ['department7Title', 'department7Body'], ['department8Title', 'department8Body']] },
        { title: 'highlightsTitle', pairs: [['highlight1Title', 'highlight1Body'], ['highlight2Title', 'highlight2Body'], ['highlight3Title', 'highlight3Body'], ['highlight4Title', 'highlight4Body'], ['highlight5Title', 'highlight5Body'], ['highlight6Title', 'highlight6Body'], ['highlight7Title', 'highlight7Body']] },
        { title: 'contactTitle', pairs: [['contactOffice', 'contactFeedback']] },
      ],
      galleries: [
        ['highlights/econ-night', '經濟之夜精選'], ['highlights/lecture', '講座精選'], ['highlights/azalea', '杜鵑花節精選'],
        ['highlights/econ-camp', '經濟營精選'], ['highlights/econ-week', '經濟週精選'], ['highlights/orientation', '大迎新精選'], ['highlights/camp', '宿營精選'],
      ],
    },
    review: {
      label: '活動回顧', publicUrl: 'https://ntu-econ.github.io/02_review.html',
      hero: ['heroTitle', 'heroEyebrow', 'heroIntro'],
      groups: [
        group('頁首', [field('heroTitle', '中文標題', '活動回顧'), field('heroEyebrow', '英文標題', 'EVENTS'), field('heroIntro', '頁面簡介', '回顧國立臺灣大學經濟學系學生會歷年來舉辦的精彩活動，一同重溫那些難忘的時刻。', 'textarea')]),
        group('經濟之夜', [
          field('nightTitle', '區塊標題', '經濟之夜'), field('nightIntro', '活動介紹', '臺大學生的傳統之一，各系每年均會舉辦「XX之夜」。經濟之夜是一年一度由系學會企劃、拉贊、邀請系上同學排練並演出的活動。舉辦時間為一學年度的下學期（3-6月），演出地點通常位於活大一樓的怡仁堂。常見表演包括歌唱、樂團、舞蹈、戲劇等，是系上的一大盛事，也是系上同學們展現自己才藝的大好機會。', 'textarea'),
          field('night2024Title', '2024 主題', '《E心只想con著你》'), field('night2022Title', '2022 主題', '經宵別夢寒'),
          field('night2017Title', '2017 主題', '《紙醉經迷 Extravagant》'), field('night2016Title', '2016 主題', '《前世經生 About Time》'),
          field('night2015Title', '2015 主題', 'Serendipity'), field('night2014Title', '2014 主題', 'Exotic Crush'),
          field('night2013Title', '2013 主題', '36天流浪倒數'), field('night2012Title', '2012 主題', 'chocolate or me'),
        ]),
        group('經濟週', [field('weekTitle', '區塊標題', '經濟週'), field('weekIntro', '活動介紹', '經濟週是系學會每年舉辦的系列活動，通常包含園遊會、市集、主題展覽或講座等，旨在推廣經濟學知識，並提供系上同學與校內師生交流互動的平台。', 'textarea'), field('weekEventTitle', '年度主題', '經濟週主題'), field('weekEventBody', '年度說明', '此處可放置該年份經濟週的介紹、照片或相關連結。', 'textarea')]),
        group('經濟營', [field('campTitle', '區塊標題', '經濟營'), field('campIntro', '活動介紹', '每年暑假舉辦的經濟營，旨在讓高中生提早接觸經濟學領域，透過課程、講座、團體活動等方式，探索經濟學的奧秘，並體驗大學生活。是高中生認識台大經濟系的重要管道。', 'textarea'), field('campEventTitle', '年度主題', '經濟營主題'), field('campEventBody', '年度說明', '此處可放置該年份經濟營的介紹、照片或相關連結。', 'textarea')]),
        group('迎新', [field('orientationTitle', '區塊標題', '迎新'), field('orientationIntro', '活動介紹', '為了歡迎經濟系的新生，系學會每年都會舉辦迎新活動，幫助新生更快融入大學生活、認識系上同學與學長姐。', 'textarea'), field('orientationEventTitle', '活動主題', '迎新活動'), field('orientationEventBody', '活動說明', '此處將更新迎新活動的資訊，敬請期待。', 'textarea')]),
        group('其他活動', [
          field('otherTitle', '區塊標題', '其他活動'), field('otherIntro', '區塊介紹', '除了四大年度活動外，系學會也舉辦各式各樣的單次活動，豐富大家的課餘生活。', 'textarea'),
          field('other1Title', '活動 1', '麻將大賽'), field('other1Body', '活動 1 說明', '與系上同學切磋牌技的絕佳機會。', 'textarea'),
          field('other2Title', '活動 2', '系野餐'), field('other2Body', '活動 2 說明', '在校園草地享受悠閒的午後時光。', 'textarea'),
          field('other3Title', '活動 3', '系烤'), field('other3Body', '活動 3 說明', '增進感情的經典團體活動。', 'textarea'),
          field('other4Title', '活動 4', '系酒會'), field('other4Body', '活動 4 說明', '讓系上同學與教授在正式場合交流。', 'textarea'),
        ]),
      ],
      preview: [
        { title: 'nightTitle', intro: 'nightIntro', pairs: [['night2024Title', ''], ['night2022Title', ''], ['night2017Title', ''], ['night2016Title', ''], ['night2015Title', ''], ['night2014Title', ''], ['night2013Title', ''], ['night2012Title', '']] },
        { title: 'weekTitle', intro: 'weekIntro', pairs: [['weekEventTitle', 'weekEventBody']] },
        { title: 'campTitle', intro: 'campIntro', pairs: [['campEventTitle', 'campEventBody']] },
        { title: 'orientationTitle', intro: 'orientationIntro', pairs: [['orientationEventTitle', 'orientationEventBody']] },
        { title: 'otherTitle', intro: 'otherIntro', pairs: [['other1Title', 'other1Body'], ['other2Title', 'other2Body'], ['other3Title', 'other3Body'], ['other4Title', 'other4Body']] },
      ],
      galleries: [
        ['econ-night/2024', '經濟之夜 2024'], ['econ-night/2022', '經濟之夜 2022'], ['econ-night/2017', '經濟之夜 2017'], ['econ-night/2016', '經濟之夜 2016'],
        ['econ-night/2015', '經濟之夜 2015'], ['econ-night/2014', '經濟之夜 2014'], ['econ-night/2013', '經濟之夜 2013'], ['econ-night/2012', '經濟之夜 2012'],
        ['econ-week/2023', '經濟週 2023'], ['econ-camp/2023', '經濟營 2023'], ['orientation/future', '迎新'],
        ['other-activities/mahjong', '麻將大賽'], ['other-activities/picnic', '系野餐'], ['other-activities/bbq', '系烤'], ['other-activities/cocktail', '系酒會'],
      ],
    },
    support: {
      label: '贊助與支持', publicUrl: 'https://ntu-econ.github.io/03_support.html',
      hero: ['heroTitle', '', 'heroIntro'],
      groups: [
        group('頁首', [field('heroTitle', '頁面標題', '贊助與支持計畫'), field('heroIntro', '頁面簡介', '感謝您的支持。我們致力於將資源做最有效的運用，為經濟系師生創造更優質的學術與成長環境。', 'textarea')]),
        group('贊助流程', [
          field('processTitle', '區塊標題', '贊助流程說明'),
          field('step1Title', '步驟 1', '選擇方案'), field('step1Body', '步驟 1 說明', '瀏覽下方的贊助目標與紀念品，挑選您想支持的項目。', 'textarea'),
          field('step2Title', '步驟 2', '填寫資料'), field('step2Body', '步驟 2 說明', '留下聯絡資訊與地址。若需開立抵稅收據，請務必填寫身分證字號或統編。', 'textarea'),
          field('step3Title', '步驟 3', '進行支付'), field('step3Body', '步驟 3 說明', '支援匯入華南銀行臺大分行（可開立抵稅收據）、或郵局直接轉帳。', 'textarea'),
          field('step4Title', '步驟 4', '確認回覆'), field('step4Body', '步驟 4 說明', '完成匯款後，請務必主動通知學生會以利對帳；若需收據，校方約需兩週作業時間。', 'textarea'),
        ]),
        group('支付方式', [
          field('paymentTitle', '區塊標題', '支付方式'),
          field('payment1Title', '方式 1', '校方專戶匯款'), field('payment1Notice', '方式 1 說明', '如需由學校開立正式收據，請將捐款匯入學校帳戶。', 'textarea'),
          field('payment1Bank', '銀行', '華南商業銀行 臺大分行'), field('payment1Name', '戶名', '國立台灣大學 401 專戶'), field('payment1Account', '帳號', '154360000028'),
          field('payment2Title', '方式 2', '郵局直接轉帳'), field('payment2Notice', '方式 2 說明', '倘捐款者不需學校正式收據，可直接匯入學生會郵局帳戶辦理捐款。', 'textarea'), field('payment2Account', '郵局帳號', '0001236 0632402'),
        ]),
        group('物流及運費', [field('shippingTitle', '區塊標題', '物流及運費'), field('shippingBody', '物流說明', '我們將會把紀念品直接寄送給系友，無需負擔運費。', 'textarea'), field('shippingNote', '出貨說明', '視品項製作進度而定，現貨約 3-5 天，預購商品請參閱個別說明。', 'textarea')]),
        group('贊助目標', [
          field('goalsTitle', '區塊標題', '贊助目標'),
          field('goal1Title', '目標 1', '學術講座'), field('goal1Body', '目標 1 說明', '邀請國內外大師演講，提升學術視野。', 'textarea'),
          field('goal2Title', '目標 2', '空間優化'), field('goal2Body', '目標 2 說明', '改善系館討論室與公共空間硬體設備。', 'textarea'),
          field('goal3Title', '目標 3', '活動發展'), field('goal3Body', '目標 3 說明', '補助系隊比賽與各類學藝活動經費。', 'textarea'),
        ]),
        group('常見問題', [
          field('faqTitle', '區塊標題', '常見問題'),
          field('faq1Title', '問題 1', '只有系友才能捐款嗎？'), field('faq1Body', '回答 1', '不限系友，我們歡迎社會各界人士支持台大經濟系的發展，您的每一份心意都對我們至關重要。', 'textarea'),
          field('faq2Title', '問題 2', '可以匿名贊助嗎？'), field('faq2Body', '回答 2', '可以。請在聯絡表單或來信說明「希望匿名」，我們將會在公開徵信時將您的姓名隱藏，改以「善心人士」稱呼。', 'textarea'),
          field('faq3Title', '問題 3', '捐款收據可以抵稅嗎？'), field('faq3Body', '回答 3', '僅有透過「校方帳戶匯款」（華南商業銀行）捐款才可由學校開立正式抵稅收據；透過郵局直接轉帳僅供一般收據，無法用於報稅扣抵。', 'textarea'),
          field('faq4Title', '問題 4', '收據何時會收到？'), field('faq4Body', '回答 4', '若透過校方代收，學校出納組核對後約需兩週作業時間，收據將郵寄至您的地址。', 'textarea'),
          field('faq5Title', '問題 5', '匯款完成後需要主動通知嗎？'), field('faq5Body', '回答 5', '是的，匯款後請您務必來信或透過表單提供您的匯款帳號後五碼及金額，以利我們後續進行對帳作業。', 'textarea'),
          field('faq6Title', '問題 6', '如果有操作問題該聯絡誰？'), field('faq6Body', '回答 6', '歡迎來信 ntu.econ.student@gmail.com 或私訊學生會粉絲專頁，我們將有專人為您服務。', 'textarea'),
        ]),
      ],
      preview: [
        { title: 'processTitle', pairs: [['step1Title', 'step1Body'], ['step2Title', 'step2Body'], ['step3Title', 'step3Body'], ['step4Title', 'step4Body']] },
        { title: 'paymentTitle', pairs: [['payment1Title', 'payment1Notice'], ['payment2Title', 'payment2Notice']] },
        { title: 'shippingTitle', pairs: [['shippingBody', 'shippingNote']] },
        { title: 'goalsTitle', pairs: [['goal1Title', 'goal1Body'], ['goal2Title', 'goal2Body'], ['goal3Title', 'goal3Body']] },
        { title: 'faqTitle', pairs: [['faq1Title', 'faq1Body'], ['faq2Title', 'faq2Body'], ['faq3Title', 'faq3Body'], ['faq4Title', 'faq4Body'], ['faq5Title', 'faq5Body'], ['faq6Title', 'faq6Body']] },
      ],
      galleries: [],
    },
  };

  var BLOCK_TYPES = {
    hero: {
      label: '橫幅', icon: '▣',
      defaults: { tone: 'navy', width: 'full', align: 'left', eyebrow: 'NTU ECON SA', title: '輸入頁面標題', body: '用一小段話介紹這個頁面的重點。', imageUrl: '', imageAlt: '' },
      fields: [
        ['eyebrow', '英文小標', 'text'], ['title', '主標題', 'text'], ['body', '介紹文字', 'textarea'],
        ['imageUrl', '背景／主視覺圖片網址', 'url'], ['imageAlt', '圖片替代文字', 'text'],
      ],
    },
    text: {
      label: '文字', icon: '¶',
      defaults: { tone: 'plain', width: 'wide', align: 'left', eyebrow: '', title: '段落標題', body: '在這裡輸入段落內容。', columns: 'one' },
      fields: [['eyebrow', '小標', 'text'], ['title', '標題', 'text'], ['body', '內容', 'textarea'], ['columns', '文字欄數', 'columnsText']],
    },
    image: {
      label: '圖片', icon: '▧',
      defaults: { tone: 'plain', width: 'wide', align: 'center', imageUrl: '', imageAlt: '', caption: '', linkUrl: '', aspect: 'landscape' },
      fields: [['imageUrl', '圖片網址或站內路徑', 'url'], ['imageAlt', '圖片替代文字', 'text'], ['caption', '圖片說明', 'textarea'], ['linkUrl', '點擊圖片前往（選填）', 'url'], ['aspect', '圖片比例', 'aspect']],
    },
    split: {
      label: '圖文並排', icon: '◫',
      defaults: { tone: 'soft', width: 'wide', align: 'left', eyebrow: '', title: '圖文區塊標題', body: '在這裡輸入介紹內容。', imageUrl: '', imageAlt: '', imageSide: 'left', buttonLabel: '', buttonUrl: '' },
      fields: [
        ['eyebrow', '小標', 'text'], ['title', '標題', 'text'], ['body', '內容', 'textarea'], ['imageUrl', '圖片網址或站內路徑', 'url'],
        ['imageAlt', '圖片替代文字', 'text'], ['imageSide', '圖片位置', 'imageSide'], ['buttonLabel', '按鈕文字（選填）', 'text'], ['buttonUrl', '按鈕連結（選填）', 'url'],
      ],
    },
    cards: {
      label: '卡片群組', icon: '▦',
      defaults: { tone: 'plain', width: 'wide', align: 'left', eyebrow: '', title: '卡片群組標題', body: '', columns: 'three', items: [{ title: '第一張卡片', body: '卡片內容', imageUrl: '', imageAlt: '', linkLabel: '', linkUrl: '' }] },
      fields: [['eyebrow', '小標', 'text'], ['title', '標題', 'text'], ['body', '群組介紹', 'textarea'], ['columns', '桌面欄數', 'columnsCards']],
    },
    button: {
      label: '按鈕', icon: '→',
      defaults: { tone: 'plain', width: 'wide', align: 'left', label: '了解更多', url: '', variant: 'primary' },
      fields: [['label', '按鈕文字', 'text'], ['url', '按鈕連結', 'url'], ['variant', '按鈕樣式', 'variant']],
    },
    divider: {
      label: '間距／分隔線', icon: '↕',
      defaults: { tone: 'plain', width: 'wide', align: 'left', space: 'medium', showLine: false },
      fields: [['space', '間距大小', 'space'], ['showLine', '顯示分隔線', 'checkbox']],
    },
  };

  var SELECT_OPTIONS = {
    tone: [['plain', '透明'], ['card', '白色卡片'], ['soft', '淺灰底'], ['navy', '深藍底'], ['gold', '金色底']],
    width: [['full', '滿版'], ['wide', '一般寬度'], ['narrow', '窄版']],
    align: [['left', '靠左'], ['center', '置中']],
    columnsText: [['one', '單欄'], ['two', '雙欄']],
    columnsCards: [['two', '兩欄'], ['three', '三欄'], ['four', '四欄']],
    aspect: [['auto', '依原圖'], ['wide', '超寬 16:7'], ['landscape', '橫式 4:3'], ['square', '正方形']],
    imageSide: [['left', '圖片在左'], ['right', '圖片在右']],
    variant: [['primary', '實心主按鈕'], ['outline', '外框按鈕'], ['text', '文字連結']],
    space: [['small', '小'], ['medium', '中'], ['large', '大']],
  };

  function blockId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return 'block-' + window.crypto.randomUUID();
    return 'block-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizedBlock(type, source) {
    var definition = BLOCK_TYPES[type];
    return Object.assign({ id: blockId(), type: type }, clone(definition.defaults), source || {}, { type: type });
  }

  function currentSlug() {
    return document.getElementById('page-editor-page').value;
  }

  function defaultsFor(schema) {
    var result = {};
    schema.groups.forEach(function (item) {
      item.fields.forEach(function (definition) { result[definition.key] = definition.defaultValue; });
    });
    return result;
  }

  function valuesFromForm() {
    var values = {};
    document.querySelectorAll('#page-editor-fields [data-page-key]').forEach(function (input) {
      values[input.dataset.pageKey] = input.value;
    });
    return values;
  }

  function galleriesFromForm() {
    var galleries = {};
    document.querySelectorAll('#page-editor-gallery-fields [data-gallery-key]').forEach(function (input) {
      var items = input.value.split(/\r?\n/).map(function (line) {
        var parts = line.split('|').map(function (part) { return part.trim(); });
        return parts[0] ? { url: parts[0], caption: parts[1] || '', credit: parts.slice(2).join(' | ') } : null;
      }).filter(Boolean);
      if (items.length) galleries[input.dataset.galleryKey] = items;
    });
    return galleries;
  }

  function galleryLines(items) {
    return Array.isArray(items) ? items.map(function (item) {
      if (typeof item === 'string') return item;
      return [item.url || '', item.caption || '', item.credit || ''].join(' | ').replace(/(?:\s*\|\s*)+$/, '');
    }).join('\n') : '';
  }

  function optionLabel(options, value) {
    var match = (options || []).find(function (entry) { return entry[0] === value; });
    return match ? match[1] : value;
  }

  function createEditorField(block, key, labelText, kind) {
    var wrapper = document.createElement('div');
    wrapper.className = 'field' + (kind === 'textarea' || kind === 'url' ? ' field--full' : '');
    var id = 'block-' + block.id.replace(/[^a-z0-9_-]/gi, '-') + '-' + key;
    var label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    var input;
    if (kind === 'textarea') {
      input = document.createElement('textarea');
      input.rows = key === 'body' ? 5 : 3;
      input.maxLength = 12000;
    } else if (kind === 'checkbox') {
      wrapper.className = 'field block-check-field';
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Portal.bool(block[key], false);
      label.className = 'check';
      label.replaceChildren(input, document.createTextNode(labelText));
      input.id = id;
      input.dataset.blockField = key;
      wrapper.appendChild(label);
      return wrapper;
    } else if (SELECT_OPTIONS[kind]) {
      input = document.createElement('select');
      SELECT_OPTIONS[kind].forEach(function (entry) {
        var option = document.createElement('option');
        option.value = entry[0];
        option.textContent = entry[1];
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = kind === 'url' ? 'text' : 'text';
      input.maxLength = kind === 'url' ? 2048 : 500;
      if (kind === 'url') input.placeholder = 'https://… 或 images/example.webp';
    }
    input.id = id;
    input.dataset.blockField = key;
    input.value = Portal.text(block[key]);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  function createCardItem(block, item, itemIndex) {
    var article = document.createElement('article');
    article.className = 'block-card-item';
    article.dataset.cardItem = String(itemIndex);
    var heading = document.createElement('div');
    heading.className = 'block-card-item__heading';
    addText(heading, 'strong', '', '卡片 ' + (itemIndex + 1));
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn--small';
    remove.dataset.removeCardItem = String(itemIndex);
    remove.textContent = '移除';
    heading.appendChild(remove);
    article.appendChild(heading);
    var fields = document.createElement('div');
    fields.className = 'block-card-item__fields';
    [
      ['title', '卡片標題', 'text'], ['body', '卡片內容', 'textarea'], ['imageUrl', '圖片網址／路徑', 'url'],
      ['imageAlt', '圖片替代文字', 'text'], ['linkLabel', '連結文字', 'text'], ['linkUrl', '連結網址', 'url'],
    ].forEach(function (definition) {
      var fieldNode = createEditorField({ id: block.id + '-card-' + itemIndex }, definition[0], definition[1], definition[2]);
      var input = fieldNode.querySelector('[data-block-field]');
      input.removeAttribute('data-block-field');
      input.dataset.cardField = definition[0];
      input.value = Portal.text(item && item[definition[0]]);
      fields.appendChild(fieldNode);
    });
    article.appendChild(fields);
    return article;
  }

  function renderCardItems(block, root) {
    Portal.clear(root);
    var items = Array.isArray(block.items) ? block.items : [];
    items.forEach(function (item, index) { root.appendChild(createCardItem(block, item, index)); });
  }

  function blockFromNode(node) {
    var type = node.dataset.blockType;
    var block = normalizedBlock(type, { id: node.dataset.blockId });
    node.querySelectorAll('[data-block-field]').forEach(function (input) {
      block[input.dataset.blockField] = input.type === 'checkbox' ? input.checked : input.value;
    });
    if (type === 'cards') {
      block.items = Array.from(node.querySelectorAll('[data-card-item]')).map(function (itemNode) {
        var item = {};
        itemNode.querySelectorAll('[data-card-field]').forEach(function (input) { item[input.dataset.cardField] = input.value; });
        return item;
      });
    }
    return block;
  }

  function blocksFromForm() {
    var root = document.getElementById('page-block-list');
    return Array.from(root.children).filter(function (node) { return node.dataset.pageBlock === 'true'; }).map(blockFromNode);
  }

  function refreshBlockNumbers() {
    var blocks = Array.from(document.getElementById('page-block-list').children);
    blocks.forEach(function (node, index) {
      var number = node.querySelector('[data-block-number]');
      if (number) number.textContent = String(index + 1).padStart(2, '0');
      var up = node.querySelector('[data-block-action="up"]');
      var down = node.querySelector('[data-block-action="down"]');
      if (up) up.disabled = index === 0;
      if (down) down.disabled = index === blocks.length - 1;
    });
    document.getElementById('page-builder-empty').hidden = blocks.length > 0;
  }

  function renderBlockEditor(rawBlock, open) {
    var block = normalizedBlock(rawBlock.type, rawBlock);
    var definition = BLOCK_TYPES[block.type];
    var details = document.createElement('details');
    details.className = 'page-block-editor';
    details.dataset.pageBlock = 'true';
    details.dataset.blockId = block.id;
    details.dataset.blockType = block.type;
    details.open = open === true;

    var summary = document.createElement('summary');
    var handle = document.createElement('span');
    handle.className = 'block-drag-handle';
    handle.draggable = true;
    handle.title = '拖曳調整順序';
    handle.textContent = '⋮⋮';
    var number = document.createElement('span');
    number.className = 'block-number';
    number.dataset.blockNumber = 'true';
    var icon = document.createElement('span');
    icon.className = 'block-type-icon';
    icon.textContent = definition.icon;
    var title = document.createElement('span');
    title.className = 'block-summary-title';
    title.textContent = definition.label;
    var meta = document.createElement('small');
    meta.dataset.blockMeta = 'true';
    meta.textContent = optionLabel(SELECT_OPTIONS.width, block.width) + ' · ' + optionLabel(SELECT_OPTIONS.tone, block.tone);
    summary.append(handle, number, icon, title, meta);
    details.appendChild(summary);

    var body = document.createElement('div');
    body.className = 'page-block-editor__body';
    var layout = document.createElement('div');
    layout.className = 'block-layout-fields';
    layout.appendChild(createEditorField(block, 'width', '內容寬度', 'width'));
    if (block.type !== 'divider') {
      layout.appendChild(createEditorField(block, 'tone', '背景樣式', 'tone'));
      layout.appendChild(createEditorField(block, 'align', '文字對齊', 'align'));
    }
    body.appendChild(layout);
    var fields = document.createElement('div');
    fields.className = 'block-content-fields';
    definition.fields.forEach(function (fieldDefinition) {
      fields.appendChild(createEditorField(block, fieldDefinition[0], fieldDefinition[1], fieldDefinition[2]));
    });
    body.appendChild(fields);

    if (block.type === 'cards') {
      var cardHeader = document.createElement('div');
      cardHeader.className = 'block-items-heading';
      addText(cardHeader, 'strong', '', '卡片內容');
      var addCard = document.createElement('button');
      addCard.type = 'button';
      addCard.className = 'btn btn--small';
      addCard.dataset.addCardItem = 'true';
      addCard.textContent = '＋ 新增卡片';
      cardHeader.appendChild(addCard);
      body.appendChild(cardHeader);
      var cardsRoot = document.createElement('div');
      cardsRoot.className = 'block-card-items';
      cardsRoot.dataset.cardItems = 'true';
      renderCardItems(block, cardsRoot);
      body.appendChild(cardsRoot);
    }

    var actions = document.createElement('div');
    actions.className = 'block-actions';
    [['up', '↑ 上移'], ['down', '↓ 下移'], ['duplicate', '複製'], ['remove', '刪除']].forEach(function (entry) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--small' + (entry[0] === 'remove' ? ' btn--danger-soft' : '');
      button.dataset.blockAction = entry[0];
      button.textContent = entry[1];
      actions.appendChild(button);
    });
    body.appendChild(actions);
    details.appendChild(body);
    return details;
  }

  function renderBlockList(blocks) {
    var root = document.getElementById('page-block-list');
    Portal.clear(root);
    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      if (block && BLOCK_TYPES[block.type]) root.appendChild(renderBlockEditor(block, false));
    });
    refreshBlockNumbers();
  }

  function addText(parent, tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = Portal.text(value);
    parent.appendChild(node);
    return node;
  }

  function previewImage(url, alt, className) {
    var raw = Portal.trimmed(url);
    var base = PAGES[currentSlug()].publicUrl;
    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !/^https?:\/\//i.test(raw)) {
      base = 'http://localhost:8000/';
    }
    var resolved = raw;
    try { if (raw && !/^https?:\/\//i.test(raw)) resolved = new URL(raw, base).href; } catch (_error) { resolved = ''; }
    var safe = Portal.safeUrl(resolved, { allowRelative: false, allowHttp: true });
    if (!safe) {
      var placeholder = document.createElement('div');
      placeholder.className = (className || '') + ' builder-image-placeholder';
      placeholder.textContent = '加入圖片後會顯示在這裡';
      return placeholder;
    }
    var image = document.createElement('img');
    image.className = className || '';
    image.src = safe;
    image.alt = Portal.text(alt);
    image.loading = 'lazy';
    return image;
  }

  function previewButton(label, url, variant) {
    var link = Portal.createSafeLink(label || '按鈕文字', url || '#', 'builder-button builder-button--' + (variant || 'primary'));
    if (link) return link;
    var fallback = document.createElement('span');
    fallback.className = 'builder-button builder-button--' + (variant || 'primary');
    fallback.textContent = label || '按鈕文字';
    return fallback;
  }

  function appendPreviewHeading(parent, block) {
    if (block.eyebrow) addText(parent, 'small', 'builder-eyebrow', block.eyebrow);
    if (block.title) addText(parent, 'h3', '', block.title);
    if (block.body) addText(parent, 'p', 'builder-body', block.body);
  }

  function renderBuilderPreview(content, blocks) {
    blocks.forEach(function (block) {
      var section = document.createElement('section');
      section.className = 'builder-block builder-block--' + block.type + ' builder-tone--' + (block.tone || 'plain') + ' builder-width--' + (block.width || 'wide') + ' builder-align--' + (block.align || 'left');
      if (block.type === 'hero') {
        if (block.imageUrl) section.appendChild(previewImage(block.imageUrl, block.imageAlt, 'builder-hero-image'));
        var heroCopy = document.createElement('div');
        heroCopy.className = 'builder-hero-copy';
        appendPreviewHeading(heroCopy, block);
        section.appendChild(heroCopy);
      } else if (block.type === 'text') {
        appendPreviewHeading(section, block);
        if (block.columns === 'two') section.classList.add('builder-text--columns');
      } else if (block.type === 'image') {
        var figure = document.createElement('figure');
        figure.className = 'builder-figure builder-aspect--' + (block.aspect || 'landscape');
        figure.appendChild(previewImage(block.imageUrl, block.imageAlt, 'builder-figure-image'));
        if (block.caption) addText(figure, 'figcaption', '', block.caption);
        section.appendChild(figure);
      } else if (block.type === 'split') {
        var imageWrap = document.createElement('div');
        imageWrap.className = 'builder-split-image';
        imageWrap.appendChild(previewImage(block.imageUrl, block.imageAlt, ''));
        var splitCopy = document.createElement('div');
        splitCopy.className = 'builder-split-copy';
        appendPreviewHeading(splitCopy, block);
        if (block.buttonLabel) splitCopy.appendChild(previewButton(block.buttonLabel, block.buttonUrl, 'primary'));
        if (block.imageSide === 'right') section.classList.add('builder-split--reverse');
        section.append(imageWrap, splitCopy);
      } else if (block.type === 'cards') {
        var groupCopy = document.createElement('div');
        groupCopy.className = 'builder-group-heading';
        appendPreviewHeading(groupCopy, block);
        section.appendChild(groupCopy);
        var grid = document.createElement('div');
        grid.className = 'builder-cards builder-cards--' + (block.columns || 'three');
        (block.items || []).forEach(function (item) {
          var card = document.createElement('article');
          card.className = 'builder-card';
          if (item.imageUrl) card.appendChild(previewImage(item.imageUrl, item.imageAlt, 'builder-card-image'));
          var cardCopy = document.createElement('div');
          cardCopy.className = 'builder-card-copy';
          if (item.title) addText(cardCopy, 'strong', '', item.title);
          if (item.body) addText(cardCopy, 'p', '', item.body);
          if (item.linkLabel) cardCopy.appendChild(previewButton(item.linkLabel, item.linkUrl, 'text'));
          card.appendChild(cardCopy);
          grid.appendChild(card);
        });
        section.appendChild(grid);
      } else if (block.type === 'button') {
        section.appendChild(previewButton(block.label, block.url, block.variant));
      } else if (block.type === 'divider') {
        section.classList.add('builder-divider--' + (block.space || 'medium'));
        if (Portal.bool(block.showLine, false)) section.appendChild(document.createElement('hr'));
      }
      content.appendChild(section);
    });
  }

  function renderPreview() {
    var slug = currentSlug();
    var schema = PAGES[slug];
    var values = valuesFromForm();
    var content = document.getElementById('page-preview-content');
    Portal.clear(content);

    var blocks = blocksFromForm();
    if (blocks.length) {
      renderBuilderPreview(content, blocks);
      var customPublished = document.getElementById('page-content-published').checked;
      var customRecord = records.get(slug);
      Portal.setText(document.getElementById('page-preview-status'), (customPublished ? '自由版面' : '草稿') + ' · ' + blocks.length + ' 個區塊' + (customRecord ? ' · 已儲存過' : ' · 尚未儲存'));
      document.getElementById('page-preview-status').classList.toggle('is-draft', !customPublished);
      return;
    }

    var hero = document.createElement('section');
    hero.className = 'page-preview-hero';
    addText(hero, 'h2', '', values[schema.hero[0]] || schema.label);
    if (schema.hero[1]) addText(hero, 'small', '', values[schema.hero[1]] || '');
    addText(hero, 'p', '', values[schema.hero[2]] || '');
    content.appendChild(hero);

    schema.preview.forEach(function (preview) {
      var section = document.createElement('section');
      section.className = 'page-preview-section';
      addText(section, 'h3', '', values[preview.title] || '未命名區塊');
      if (preview.intro && values[preview.intro]) addText(section, 'p', 'section-copy', values[preview.intro]);
      var grid = document.createElement('div');
      grid.className = 'page-preview-grid';
      preview.pairs.forEach(function (pair) {
        var card = document.createElement('article');
        card.className = 'page-preview-card';
        addText(card, 'strong', '', values[pair[0]] || '未命名內容');
        if (pair[1]) addText(card, 'p', '', values[pair[1]] || '');
        grid.appendChild(card);
      });
      section.appendChild(grid);
      content.appendChild(section);
    });
    var published = document.getElementById('page-content-published').checked;
    var record = records.get(slug);
    Portal.setText(document.getElementById('page-preview-status'), published
      ? (record ? '原網站版面 · 已儲存過' : '原網站版面 · 尚未儲存，網站沿用靜態內容')
      : '草稿 · 公開網站會沿用靜態內容');
    document.getElementById('page-preview-status').classList.toggle('is-draft', !published);
  }

  function renderEditor(slug) {
    var schema = PAGES[slug];
    var record = records.get(slug) || null;
    var values = Object.assign(defaultsFor(schema), record && record.fields ? record.fields : {});
    var galleries = record && record.galleries ? record.galleries : {};
    var fieldsRoot = document.getElementById('page-editor-fields');
    var galleriesRoot = document.getElementById('page-editor-gallery-fields');
    Portal.clear(fieldsRoot);
    Portal.clear(galleriesRoot);
    document.getElementById('page-content-id').value = record ? Portal.text(record.id) : '';
    document.getElementById('page-content-published').checked = record ? Portal.bool(record.published, true) : true;
    Portal.setText(document.getElementById('page-editor-title'), schema.label);
    Portal.setText(document.getElementById('page-preview-title'), schema.label + '預覽');
    document.getElementById('page-editor-public-link').href = schema.publicUrl;
    renderBlockList(record && Array.isArray(record.blocks) ? record.blocks : []);

    schema.groups.forEach(function (item, groupIndex) {
      var details = document.createElement('details');
      details.className = 'page-editor-group';
      details.open = groupIndex === 0;
      addText(details, 'summary', '', item.label);
      var body = document.createElement('div');
      body.className = 'page-editor-group__body';
      item.fields.forEach(function (definition) {
        var wrapper = document.createElement('div');
        wrapper.className = 'field' + (definition.type === 'textarea' ? ' field--full' : '');
        var id = 'page-field-' + slug + '-' + definition.key;
        var label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = definition.label;
        var input = document.createElement(definition.type === 'textarea' ? 'textarea' : 'input');
        input.id = id;
        input.dataset.pageKey = definition.key;
        input.value = Portal.text(values[definition.key]);
        input.maxLength = definition.type === 'textarea' ? 12000 : 500;
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        body.appendChild(wrapper);
      });
      details.appendChild(body);
      fieldsRoot.appendChild(details);
    });

    schema.galleries.forEach(function (entry) {
      var wrapper = document.createElement('div');
      wrapper.className = 'field field--full';
      var id = 'page-gallery-' + slug + '-' + entry[0].replace(/[^a-z0-9]+/gi, '-');
      var label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = entry[1];
      var input = document.createElement('textarea');
      input.id = id;
      input.dataset.galleryKey = entry[0];
      input.placeholder = 'images/example.webp | 活動合照 | 攝影：王小明';
      input.value = galleryLines(galleries[entry[0]]);
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      galleriesRoot.appendChild(wrapper);
    });
    document.getElementById('page-editor-gallery-group').hidden = !schema.galleries.length;
    renderPreview();
  }

  async function load() {
    try {
      var result = await Portal.adminCall('listPageContent', {});
      var rows = Portal.arrayFrom(result, 'pages');
      records.clear();
      rows.forEach(function (row) { if (PAGES[row.slug]) records.set(row.slug, row); });
      renderEditor(currentSlug());
    } catch (error) {
      renderEditor(currentSlug());
      Portal.announce(Portal.errorMessage(error), 'error');
    }
  }

  async function save(event) {
    event.preventDefault();
    var button = event.submitter;
    if (button) button.disabled = true;
    try {
      var slug = currentSlug();
      var existing = records.get(slug) || {};
      var saved = await Portal.adminCall('savePageContent', {
        id: document.getElementById('page-content-id').value,
        slug: slug,
        fields: valuesFromForm(),
        galleries: galleriesFromForm(),
        blocks: blocksFromForm(),
        published: document.getElementById('page-content-published').checked,
        updatedAt: existing.updatedAt || '',
      }, { write: true });
      records.set(slug, saved);
      renderEditor(slug);
      Portal.announce(PAGES[slug].label + '已儲存。');
    } catch (error) {
      Portal.announce(Portal.errorMessage(error), 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function restoreDefaults() {
    var slug = currentSlug();
    var existing = records.get(slug);
    if (!existing) { renderEditor(slug); return; }
    if (!window.confirm('確定讓「' + PAGES[slug].label + '」恢復為程式內建內容？已儲存的頁面版本會被刪除。')) return;
    try {
      await Portal.adminCall('deletePageContent', { id: existing.id }, { write: true });
      records.delete(slug);
      renderEditor(slug);
      Portal.announce(PAGES[slug].label + '已恢復網站預設值。');
    } catch (error) {
      Portal.announce(Portal.errorMessage(error), 'error');
    }
  }

  function addBlock(type) {
    if (!BLOCK_TYPES[type]) return;
    var root = document.getElementById('page-block-list');
    var node = renderBlockEditor(normalizedBlock(type), true);
    root.appendChild(node);
    refreshBlockNumbers();
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderPreview();
  }

  function updateCardBlock(node, transform) {
    var block = blockFromNode(node);
    block.items = transform(Array.isArray(block.items) ? block.items : []);
    var replacement = renderBlockEditor(block, true);
    node.replaceWith(replacement);
    refreshBlockNumbers();
    renderPreview();
  }

  function handleBuilderClick(event) {
    var add = event.target.closest('[data-add-block]');
    if (add) { addBlock(add.dataset.addBlock); return; }
    var node = event.target.closest('[data-page-block="true"]');
    if (!node) return;
    if (event.target.closest('[data-add-card-item]')) {
      updateCardBlock(node, function (items) {
        return items.concat([{ title: '新卡片', body: '', imageUrl: '', imageAlt: '', linkLabel: '', linkUrl: '' }]);
      });
      return;
    }
    var removeCard = event.target.closest('[data-remove-card-item]');
    if (removeCard) {
      var removeIndex = Number(removeCard.dataset.removeCardItem);
      updateCardBlock(node, function (items) { return items.filter(function (_item, index) { return index !== removeIndex; }); });
      return;
    }
    var action = event.target.closest('[data-block-action]');
    if (!action) return;
    var root = document.getElementById('page-block-list');
    if (action.dataset.blockAction === 'up' && node.previousElementSibling) root.insertBefore(node, node.previousElementSibling);
    if (action.dataset.blockAction === 'down' && node.nextElementSibling) root.insertBefore(node.nextElementSibling, node);
    if (action.dataset.blockAction === 'duplicate') {
      var copy = blockFromNode(node);
      copy.id = blockId();
      root.insertBefore(renderBlockEditor(copy, true), node.nextElementSibling);
    }
    if (action.dataset.blockAction === 'remove') node.remove();
    refreshBlockNumbers();
    renderPreview();
  }

  function handleBuilderInput(event) {
    var node = event.target.closest('[data-page-block="true"]');
    if (node) {
      var meta = node.querySelector('[data-block-meta]');
      var block = blockFromNode(node);
      if (meta) meta.textContent = optionLabel(SELECT_OPTIONS.width, block.width) + ' · ' + optionLabel(SELECT_OPTIONS.tone, block.tone);
    }
    renderPreview();
  }

  function bindDragAndDrop() {
    var root = document.getElementById('page-block-list');
    var dragged = null;
    root.addEventListener('dragstart', function (event) {
      dragged = event.target.closest('[data-page-block="true"]');
      if (!dragged) return;
      dragged.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', dragged.dataset.blockId);
    });
    root.addEventListener('dragover', function (event) {
      if (!dragged) return;
      event.preventDefault();
      var target = event.target.closest('[data-page-block="true"]');
      if (!target || target === dragged) return;
      var box = target.getBoundingClientRect();
      root.insertBefore(dragged, event.clientY < box.top + box.height / 2 ? target : target.nextElementSibling);
    });
    root.addEventListener('dragend', function () {
      if (dragged) dragged.classList.remove('is-dragging');
      dragged = null;
      refreshBlockNumbers();
      renderPreview();
    });
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.getElementById('page-editor-page').addEventListener('change', function () { renderEditor(currentSlug()); });
    document.getElementById('page-content-form').addEventListener('input', renderPreview);
    document.getElementById('page-content-form').addEventListener('change', renderPreview);
    document.querySelector('.page-builder-toolbar').addEventListener('click', handleBuilderClick);
    document.getElementById('page-block-list').addEventListener('click', handleBuilderClick);
    document.getElementById('page-block-list').addEventListener('input', handleBuilderInput);
    document.getElementById('page-block-list').addEventListener('change', handleBuilderInput);
    bindDragAndDrop();
    document.getElementById('page-content-form').addEventListener('submit', save);
    document.getElementById('page-content-defaults').addEventListener('click', restoreDefaults);
    renderEditor(currentSlug());
  }

  window.NtuEconPageEditor = { bind: bind, load: load };
}());
