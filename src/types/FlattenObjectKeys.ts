import type { FormObjectPropertyTypeWithNested } from './FormObjectPropertyType'

export type FlattenObjectKeys<
  T extends Record<string, unknown>,
  Key = keyof T,
> = Key extends string
  ? T[Key] extends FormObjectPropertyTypeWithNested
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
  : never
