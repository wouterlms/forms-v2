import { describe, expect, it } from 'vitest'
import { nextTick, reactive, ref } from 'vue'
import { useFormState } from '../src'

interface FormState {
  id: {
    value: string | null
    returns: string | null
  }
  name: {
    value: string | null
    returns: string
  }
}

describe('should', () => {
  it('should create a simple form state', () => {
    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: null,
      },
    }))

    expect(formState.state).toEqual({
      id: {
        value: null,
      },
      name: {
        value: null,
      },
    })

    expect(formState.isValid).toBeTruthy()
  })

  it('should validate the form correctly', async () => {
    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: null,
        validate: value => new Promise((resolve) => {
          setTimeout(() => {
            if (value === null)
              resolve('Name is required')

            resolve(null)
          }, 100)
        }),
      },
    }))

    expect(formState.isValid).toBeFalsy()
    expect(formState.state.name.error).toBeUndefined()

    await formState.validate()

    expect(formState.isValid).toBeFalsy()
    expect(formState.state.name.error).toEqual('Name is required')

    expect(formState.isValidProperty('name')).toBeFalsy()

    formState.reset()

    expect(formState.isValid).toBeFalsy()
    expect(formState.state.name.error).toEqual(null)

    await formState.validate(['name'])

    expect(formState.isValid).toBeFalsy()
    expect(formState.state.name.error).toEqual('Name is required')
  })

  it('getData()', () => {
    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: 'John Doe',
        get: value => value?.toUpperCase() as string,
      },
    }))

    expect(formState.getData()).toEqual({
      id: null,
      name: 'JOHN DOE',
    })
  })

  it ('setData()', async () => {
    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: 'John Doe',
      },
    }))

    await formState.setData({
      name: 'Jane Doe',
    })

    expect(formState.getData()).toEqual({
      id: null,
      name: 'Jane Doe',
    })
  })

  it ('setErrors()', async () => {
    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: 'John Doe',
      },
    }))

    formState.setErrors({
      name: 'Name is required',
    })

    expect(formState.state.name.error).toEqual('Name is required')
    expect(formState.isValid).toBeFalsy()

    await formState.setData({ name: 'Jane doe' })

    await nextTick()

    expect(formState.isValid).toBeTruthy()
  })

  it ('should revalidate a property when validation changes', async () => {
    const disableValidation = ref(false)

    const formState = useFormState<FormState>(reactive({
      id: {
        value: null,
      },
      name: {
        value: null,
        validate: (name) => {
          if (disableValidation.value)
            return null

          if (name === null || name.length === 0)
            return 'Name is required'

          return null
        },
      },
    }))

    expect(formState.isValid).toBeFalsy()
    await formState.validate()
    expect(formState.state.name.error).toBe('Name is required')

    disableValidation.value = true

    await nextTick()

    expect(formState.isValid).toBeTruthy()
  })
})
