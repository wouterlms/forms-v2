import {
  computed,
  isReactive,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue'

import type {
  FormObject,
  FormObjectPropertyType,
  FormState,
} from '../types'

export default <T extends Record<keyof T, FormObjectPropertyType>>(
  state: FormObject<T>,
): FormState<T> => {
  if (!isReactive(state))
    throw new Error('formState must be reactive')

  const initialFormState = JSON.parse(JSON.stringify(state))

  const errorMap = reactive(new Map())

  const isInvalidAfterSettingErrorsManually = ref(false)

  const isValid = computed(
    () => [...errorMap.values()].every(error => !error) && !isInvalidAfterSettingErrorsManually.value,
  )

  const validateProperty = async (key: keyof T, setError = true): Promise<void> => {
    const { value, validate } = state[key]

    if (validate === undefined)
      throw new Error(`Property ${key as string} does not have a validate function`)

    errorMap.set(key, true)

    const validationResponse = await validate(value, state)
    errorMap.set(key, validationResponse === false || typeof validationResponse === 'string')

    if (setError)
      state[key].error = validationResponse
  }

  const validate: FormState<T>['validate'] = async (inputs, setError = true) => {
    const inputsToValidate = inputs ?? Object.keys(state)

    for (const input of inputsToValidate) {
      const { validate } = state[input]

      if (validate === undefined)
        continue

      await validateProperty(input as keyof T, setError)
    }
  }

  const isValidProperty: FormState<T>['isValidProperty'] = (property) => {
    return !errorMap.get(property)
  }

  const getData: FormState<T>['getData'] = (isSubmit) => {
    const data = Object.entries(state).reduce((acc, [k]) => {
      const key = k as keyof T
      const { value, get } = state[key]

      if (get !== undefined && isSubmit !== false)
        acc[key] = get(value, state)
      else
        acc[key] = value

      return acc
    }, {} as any)

    return data
  }

  const setData: FormState<T>['setData'] = async (data) => {
    for (const key in data) {
      const { set } = state[key]

      if (set !== undefined)
        state[key].value = await set(data[key], state)
      else
        state[key].value = data[key]
    }
  }

  const setErrors: FormState<T>['setErrors'] = (errors) => {
    for (const error in errors)
      state[error].error = errors[error]

    isInvalidAfterSettingErrorsManually.value = true
  }

  const validateInitialState = (): void => {
    for (const key in state)
      errorMap.set(key, false)

    for (const key in state) {
      const { validate } = state[key]

      if (validate !== undefined)
        validateProperty(key, false)
    }
  }

  const createValidationWatchers = (): void => {
    for (const key in state) {
      const { value } = toRefs(state[key])
      const { validate } = state[key]

      watch([value, () => validate?.(value, state)], () => {
        if (validate !== undefined)
          validateProperty(key)

        isInvalidAfterSettingErrorsManually.value = false
      }, { deep: true })
    }
  }

  const reset: FormState<T>['reset'] = () => {
    for (const key in state) {
      state[key].value = initialFormState[key].value
      state[key].error = null
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
