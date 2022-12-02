import { useFormState } from './composables'

export * from './composables'
export * from './components'
export type { FormObject, FormState, UseForm, FormStateType } from './types'

interface UserForm {
  name: {
    value: string | null
    returns: string
  }
  address: {
    street: {
      value: string | null
      returns: string
    }
  }
}

