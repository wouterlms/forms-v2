export interface FormObjectPropertyTypeWithValue {
  value: any
  returns: any
  set?: any
}

export interface FormObjectPropertyTypeWithNested {
  [key: string]: FormObjectPropertyType
}

export type FormObjectPropertyType = FormObjectPropertyTypeWithValue | FormObjectPropertyTypeWithNested
