import { describe, it, expect } from 'vitest'
import { useStarRating } from '@/composables/ui/useStarRating'

describe('useStarRating', () => {
  it('初始化 hoverRating 為 0', () => {
    const { hoverRating } = useStarRating()
    expect(hoverRating.value).toBe(0)
  })

  it('ratingTips 包含 5 條提示文字', () => {
    const { ratingTips } = useStarRating()
    expect(ratingTips).toHaveLength(5)
    expect(ratingTips[0]).toBe('非常不推薦')
    expect(ratingTips[4]).toBe('非常推薦')
  })

  it('setRating 正確設定 rating', () => {
    const { setRating } = useStarRating()
    const target = { rating: 0 }

    setRating(3, target)
    expect(target.rating).toBe(3)

    setRating(5, target)
    expect(target.rating).toBe(5)
  })
})