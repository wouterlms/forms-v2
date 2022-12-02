import type { FormObjectPropertyType, FormObjectPropertyTypeWithNested, FormObjectPropertyTypeWithValue } from './FormObjectPropertyType'
import type { FormObject } from './FormObject'
import type { MaybePromise } from './MaybePromise'
import type { FlattenObjectKeys } from './FlattenObjectKeys'

type GetData<T extends Record<keyof T, FormObjectPropertyType>, B extends boolean> = {
  [K in keyof T]: T[K] extends FormObjectPropertyTypeWithValue
    ? B extends true
      ? T[K]['returns']
      : T[K]['value']
    : T[K] extends FormObjectPropertyTypeWithNested
      ? GetData<T[K], B>
      : never
}

type SetData<T extends Record<keyof T, FormObjectPropertyType>> = {
  [K in keyof T]?: T[K] extends FormObjectPropertyTypeWithValue
    ? T[K]['set'] extends undefined ? T[K]['value'] : T[K]['set']
    : T[K] extends FormObjectPropertyTypeWithNested
      ? SetData<T[K]>
      : never
}

type SetErrors<T extends Record<keyof T, FormObjectPropertyType>> = {
  [K in keyof T]?: T[K] extends FormObjectPropertyTypeWithValue
    ? string | null
    : T[K] extends FormObjectPropertyTypeWithNested
      ? SetErrors<T[K]>
      : never
}

export default interface FormState<T extends Record<keyof T, FormObjectPropertyType>> {
  isValid: boolean
  state: FormObject<T>

  validate: (inputs?: Array<FlattenObjectKeys<T>>, setError?: boolean) => MaybePromise<void>
  isValidProperty: (property: FlattenObjectKeys<T>) => boolean

  getData: <B extends boolean = true>(isSubmit?: B) => GetData<T, B>
  setData: (data: SetData<T>) => Promise<void>
  setErrors: (errors: SetErrors<T>) => void

  reset: () => void
}
