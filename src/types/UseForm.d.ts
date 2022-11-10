import type { MaybeAsync } from './MaybeAsync'

export default interface UseForm {
  isDirty: boolean
  isSubmitting: boolean
  isReady: boolean
  prepare: () => MaybeAsync<void>
  submit: () => MaybeAsync<void>
}
