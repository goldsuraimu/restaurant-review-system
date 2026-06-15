import { ref } from 'vue'

export function useStarRating() {
  const hoverRating = ref(0)
  const ratingTips = [
    '非常不推薦',
    '不推薦',
    '尚可',
    '推薦',
    '非常推薦'
  ]

  function setRating(value: number, target: { rating: number }) {
    target.rating = value
  }

  return {
    hoverRating,
    ratingTips,
    setRating
  }
}
