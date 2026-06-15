import { toast } from 'vue3-toastify'
import type { ErrorDecision } from '../system/system-error.resolver.ts'

export function presentError(
  decision: ErrorDecision,
  options: { showToast: boolean }
) {
  if (!options.showToast) return
  if (!decision.message) return

  toast.error(decision.message)
}
