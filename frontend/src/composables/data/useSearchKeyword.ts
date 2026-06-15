import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useSearchKeyword() {
  const route = useRoute()
  const router = useRouter()

  const keyword = computed<string>({
    get() {
      const q = route.query.q

      if (typeof q === 'string') return q
      if (Array.isArray(q)) return q.join(' ')

      return ''
    },

    set(val: string) {
      const keywords = val
        .trim()
        .split(/\s+/)
        .filter(Boolean)

      router.push({
        query: {
          ...route.query,
          q: keywords.length ? keywords : undefined,
          page: 1,
        },
      })
    },
  })

  // 給 store / fetch 用的結構化關鍵字
  const keywordList = computed<string[]>(() => {
    const q = route.query.q

    if (typeof q === 'string') return [q]
    
    if (Array.isArray(q)) { 
      return q.filter((v): v is string => typeof v === 'string')
    }

    return []
  })

  return {
    keyword,       // 給 v-model 用
    keywordList,   // 給 API 用
  }
}

