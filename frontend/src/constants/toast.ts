export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
} as const

export type ToastType = typeof ToastType[keyof typeof ToastType]