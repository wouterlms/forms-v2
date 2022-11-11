import {
  computed,
  isReactive,
  reactive,
  ref,
  watch,
} from 'vue'

import {
  getNestedKeys,
  getPropertyByStringKey,
  isNestedProperty,
} from '../utils'

import type {
  FlattenObjectKeys,
  FormObject,
  FormObjectPropertyType,
  FormObjectPropertyTypeWithValue,
  FormObjectPropertyWithValue,
  FormState,
} from '../types'

export default <T extends Record<keyof T, FormObjectPropertyType>>(state: FormObject<T>): FormState<T> => {
  if (!isReactive(state))
    throw new Error('formState must be reactive')

  const initialFormState = JSON.parse(JSON.stringify(state))

  const errorMap = reactive(new Map())

  const isInvalidAfterSettingErrorsManually = ref(false)

  const isValid = computed(
    () => [...errorMap.values()].every(error => !error) && !isInvalidAfterSettingErrorsManually.value,
  )

  const setObjectValueByStringKey = (
    path: FlattenObjectKeys<T>,
    value: unknown,
    obj: Record<string, unknown>,
    separator = '.',
  ): void => {
    const properties: string[] = Array.isArray(path) ? path : path.split(separator)

    properties.reduce((prev, curr, index) => {
      if (index === properties.length - 1)
        prev[curr] = value
      else if (prev[curr] === undefined)
        prev[curr] = {}

      return prev[curr]
    }, obj as any)
  }

  const validateProperty = async (propertyKey: FlattenObjectKeys<T>, setError = true): Promise<void> => {
    const property = getPropertyByStringKey(propertyKey, state)

    const { value, validate } = property

    if (validate === undefined)
      throw new Error(`Property ${propertyKey as string} does not have a validate function`)

    errorMap.set(propertyKey, true)

    const validationResponse = await validate(value)
    errorMap.set(propertyKey, validationResponse === false || typeof validationResponse === 'string')

    if (setError)
      property.error = validationResponse
  }

  const validate: FormState<T>['validate'] = async (propertyKeys, setError = true) => {
    const keysToValidate = (propertyKeys ?? getNestedKeys(state))

    for (const keyToValidate of keysToValidate) {
      const property = getPropertyByStringKey(keyToValidate, state)

      if (property.validate === undefined)
        continue

      await validateProperty(keyToValidate as FlattenObjectKeys<T, keyof T>, setError)
    }
  }

  const isValidProperty: FormState<T>['isValidProperty'] = (property) => {
    return !errorMap.get(property)
  }

  const getData: FormState<T>['getData'] = (isSubmit) => {
    const propertyKeys = getNestedKeys(state)

    return propertyKeys.reduce((data, propertyKey) => {
      const property = getPropertyByStringKey(propertyKey, state)

      const { value, get } = property

      if (get !== undefined && isSubmit !== false)
        setObjectValueByStringKey(propertyKey as FlattenObjectKeys<T, keyof T>, get(value), data)
      else
        setObjectValueByStringKey(propertyKey as FlattenObjectKeys<T, keyof T>, value, data)

      return data
    }, {} as any)
  }

  const setData: FormState<T>['setData'] = async (data, acc = state) => {
    for (const propertyKey in acc) {
      const property = acc[propertyKey]
      const value = data[propertyKey]

      if (value === undefined)
        continue

      if (isNestedProperty(property as FormObjectPropertyType))
        return setData(value as typeof data, acc[propertyKey] as FormObject<T>)

      const { set } = property as FormObjectPropertyWithValue<FormObjectPropertyTypeWithValue>

      if (set === undefined)
        acc[propertyKey].value = value
      else
        acc[propertyKey].value = await set(value)
    }
  }

  const setErrors: FormState<T>['setErrors'] = (errors, acc = state) => {
    for (const propertyKey in acc) {
      const property = acc[propertyKey]
      const error = errors[propertyKey]

      if (error === undefined)
        continue

      if (isNestedProperty(property as FormObjectPropertyType))
        return setErrors(error as typeof errors, acc[propertyKey] as FormObject<T>)

      acc[propertyKey].error = error as string | null
    }

    isInvalidAfterSettingErrorsManually.value = true
  }

  const validateInitialState = async (): Promise<void> => {
    const propertyKeys = getNestedKeys(state)

    for (const propertyKey of propertyKeys) {
      errorMap.set(propertyKey, false)

      const { validate } = getPropertyByStringKey(propertyKey, state)

      if (validate !== undefined)
        validateProperty(propertyKey as FlattenObjectKeys<T, keyof T>, false)
    }
  }

  const createValidationWatchers = (): void => {
    const propertyKeys = getNestedKeys(state)

    for (const propertyKey of propertyKeys) {
      const property = getPropertyByStringKey(propertyKey, state)

      watch(
        [() => property.value, () => property.validate?.(property.value)],
        () => {
          if (property.validate !== undefined)
            validateProperty(propertyKey as FlattenObjectKeys<T, keyof T>)

          isInvalidAfterSettingErrorsManually.value = false
        }, { deep: true },
      )
    }
  }

  const reset: FormState<T>['reset'] = () => {
    const propertyKeys = getNestedKeys(state)

    for (const propertyKey of propertyKeys) {
      const property = getPropertyByStringKey(propertyKey, state)
      const { value: initialValue } = getPropertyByStringKey(propertyKey, initialFormState)

      property.value = initialValue
      property.error = null
    }

    validateInitialState()
  }

  validateInitialState()
  createValidationWatchers()

  return reactive({
    isValid,
    state,
    validate,
    isValidProperty,
    getData,
    setData,
    setErrors,
    reset,
  }) as any
}
