import { resolveApiError } from '@/api/error/system/system-error.resolver'
import { presentError } from '../presenters/error-presenter'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types'

export function handleAppError(
  err: ApiError,
  options: { showToast?: boolean } = {}
): { handled: boolean } {
  const decision = resolveApiError(err)
  const auth = useAuthStore()

  if (decision.shouldLogout) {
    auth.logout()
  }

  presentError(decision, {
    showToast: options.showToast ?? false,
  })

  return { handled: decision.handled }
}
