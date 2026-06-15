import type {
  ActionResult
} from '@/types'

export function isReasonFailure<
  R extends string
  >(result: ActionResult<any, R>)
  : result is { ok: false; reason: R } {
  return 'reason' in result;
}