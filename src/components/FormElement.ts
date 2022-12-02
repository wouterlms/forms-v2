import type { PropType } from 'vue'
import { h } from 'vue'

import type { UseForm } from '../types'

interface FormElement {
  form: UseForm
}

const formElement: FormElement = {
  props: {
    form: {
      type: Object as PropType<UseForm>,
      required: true,
    },
  },
  setup(props: any, { slots }: { slots: any }) {
    props.form.prepare()

    return () => h('form', {
      novalidate: true,
      class: 'w-full h-full flex flex-1 flex-col',
      onSubmit: (e: Event) => {
        e.preventDefault()
        props.form.submit()
      },
    }, slots.default())
  },
} as any

export default formElement
