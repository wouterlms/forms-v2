import type { MaybeAsync } from './MaybeAsync'
import type { FormObject } from './FormObject'
import type FormObjectPropertyType from './FormObjectPropertyType'

export interface FormObjectProperty<T extends FormObjectPropertyType, S extends Record<keyof S, FormObjectPropertyType>> {
  value: T['value']
  error?: string | boolean | null
  get?: (value: T['value'], state: FormObject<S>) => T['returns']
  set?: (value: T['set'], state: FormObject<S>) => MaybeAsync<T['value']>
  validate?: (value: T['value'], state: FormObject<S>) => MaybeAsync<boolean | string | null>
}
