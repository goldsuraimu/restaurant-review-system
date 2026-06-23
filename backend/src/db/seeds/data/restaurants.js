function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min
}

function getCoverImage(slug) {
  return `restaurants/${slug}/cover`
}

function getRandomUniqueImages(
  folder,
  maxImageNumber,
  count
) {
  const numbers = Array.from(
    { length: maxImageNumber },
    (_, i) => i + 1
  )

  const shuffled = numbers.sort(
    () => Math.random() - 0.5
  )

  return shuffled
    .slice(0, count)
    .map((num) =>
        `restaurants/gallery/${folder}-${num}`
    )
}

function getRandomMenus(count) {
  const numbers = Array.from(
    { length: 25 },
    (_, i) => i + 1
  )

  const shuffled = numbers.sort(
    () => Math.random() - 0.5
  )

  return shuffled
    .slice(0, count)
    .map((num) =>
      `menu-${num}`
    )
}

function buildRandomImages() {

  const interiorCount = randomInt(1, 3)

  const foodCount = randomInt(1, 4)

  const drinkCount = randomInt(1, 3)

  const menuCount = randomInt(1, 10)

  return {
    gallery: [
      ...getRandomUniqueImages(
        "interior",
        12,
        interiorCount
      ),

      ...getRandomUniqueImages(
        "food",
        23,
        foodCount
      ),

      ...getRandomUniqueImages(
        "drink",
        16,
        drinkCount
      ),
    ].sort(() => Math.random() - 0.5),

    menu: getRandomMenus(menuCount),
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
      cover:  getCoverImage("sababa"),

      gallery: [
        'sababa-gallery-food-1',
        'sababa-gallery-food-2',
        'sababa-gallery-food-3',
      ],

      menu: [
        'sababa-menu-1',
        'sababa-menu-2',
      ],
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
      cover: getCoverImage("umeko"),

      gallery: buildRandomImages().gallery,

      menu: buildRandomImages().menu,
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
      cover: getCoverImage("ziga"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu,
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
      cover: getCoverImage("apoint"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu, 
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
      cover: getCoverImage("gusto"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu,
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
      cover: getCoverImage("wxyz"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu,
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
      cover: getCoverImage("fika"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu,
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
      cover: getCoverImage("bravo"),

      gallery:
        buildRandomImages().gallery,

      menu:
        buildRandomImages().menu,
    },
  },

  // =========================================================
  //  後面全部自動補齊隨機圖片
  // =========================================================

  {
    name: "山海食堂",
    name_en: "Mountain & Sea Bistro",
    category: "台式料理",
    location: "新北市板橋區文化路一段 120 號",
    phone: "0229681234",
    description: "融合山產與海味的台式創意料理.",
    images: {
      cover: getCoverImage("mountain-sea"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "小巷子義麵坊",
    name_en: "Alley Pasta",
    category: "義式餐廳",
    location: "台北市大安區和平東路二段 88 號",
    phone: "0227388899",
    description: "溫馨小店，主打手工義大利麵。",
    images: {
      cover: getCoverImage("alley-pasta"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "海風居酒屋",
    name_en: "Sea Breeze Izakaya",
    category: "日本料理",
    location: "台北市中山區南京東路二段 45 號",
    phone: "0225117788",
    description: "下班後小酌的日式居酒屋。",
    images: {
      cover: getCoverImage("sea-breeze"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "慢慢咖啡",
    name_en: "Slow Coffee",
    category: "咖啡",
    location: "台中市西區美村路一段 210 號",
    phone: "0423015566",
    description: "主打單品手沖咖啡的靜謐空間。",
    images: {
      cover: getCoverImage("slow-coffee"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "老街牛肉麵",
    name_en: "Old Street Beef Noodles",
    category: "台式料理",
    location: "台南市中西區民族路二段 15 號",
    phone: "06223988",
    description: "傳承三十年的紅燒牛肉麵。",
    images: {
      cover: getCoverImage("beef-noodles"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "青葉蔬食",
    name_en: "Green Leaf Vegan",
    category: "素食",
    location: "台北市士林區天母東路 95 號",
    phone: "0228736655",
    description: "健康取向的蔬食料理餐廳。",
    images: {
      cover: getCoverImage("green-leaf"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "火石燒肉",
    name_en: "Flame Yakiniku",
    category: "燒肉",
    location: "桃園市中壢區中美路 101 號",
    phone: "03422899",
    description: "主打炭火燒烤的日式燒肉店。",
    images: {
      cover: getCoverImage("flame"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "南洋小館",
    name_en: "Nanyang Kitchen",
    category: "南洋料理",
    location: "高雄市苓雅區青年一路 60 號",
    phone: "07332566",
    description: "提供道地南洋風味料理。",
    images: {
      cover: getCoverImage("nanyang"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "甜日子甜點店",
    name_en: "Sweet Day Dessert",
    category: "甜點",
    location: "新竹市東區光復路一段 180 號",
    phone: "03577988",
    description: "每日手作甜點與蛋糕。",
    images: {
      cover: getCoverImage("sweet-day"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "黑鐵咖哩",
    name_en: "Iron Curry",
    category: "咖哩",
    location: "台北市萬華區西園路二段 25 號",
    phone: "0223084455",
    description: "濃厚系日式咖哩專門店。",
    images: {
      cover: getCoverImage("iron-curry"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "河岸早午餐",
    name_en: "Riverside Brunch",
    category: "早午餐",
    location: "新北市新店區北新路一段 90 號",
    phone: "0229126677",
    description: "提供全天候早午餐選項。",
    images: {
      cover: getCoverImage("riverside"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "深夜拉麵屋",
    name_en: "Midnight Ramen",
    category: "日本料理",
    location: "台北市中正區汀州路三段 55 號",
    phone: "0223658899",
    description: "營業到深夜的濃厚系拉麵。",
    images: {
      cover: getCoverImage("midnight-ramen"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "藍天餐酒館",
    name_en: "Blue Sky Bistro",
    category: "餐酒館",
    location: "台中市南屯區公益路二段 150 號",
    phone: "0422587788",
    description: "結合餐點與調酒的現代餐酒館。",
    images: {
      cover: getCoverImage("blue-sky"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "赤富士壽司",
    name_en: "Red Fuji Sushi",
    category: "日本料理",
    location: "台北市大安區敦化南路一段 200 號",
    phone: "0227788899",
    description: "新鮮直送生魚片與職人握壽司。",
    images: {
      cover: getCoverImage("red-fuji"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "暮光酒館",
    name_en: "Twilight Tavern",
    category: "酒吧",
    location: "台北市信義區松仁路 88 號",
    phone: "0223456677",
    description: "適合下班聚會的高質感餐酒館。",
    images: {
      cover: getCoverImage("twilight"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "暖心鍋物",
    name_en: "Warm Hotpot",
    category: "火鍋",
    location: "新北市永和區中正路 150 號",
    phone: "0229221122",
    description: "主打新鮮食材與濃郁湯頭。",
    images: {
      cover: getCoverImage("warm-hotpot"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "晨光早餐店",
    name_en: "Morning Light Breakfast",
    category: "早餐",
    location: "台中市北區學士路 88 號",
    phone: "0422221111",
    description: "平價又美味的台式早餐。",
    images: {
      cover: getCoverImage("morning-light"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },

  {
    name: "金香海南雞飯",
    name_en: "Golden Hainan Chicken",
    category: "南洋料理",
    location: "高雄市左營區自由路 300 號",
    phone: "073456789",
    description: "道地新加坡海南雞飯。",
    images: {
      cover: getCoverImage("golden-hainan"),
      gallery: buildRandomImages().gallery,
      menu: buildRandomImages().menu,
    },
  },
]

module.exports = {
  restaurants,
}