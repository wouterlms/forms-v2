import {
  reactive,
  ref,
  watch,
} from 'vue'

import type {
  FormObject,
  FormObjectPropertyType,
  FormState,
  MaybeAsync,
  UseForm,
} from '../types'

interface Options<T extends Record<keyof T, FormObjectPropertyType>> {
  allowPristineSubmit?: boolean
  handlePrepare?: () => MaybeAsync<void>
  handleSubmit: () => MaybeAsync<void>
}

export default <T extends Record<keyof T, FormObjectPropertyType>>(
  formState: FormState<T>,
  options: Options<T>,
): UseForm => {
  const {
    handlePrepare,
    handleSubmit,
    allowPristineSubmit,
  } = options

  const isDirty = ref(false)
  const isSubmitting = ref(false)
  const isReady = ref(handlePrepare === undefined)

  const { state } = formState

  const initialFormState = ref<FormObject<T>>(JSON.parse(JSON.stringify(state)))

  const prepare = async (): Promise<void> => {
    await handlePrepare?.()

    isReady.value = true
    initialFormState.value = JSON.parse(JSON.stringify(state))
  }

  const submit = async (): Promise<void> => {
    isSubmitting.value = true
    await formState.validate(undefined, false)

    if (!formState.isValid) {
      await formState.validate()
      isSubmitting.value = false
      return
    }

    if (!isDirty.value && allowPristineSubmit !== true) {
      isSubmitting.value = false
      return
    }

    await handleSubmit()

    initialFormState.value = JSON.parse(JSON.stringify(state))
    isDirty.value = false
    isSubmitting.value = false
  }

  const watchFormState = (): void => {
    watch(state, () => {
      isDirty.value = false

      for (const key in state) {
        const { value: initialValue } = initialFormState.value[key]
        const { value: currentValue } = state[key]

        // null and 0 length are equal
        if (initialValue === null && typeof currentValue === 'string') {
          if (currentValue !== null && currentValue.length !== 0)
            isDirty.value = true
        }
        else if (JSON.stringify(initialValue) !== JSON.stringify(currentValue)) {
          isDirty.value = true
        }

        if (isDirty.value)
          continue
      }
    }, { deep: true })
  }

  watchFormState()

  return reactive({
    isDirty: isDirty as unknown as boolean,
    isSubmitting: isSubmitting as unknown as boolean,
    isReady: isReady as unknown as boolean,
    prepare,
    submit,
  })
}
