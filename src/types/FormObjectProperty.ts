import type { FormObjectPropertyType, FormObjectPropertyTypeWithNested, FormObjectPropertyTypeWithValue } from './FormObjectPropertyType'
import type { MaybePromise } from './MaybePromise'

export interface FormObjectPropertyWithValue<T extends FormObjectPropertyTypeWithValue> {
  value: T['value']
  error?: string | boolean | null
  get?: (value: T['value']) => T['returns']
  set?: (value: T['set']) => MaybePromise<T['value']>
  validate?: (value: T['value']) => MaybePromise<boolean | string | null>
}

export type FormObjectPropertyWithNested<T extends FormObjectPropertyTypeWithNested> = {
  [K in keyof T]: FormObjectProperty<T[K]>
}

export type FormObjectProperty<T extends FormObjectPropertyType> = T extends FormObjectPropertyTypeWithValue
  ? FormObjectPropertyWithValue<T>
  : T extends FormObjectPropertyTypeWithNested
    ? FormObjectPropertyWithNested<T>
    : never

