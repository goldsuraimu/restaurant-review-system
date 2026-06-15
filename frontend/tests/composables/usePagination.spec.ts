import { describe, it, expect } from 'vitest'
import { usePagination } from '@/composables/data/usePagination'
import type { ListMeta } from '@/types/common/pagination'
import { ref } from 'vue'


describe('usePagination', () => {
  it('應該產生全部頁碼，當 totalPages <= maxToShow', () => {
    
    const pageInfo = ref<ListMeta>({
      total: 50,
      page: 1,
      totalPages: 5,
      limit: 12,
      hasNextPage: true,
      hasPrevPage: false,
    })
    
    const { pagesToDisplay } = usePagination(pageInfo)


    expect(pagesToDisplay.value.map(p => p.label)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('應該要顯示省略號，當頁數過多時', () => {
    const pageInfo = ref<ListMeta>({
      total: 200,
      page: 10,
      totalPages: 20,
      limit: 12,
      hasNextPage: true,
      hasPrevPage: true,
    })

    const { pagesToDisplay } = usePagination(pageInfo)

    const labels = pagesToDisplay.value.map(p => p.label)

    expect(labels).toContain('…')
    expect(labels[0]).toBe('1')
    expect(labels.at(-1)).toBe('20')
  })
})
