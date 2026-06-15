function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min
}

function randomFoodImage(seed) {
  return `https://picsum.photos/seed/${seed}/1200/800`
}

function buildRandomImages(seedPrefix) {

  const galleryCount = randomInt(0, 10)

  // cover/menu 至少 1 張
  const menuCount = randomInt(1, 10)

  return {
    cover: randomFoodImage(
      `${seedPrefix}-cover`
    ),

    gallery: Array.from(
      { length: galleryCount },
      (_, i) =>
        randomFoodImage(
          `${seedPrefix}-gallery-${i}`
        )
    ),

    menu: Array.from(
      { length: menuCount },
      (_, i) =>
        randomFoodImage(
          `${seedPrefix}-menu-${i}`
        )
    ),
  }
}

const restaurants = [

  {
    name: "Sababa 沙巴巴中東美食",
    name_en: "Sababa Pita Bar",
    category: "中東料理",
    location: "台北市羅斯福路三段 283 巷 17 號",
    phone: "0223638009",
    description:
      "沙巴巴批塔是台灣第一家純手工中東料理餐廳，主打新鮮現做的批塔與道地配方。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5635/01.jpg",

      gallery: buildRandomImages("umeko").gallery,

      menu: buildRandomImages("umeko").menu,
    },
  },

  {
    name: "梅子鰻蒲燒專賣店",
    name_en: "Umeko Japanese Unagi House",
    category: "日本料理",
    location: "台北市中山區林森北路 107 巷 8 號",
    phone: "0225212813",
    description:
      "專注於鰻魚料理的日式餐廳，提供蒲燒鰻魚飯與多樣定食。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5628/02.jpg",

      gallery:
        buildRandomImages("umeko").gallery,

      menu:
        buildRandomImages("umeko").menu,
    },
  },

  {
    name: "ZIGA ZIGA",
    name_en: "Ziga Zaga",
    category: "義式餐廳",
    location: "台北市信義區松壽路 2 號",
    phone: "0227201230",
    description:
      "高級義式料理餐廳，結合現場音樂演出與精緻料理。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5629/03.jpg",

      gallery:
        buildRandomImages("ziga").gallery,

      menu:
        buildRandomImages("ziga").menu,
    },
  },

  {
    name: "艾朋牛排餐酒館",
    name_en: "A Point Steak & Bar",
    category: "美式",
    location:
      "台北市信義區忠孝東路五段 139 號 2 樓",
    phone: "0227567788",
    description:
      "主打高品質牛排與創意餐酒搭配的美式餐廳。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5630/04.jpg",

      gallery:
        buildRandomImages("apoint").gallery,

      menu:
        buildRandomImages("apoint").menu,
    },
  },

  {
    name: "Gusto Pizza",
    name_en: "Gusto Pizza",
    category: "義式餐廳",
    location: "北市中正區連雲街 74 號",
    phone: "0223587001",
    description:
      "經典義大利披薩，麵團至少發酵 24 小時。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5631/05.jpg",

      gallery:
        buildRandomImages("gusto").gallery,

      menu:
        buildRandomImages("gusto").menu,
    },
  },

  {
    name: "WXYZ Bar",
    name_en: "WXYZ Bar",
    category: "酒吧",
    location: "台北市中山區雙城街",
    phone: "0277439999",
    description:
      "現代風格酒吧，提供創意調酒與輕食。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5632/06.jpg",

      gallery:
        buildRandomImages("wxyz").gallery,

      menu:
        buildRandomImages("wxyz").menu,
    },
  },

  {
    name: "Fika Fika Cafe",
    name_en: "Fika Fika Cafe",
    category: "咖啡",
    location: "台北市中山區伊通街 33 號",
    phone: "0225070633",
    description:
      "北歐風格咖啡館，專注於咖啡豆品質與沖煮體驗。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5633/07.jpg",

      gallery:
        buildRandomImages("fika").gallery,

      menu:
        buildRandomImages("fika").menu,
    },
  },

  {
    name: "布娜飛比利時啤酒餐廳",
    name_en: "Bravo Beer",
    category: "義式餐廳",
    location:
      "台北市松山區市民大道四段 185 號",
    phone: "0225701255",
    description:
      "結合比利時啤酒與多國料理的餐酒館。",

    images: {
      cover:
        "https://assets-lighthouse.s3.amazonaws.com/uploads/image/file/5634/08.jpg",

      gallery:
        buildRandomImages("bravo").gallery,

      menu:
        buildRandomImages("bravo").menu,
    },
  },

  // =========================================================
  //  後面全部自動補齊隨機圖片
  // =========================================================

  {
    name: "山海食堂",
    name_en: "Mountain & Sea Bistro",
    category: "台式料理",
    location:
      "新北市板橋區文化路一段 120 號",
    phone: "0229681234",
    description:
      "融合山產與海味的台式創意料理。",
    images:
      buildRandomImages("mountain-sea"),
  },

  {
    name: "小巷子義麵坊",
    name_en: "Alley Pasta",
    category: "義式餐廳",
    location:
      "台北市大安區和平東路二段 88 號",
    phone: "0227388899",
    description:
      "溫馨小店，主打手工義大利麵。",
    images:
      buildRandomImages("alley-pasta"),
  },

  {
    name: "海風居酒屋",
    name_en: "Sea Breeze Izakaya",
    category: "日本料理",
    location:
      "台北市中山區南京東路二段 45 號",
    phone: "0225117788",
    description:
      "下班後小酌的日式居酒屋。",
    images:
      buildRandomImages("sea-breeze"),
  },

  {
    name: "慢慢咖啡",
    name_en: "Slow Coffee",
    category: "咖啡",
    location:
      "台中市西區美村路一段 210 號",
    phone: "0423015566",
    description:
      "主打單品手沖咖啡的靜謐空間。",
    images:
      buildRandomImages("slow-coffee"),
  },

  {
    name: "老街牛肉麵",
    name_en: "Old Street Beef Noodles",
    category: "台式料理",
    location:
      "台南市中西區民族路二段 15 號",
    phone: "06223988",
    description:
      "傳承三十年的紅燒牛肉麵。",
    images:
      buildRandomImages("beef-noodles"),
  },

  {
    name: "青葉蔬食",
    name_en: "Green Leaf Vegan",
    category: "素食",
    location:
      "台北市士林區天母東路 95 號",
    phone: "0228736655",
    description:
      "健康取向的蔬食料理餐廳。",
    images:
      buildRandomImages("green-leaf"),
  },

  {
    name: "火石燒肉",
    name_en: "Flame Yakiniku",
    category: "燒肉",
    location:
      "桃園市中壢區中美路 101 號",
    phone: "03422899",
    description:
      "主打炭火燒烤的日式燒肉店。",
    images:
      buildRandomImages("flame"),
  },

  {
    name: "南洋小館",
    name_en: "Nanyang Kitchen",
    category: "南洋料理",
    location:
      "高雄市苓雅區青年一路 60 號",
    phone: "07332566",
    description:
      "提供道地南洋風味料理。",
    images:
      buildRandomImages("nanyang"),
  },

  {
    name: "甜日子甜點店",
    name_en: "Sweet Day Dessert",
    category: "甜點",
    location:
      "新竹市東區光復路一段 180 號",
    phone: "03577988",
    description:
      "每日手作甜點與蛋糕。",
    images:
      buildRandomImages("sweet-day"),
  },

  {
    name: "黑鐵咖哩",
    name_en: "Iron Curry",
    category: "咖哩",
    location:
      "台北市萬華區西園路二段 25 號",
    phone: "0223084455",
    description:
      "濃厚系日式咖哩專門店。",
    images:
      buildRandomImages("iron-curry"),
  },

  {
    name: "河岸早午餐",
    name_en: "Riverside Brunch",
    category: "早午餐",
    location:
      "新北市新店區北新路一段 90 號",
    phone: "0229126677",
    description:
      "提供全天候早午餐選項。",
    images:
      buildRandomImages("riverside"),
  },

  {
    name: "深夜拉麵屋",
    name_en: "Midnight Ramen",
    category: "日本料理",
    location:
      "台北市中正區汀州路三段 55 號",
    phone: "0223658899",
    description:
      "營業到深夜的濃厚系拉麵。",
    images:
      buildRandomImages("midnight-ramen"),
  },

  {
    name: "藍天餐酒館",
    name_en: "Blue Sky Bistro",
    category: "餐酒館",
    location:
      "台中市南屯區公益路二段 150 號",
    phone: "0422587788",
    description:
      "結合餐點與調酒的現代餐酒館。",
    images:
      buildRandomImages("blue-sky"),
  },

  {
    name: "赤富士壽司",
    name_en: "Red Fuji Sushi",
    category: "日本料理",
    location:
      "台北市大安區敦化南路一段 200 號",
    phone: "0227788899",
    description:
      "新鮮直送生魚片與職人握壽司。",
    images:
      buildRandomImages("red-fuji"),
  },

  {
    name: "暮光酒館",
    name_en: "Twilight Tavern",
    category: "酒吧",
    location:
      "台北市信義區松仁路 88 號",
    phone: "0223456677",
    description:
      "適合下班聚會的高質感餐酒館。",
    images:
      buildRandomImages("twilight"),
  },

  {
    name: "暖心鍋物",
    name_en: "Warm Hotpot",
    category: "火鍋",
    location:
      "新北市永和區中正路 150 號",
    phone: "0229221122",
    description:
      "主打新鮮食材與濃郁湯頭。",
    images:
      buildRandomImages("warm-hotpot"),
  },

  {
    name: "晨光早餐店",
    name_en: "Morning Light Breakfast",
    category: "早餐",
    location:
      "台中市北區學士路 88 號",
    phone: "0422221111",
    description:
      "平價又美味的台式早餐。",
    images:
      buildRandomImages("morning-light"),
  },

  {
    name: "金香海南雞飯",
    name_en: "Golden Hainan Chicken",
    category: "南洋料理",
    location:
      "高雄市左營區自由路 300 號",
    phone: "073456789",
    description:
      "道地新加坡海南雞飯。",
    images:
      buildRandomImages("golden-hainan"),
  },
]

module.exports = {
  restaurants,
}