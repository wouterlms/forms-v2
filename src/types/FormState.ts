import type FormObjectPropertyType from './FormObjectPropertyType'
import type { FormObject } from './FormObject'
import type { MaybeAsync } from './MaybeAsync'

export default interface FormState<T extends Record<keyof T, FormObjectPropertyType>> {
  isValid: boolean

  state: FormObject<T>

  validate: (inputs?: Array<keyof T>, setError?: boolean) => MaybeAsync<void>

  isValidProperty: (property: keyof T) => boolean

  getData: <B extends boolean = true>(isSubmit?: B) => {
    [K in keyof T]: B extends true
      ? T[K]['returns']
      : T[K]['value']
  }
  setData: (data: {
    [K in keyof T]?: undefined extends T[K]['set']
      ? T[K]['value']
      : T[K]['set']
  }) => Promise<void>

  setErrors: (errors: {
    [K in keyof T]?: string | boolean | null
  }) => void

  reset: () => void
}
