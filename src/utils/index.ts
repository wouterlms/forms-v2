import type {
  FlattenObjectKeys,
  FormObject,
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

export const flattenState = <T extends Record<keyof T, FormObjectPropertyType>>(obj: FormObject<T>, prefix = ''): Record<keyof FlattenObjectKeys<T>, FormObjectPropertyWithValue<FormObjectPropertyTypeWithValue>> => {
  return Object.keys(obj).reduce((keys, key) => {
    const property = obj[key as keyof FormObject<T>]

    if (isNestedProperty(property)) {
      return {
        ...keys,
        ...flattenState(property as FormObject<T>, `${prefix}${key}.`),
      }
    }

    return {
      ...keys,
      [`${prefix}${key}`]: property,
    }
  }, {} as Record<keyof FlattenObjectKeys<T>, FormObjectPropertyWithValue<FormObjectPropertyTypeWithValue>>)
}

export const flattenObject = <T extends Record<string, unknown>>(obj: Record<string, unknown>, prefix = ''): Record<keyof FlattenObjectKeys<T>, unknown> => {
  return Object.keys(obj).reduce((keys, key) => {
    const property = obj[key]

    if (property !== null && typeof property === 'object') {
      return {
        ...keys,
        ...flattenObject(property as Record<string, unknown>, `${prefix}${key}.`),
      }
    }

    return {
      ...keys,
      [`${prefix}${key}`]: property,
    }
  }, {} as Record<keyof FlattenObjectKeys<T>, unknown>)
}
