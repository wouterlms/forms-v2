import type {
  FlattenObjectKeys,
  FormObjectProperty,
  FormObjectPropertyType,
  FormObjectPropertyTypeWithNested,
  FormObjectPropertyTypeWithValue,
  FormObjectPropertyWithNested,
  FormObjectPropertyWithValue,
} from '../types'

export const isNestedProperty = (property: FormObjectProperty<FormObjectPropertyType>): property is FormObjectPropertyWithNested<FormObjectPropertyTypeWithNested> => {
  return (property as FormObjectPropertyTypeWithValue).value === undefined
}

export const getPropertyByStringKey = <T extends Record<string, unknown>>(path: FlattenObjectKeys<T>, obj: Record<string, unknown>, separator = '.'): FormObjectPropertyWithValue<FormObjectPropertyTypeWithValue> => {
  const properties: string[] = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev?.[curr as keyof T], obj as any)
}

export const getNestedKeys = (object: Record<string, unknown>, prefix = ''): string[] => {
  return Object.keys(object).reduce((keys, key) => {
    const value: unknown = object[key]

    if (isNestedProperty(value as FormObjectPropertyType))
      return [...keys, ...getNestedKeys(value as Record<string, unknown>, `${prefix}${key}.`)]

    return [...keys, `${prefix}${key}`] as string[]
  }, [] as string[])
}
