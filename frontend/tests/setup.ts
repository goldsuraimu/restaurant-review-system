import { vi } from 'vitest'

// 有用 FontAwesome，全域 mock 掉
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {},
}))
