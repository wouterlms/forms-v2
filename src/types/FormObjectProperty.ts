import type { FormObject } from './FormObject'
import type { FormObjectPropertyType, FormObjectPropertyTypeWithNested, FormObjectPropertyTypeWithValue } from './FormObjectPropertyType'
import type { MaybePromise } from './MaybePromise'

export interface FormObjectPropertyWithValue<T extends FormObjectPropertyTypeWithValue, S extends FormObject<any>> {
  value: T['value']
  error?: string | null
  get?: (value: T['value'], state: S) => T['returns']
  set?: (value: T['set'], state: S) => MaybePromise<T['value']>
  validate?: (value: T['value'], state: S) => MaybePromise<string | null>
}

export type FormObjectPropertyWithNested<T extends FormObjectPropertyTypeWithNested, S extends FormObject<any>> = {
  [K in keyof T]: FormObjectProperty<T[K], S>
}

export type FormObjectProperty<T extends FormObjectPropertyType, S extends FormObject<any>> = T extends FormObjectPropertyTypeWithValue
  ? FormObjectPropertyWithValue<T, S>
  : T extends FormObjectPropertyTypeWithNested
    ? FormObjectPropertyWithNested<T, S>
    : never

