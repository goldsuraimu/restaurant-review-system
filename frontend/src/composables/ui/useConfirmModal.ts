import { ref, readonly, inject, provide } from 'vue'

import { createClientError }
  from '@/api/error/factories/createClientError'

const confirmModalSymbol = Symbol('ConfirmModal')

interface ConfirmOptions {
  title?: string
  message: string
}

function createConfirmModal() {
  const isVisible = ref(false)
  const message = ref('')
  const title = ref('提示')
  let resolver: (result: boolean) => void

  const show = (options: ConfirmOptions): Promise<boolean> => {
    message.value = options.message
    title.value = options.title ?? '提示'
    isVisible.value = true

    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  const confirm = () => {
    isVisible.value = false
    resolver(true)
  }

  const cancel = () => {
    isVisible.value = false
    resolver(false)
  }

  return {
    isVisible: readonly(isVisible),
    message: readonly(message),
    title: readonly(title),
    show,
    confirm,
    cancel,
  }
}

// 在 App.vue 裡呼叫這個一次
export function provideConfirmModal() {
  const modal = createConfirmModal()
  provide(confirmModalSymbol, modal)
  return modal
}

export function useConfirmModalContext() {
  const modal = inject<ReturnType<typeof createConfirmModal>>(confirmModalSymbol)
  if (!modal) {
    throw createClientError(
      '系統初始化失敗',
      'useConfirmModalContext 必須在 provideConfirmModal() 的上下文中使用'
    )
  }
  return modal
}

// 使用方式這樣用就好：const confirm = useConfirmModal()
export function useConfirmModal() {
  const modal = inject<ReturnType<typeof createConfirmModal>>(confirmModalSymbol)
  if (!modal) {
    throw createClientError(
      '系統初始化失敗',
      'useConfirmModalContext 必須在 provideConfirmModal() 的上下文中使用'
    )
  }
  return modal.show
}
