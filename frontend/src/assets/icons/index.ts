import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { solidIcons } from './fas';
import { regularIcons } from './far';




// 將圖示加入 library
library.add(
  ...solidIcons, 
  ...regularIcons
)

// 導出 FontAwesomeIcon 元件（供 main.ts 全域註冊）
export { FontAwesomeIcon }
