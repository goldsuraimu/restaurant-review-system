import { computed } from 'vue'
import type { Ref } from 'vue';
import type { ListMeta, PaginationItem } from '@/types';


export function usePagination(pageInfo: Ref<ListMeta>) {
  const pagesToDisplay = computed<PaginationItem[]>(() => {
    const totalPages = pageInfo.value.totalPages
    const currentPage = pageInfo.value.page

    const maxToShow = 7
    const half = Math.floor(maxToShow / 2)

    const pages: PaginationItem[] = []

    const pushPage = (p: number) => pages.push({ key: `p${p}`, page: p, label: `${p}`, isEllipsis: false })
    const pushEllipsis = (i: string) => pages.push({ key: `e${i}`, label: '…', isEllipsis: true })

    if (totalPages <= maxToShow) {
      for (let i = 1; i <= totalPages; i++) pushPage(i)
      return pages
    } else {
      const left = Math.max(2, currentPage - half)
      const right = Math.min(totalPages - 1, currentPage + half)

      pushPage(1)
      
      if (left > 2) pushEllipsis('l')

      for (let i = left; i <= right; i++) pushPage(i)

      if (right < totalPages - 1) pushEllipsis('r')
      
      pushPage(totalPages)
      
      return pages
    }
  })

  return { pagesToDisplay }
}
