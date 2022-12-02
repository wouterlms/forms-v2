import type { FormObjectPropertyType } from './FormObjectPropertyType'
import type { FormObjectProperty } from './FormObjectProperty'

export type FormObject<FormStateType extends Record<keyof FormStateType, FormObjectPropertyType>> = {
  [K in keyof FormStateType]: FormObjectProperty<FormStateType[K], FormObject<FormStateType>>
}
