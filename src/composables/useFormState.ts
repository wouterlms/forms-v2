import {
  computed,
  isReactive,
  reactive,
  ref,
  watch,
} from 'vue'

import {
  flattenObject,
  flattenState,
} from '../utils'

import type {
  FlattenObjectKeys,
  FormObject,
  FormObjectPropertyType,
  FormState,
} from '../types'

export default <T extends Record<keyof T, FormObjectPropertyType>>(state: FormObject<T>): FormState<T> => {
  if (!isReactive(state))
    throw new Error('formState must be reactive')

  const initialState = JSON.parse(JSON.stringify(state))

  const errorMap = reactive(new Map())

  const isInvalidAfterSettingErrorsManually = ref(false)

  const flatState = flattenState(state)

  const isValid = computed(
    () => [...errorMap.values()].every(error => !error) && !isInvalidAfterSettingErrorsManually.value,
  )

  const setObjectValueByFlatKey = (obj: Record<string, unknown>, key: string, value: unknown): void => {
    const [head, ...rest] = key.split('.')

    if (rest.length === 0) {
      obj[head] = value
      return
    }

    if (obj[head] === undefined)
      obj[head] = {}

    setObjectValueByFlatKey(obj[head] as Record<string, unknown>, rest.join('.'), value)
  }

  const isValidProperty: FormState<T>['isValidProperty'] = (property) => {
    return !errorMap.get(property)
  }

  const validateProperty = async (propertyKey: keyof FlattenObjectKeys<T>, setError = true) => {
    const property = flatState[propertyKey]
    const { value, validate } = property

    if (validate === undefined)
      throw new Error(`Property ${propertyKey as string} does not have a validate function`)

    errorMap.set(propertyKey, true)

    const validationResponse = await validate(value)
    errorMap.set(propertyKey, typeof validationResponse === 'string')

    if (setError)
      property.error = validationResponse
  }

  const validate: FormState<T>['validate'] = async (propertyKeys, setError = true) => {
    const keysToValidate = (propertyKeys ?? Object.keys(flatState))

    for (const key of keysToValidate) {
      const { validate } = flatState[key as keyof FlattenObjectKeys<T>]

      if (validate === undefined)
        continue

      await validateProperty(key as keyof FlattenObjectKeys<T>, setError)
    }
  }

  const getData: FormState<T>['getData'] = (isSubmit) => {
    return Object.keys(flatState).reduce((data, key) => {
      const property = flatState[key as keyof FlattenObjectKeys<T>]

      const { value, get } = property

      if (get !== undefined && isSubmit !== false)
        setObjectValueByFlatKey(data, key, get(value))
      else
        setObjectValueByFlatKey(data, key, value)

      return data
    }, {} as any)
  }

  const setData: FormState<T>['setData'] = async (data) => {
    const flatData = flattenObject(data)

    for (const key in flatData) {
      const { set } = flatState[key]

      if (set === undefined)
        setObjectValueByFlatKey(state, `${key}.value`, flatData[key])
      else
        setObjectValueByFlatKey(state, `${key}.value`, await set(flatData[key]))
    }
  }

  const setErrors: FormState<T>['setErrors'] = (errors) => {
    const flatErrors = flattenObject(errors)

    for (const key in flatErrors)
      setObjectValueByFlatKey(state, `${key}.error`, flatErrors[key])

    isInvalidAfterSettingErrorsManually.value = true
  }

  const validateInitialState = async (): Promise<void> => {
    for (const key in flatState) {
      const { validate } = flatState[key]

      errorMap.set(key, false)

      if (validate !== undefined)
        await validateProperty(key, false)
    }
  }

  const createValidationWatchers = (): void => {
    for (const key in flatState) {
      const property = flatState[key]

      watch([
        () => property.value, () => property.validate?.(property.value),
      ], () => {
        if (property.validate !== undefined)
          validateProperty(key)

        isInvalidAfterSettingErrorsManually.value = false
      }, { deep: true })
    }
  }

  const reset: FormState<T>['reset'] = () => {
    const flatInitialState = flattenState(initialState)

    for (const key in flatState) {
      const property = flatState[key]
      const { value: initialValue } = flatInitialState[key]

      property.value = initialValue
      property.error = null
    }
  }

  validateInitialState()
  createValidationWatchers()

  return reactive({
    state,
    isValid,
    isValidProperty,
    validate,
    getData,
    setData,
    setErrors,
    reset,
  }) as any
}
