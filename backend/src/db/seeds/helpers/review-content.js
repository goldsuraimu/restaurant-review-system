const positiveReviews = [
  '超好吃，非常推薦',
  '服務很好，會再來',
  '食物很有水準',
  '氣氛很棒',
  '價格合理又好吃',
  '值得排隊',
  '店員非常親切',
]

const neutralReviews = [
  '普通，還可以',
  '一般般',
  '沒有特別驚艷',
  '價格偏高',
  '還行',
]

const negativeReviews = [
  '服務很差',
  '難吃死了',
  '等很久',
  '環境不太乾淨',
  '不會再來',
  '態度不好',
]

const positiveReplies = [
  '感謝您的支持 ❤️',
  '謝謝您的喜歡，歡迎再來',
  '很開心您喜歡我們的料理',
  '期待再次為您服務 🙏',
]

const neutralReplies = [
  '感謝您的回饋，我們會持續改進',
  '謝謝您的建議',
  '感謝您的光臨',
]

const negativeReplies = [
  '很抱歉讓您有不好的體驗',
  '我們會加強員工訓練',
  '謝謝您的指教，我們會改善',
  '真的非常抱歉造成困擾',
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateReviewContent(rating) {
  // 20% 無文字評論
  if (Math.random() < 0.2) {
    return ''
  }

  if (rating >= 4) {
    return randomItem(positiveReviews)
  }

  if (rating === 3) {
    return randomItem(neutralReviews)
  }

  return randomItem(negativeReviews)
}

function generateReplyContent(rating) {
  if (rating >= 4) {
    return randomItem(positiveReplies)
  }

  if (rating === 3) {
    return randomItem(neutralReplies)
  }

  return randomItem(negativeReplies)
}

module.exports = {
  generateReviewContent,
  generateReplyContent,
}