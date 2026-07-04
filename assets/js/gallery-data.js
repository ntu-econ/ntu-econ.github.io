



/*
 * 活動相簿資料
 * 結構：活動類別 -> 年份/主題 -> 圖片陣列。
 */
var GALLERY_DATA = {





  // 經濟之夜
  'econ-night': {

    '2025': [
      { url: 'images/econ-night/2025/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2025/02.webp', caption: '合照' },
      { url: 'images/econ-night/2025/03.webp', caption: '合照' },
      { url: 'images/econ-night/2025/04.webp', caption: '合照' },
      { url: 'images/econ-night/2025/05.webp', caption: '表演者獨照' },
      { url: 'images/econ-night/2025/06.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/07.webp', caption: '合照' },
      { url: 'images/econ-night/2025/08.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/09.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/10.webp', caption: '抽獎' },
      { url: 'images/econ-night/2025/11.webp', caption: '抽獎' },
      { url: 'images/econ-night/2025/12.webp', caption: '合照' },
      { url: 'images/econ-night/2025/13.webp', caption: '合照' },
      { url: 'images/econ-night/2025/14.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/15.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/16.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/17.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/18.webp', caption: '表演照' },
      { url: 'images/econ-night/2025/19.webp', caption: '表演照' },
    ],

    '2024': [
      { url: 'images/econ-night/2024/01.webp', caption: '大合照', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/02.webp', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/03.webp', caption: 'Econ baby', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/04.webp', caption: '菜頭想去海邊', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/05.webp', caption: '戴光佑徵女友', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/06.webp', caption: 'My name sayin', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/07.webp', caption: '家有大鼻', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/08.webp', caption: '家有大鼻', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/09.webp', caption: '一紅和他的小夥伴', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/10.webp', caption: 'To the X', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/11.webp', caption: '街舞', credit: '攝影：小柚子' },
      { url: 'images/econ-night/2024/12.webp', caption: '我更聰明寶貝', credit: '攝影：小柚子' },
    ],

    '2022': [
      { url: 'images/econ-night/2022/01.webp', caption: '劇1' },
      { url: 'images/econ-night/2022/02.webp', caption: 'Band-我想和你一起花錢' },
      { url: 'images/econ-night/2022/03.webp', caption: '女舞' },
      { url: 'images/econ-night/2022/04.webp', caption: '魔術' },
      { url: 'images/econ-night/2022/05.webp', caption: 'Band - Ryan\'s Party' },
      { url: 'images/econ-night/2022/06.webp', caption: '經吉檸檬' },
      { url: 'images/econ-night/2022/07.webp', caption: '唱跳' },
      { url: 'images/econ-night/2022/08.webp', caption: '男舞' },
      { url: 'images/econ-night/2022/09.webp', caption: 'Band-菜頭的白日夢' }
    ],

    '2017': [
      { url: 'images/econ-night/2017/01.webp', caption: '競技啦啦隊' },
      { url: 'images/econ-night/2017/02.webp', caption: '大一Band' },
      { url: 'images/econ-night/2017/03.webp', caption: '大二Band' },
      { url: 'images/econ-night/2017/04.webp', caption: '大一舞' },
      { url: 'images/econ-night/2017/05.webp', caption: '音樂劇' },
      { url: 'images/econ-night/2017/06.webp', caption: 'Acappella' },
      { url: 'images/econ-night/2017/07.webp', caption: '大四劇' },
      { url: 'images/econ-night/2017/08.webp', caption: '光舞' },
      { url: 'images/econ-night/2017/09.webp', caption: '跨屆女舞' },
      { url: 'images/econ-night/2017/10.webp', caption: '跨屆男舞' },
    ],

    '2016': [

    ],

    '2015': [
      { url: 'images/econ-night/2015/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2015/02.webp', caption: '倒數一天' },
      { url: 'images/econ-night/2015/03.webp', caption: '倒數三天' },
      { url: 'images/econ-night/2015/04.webp', caption: '倒數四天' },
      { url: 'images/econ-night/2015/05.webp', caption: '倒數六天' },
      { url: 'images/econ-night/2015/06.webp', caption: '倒數十天' },
      { url: 'images/econ-night/2015/07.webp', caption: '倒數十一天' },
      { url: 'images/econ-night/2015/08.webp', caption: '倒數十二天' },
      { url: 'images/econ-night/2015/09.webp', caption: '倒數十三天' },
      { url: 'images/econ-night/2015/10.webp', caption: '倒數十四天' },
      { url: 'images/econ-night/2015/11.webp', caption: '倒數十五天' },
      { url: 'images/econ-night/2015/12.webp', caption: '倒數十六天' },

    ],

    '2014': [
      { url: 'images/econ-night/2014/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2014/02.webp', caption: '倒數一天' },
      { url: 'images/econ-night/2014/03.webp', caption: '倒數五天' },
      { url: 'images/econ-night/2014/04.webp', caption: '倒數六天' },
      { url: 'images/econ-night/2014/05.webp', caption: '倒數九天' },
      { url: 'images/econ-night/2014/06.webp', caption: '倒數十天' },
      { url: 'images/econ-night/2014/07.webp', caption: '倒數十三天' },
      { url: 'images/econ-night/2014/08.webp', caption: '倒數十五天' },
      { url: 'images/econ-night/2014/09.webp', caption: '倒數十六天' },
      { url: 'images/econ-night/2014/10.webp', caption: '倒數十八天' },
      { url: 'images/econ-night/2014/11.webp', caption: '倒數十八天' },
      { url: 'images/econ-night/2014/12.webp', caption: '倒數二十天' }
    ],

    '2013': [
      { url: 'images/econ-night/2013/01.webp', caption: '大合照' },
      { url: 'images/econ-night/2013/02.webp', caption: '倒數33天' },
      { url: 'images/econ-night/2013/03.webp', caption: '倒數29天' },
      { url: 'images/econ-night/2013/04.webp', caption: '倒數28天' },
      { url: 'images/econ-night/2013/05.webp', caption: '倒數12天' },
      { url: 'images/econ-night/2013/06.webp', caption: '倒數6天' },
      { url: 'images/econ-night/2013/07.webp', caption: '倒數5天' },
      { url: 'images/econ-night/2013/08.webp', caption: '倒數3天' },
      { url: 'images/econ-night/2013/09.webp', caption: '倒數2天' },
      { url: 'images/econ-night/2013/10.webp', caption: '宣傳片' },
    ],

    '2012': [

    ]
  },

  
  // 經濟週 / 營隊 / 迎新
  'econ-week': {

    '2023': [


    ]
  },

  
  'econ-camp': {

    '2023': [


    ]
  },

  
  'orientation': {

    'future': [


    ]
  },

  
  // 其他活動
  'other-activities': {

    'mahjong': [   

    ],

    'picnic': [    

    ],

    'bbq': [       

    ],

    'cocktail': [  

    ]
  },

  
  // 首頁精選
  'highlights': {

    'econ-night': [    
      'images/econ-night/2024/01.webp'
    ],

    'lecture': [       

    ],

    'azalea': [        
      'images/highlights/azalea/02.JPG',
    ],

    'econ-camp': [     

    ],

    'econ-week': [     
      'images/econ-week/03.webp',
    ],

    'orientation': [   
      'images/orientation/IMG_9865.webp',
    ],

    'camp': [          
      'images/other-activities/orientation-camp/01.webp',
    ],
  }

};
