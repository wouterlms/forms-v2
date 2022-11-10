import { describe, expect, it } from 'vitest'
import { nextTick, reactive } from 'vue'
import { useForm, useFormState } from '../src'

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

const formState = useFormState<FormState>(reactive({
  id: {
    value: null,
  },
  name: {
    value: null,
  },
}))

describe('should', () => {
  it('should be dirty when a value is changed', async () => {
    const form = useForm(formState, {
      handleSubmit: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100)
      }),
    })

    expect(form.isDirty).toBeFalsy()

    formState.setData({
      name: 'John Doe',
    })

    await nextTick()

    expect(form.isDirty).toBeTruthy()

    formState.setData({ name: '' })

    await nextTick()

    expect(form.isDirty).toBeFalsy()

    formState.setData({ name: 'John Doe' })

    await form.submit()

    expect(form.isDirty).toBeFalsy()
  })

  it('should submit correctly', async () => {
    const form = useForm(formState, {
      handleSubmit: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100)
      }),
    })

    expect(form.isSubmitting).toBeFalsy()

    const submit = form.submit()
    expect(form.isSubmitting).toBeTruthy()
    await submit
    expect(form.isSubmitting).toBeFalsy()
  })

  it('should only be ready after prepare is finished', async () => {
    const form = useForm(formState, {
      handlePrepare: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100)
      }),
      handleSubmit: () => {
        //
      },
    })

    expect(form.isReady).toBeFalsy()

    await form.prepare()

    expect(form.isReady).toBeTruthy()
  })
})
