import type { MaybePromise } from './MaybePromise'

export default interface UseForm {
  isDirty: boolean
  isSubmitting: boolean
  isReady: boolean
  prepare: () => MaybePromise<void>
  submit: () => MaybePromise<void>
}
