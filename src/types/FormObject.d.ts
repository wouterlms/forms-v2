import type FormObjectPropertyType from './FormObjectPropertyType'
import type { FormObjectProperty } from './FormObjectProperty'

export type FormObject<T extends Record<keyof T, FormObjectPropertyType>> = {
  [K in keyof T]: FormObjectProperty<T[K], T>
}
