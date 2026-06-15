import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastType } from '@/constants/toast'


export const useFlashStore = defineStore('flash', () => {

  const message = ref<string | null>(null)
  const type = ref<ToastType | null>(null)

  function set(payload: {
    message: string
    type: ToastType
  }) {
    message.value = payload.message
    type.value = payload.type
  }

  function clear() {
    message.value = null
    type.value = null
  }

  return {
    message,
    type,
    set,
    clear
  }
})