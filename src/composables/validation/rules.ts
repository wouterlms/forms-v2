class RuleError extends Error {
  constructor(rule: string, types: string[]) {
    super(`${rule} validation only allows values of type ${types.map(type => `\`${type}\``).join(', ')}`)
  }
}

const required = (value: unknown): boolean => {
  if (value === null || value === undefined)
    return false

  if (typeof value === 'string')
    return !!value.trim().length

  if (typeof value === 'boolean')
    return value

  if (typeof value === 'number')
    return true

  if (Array.isArray(value))
    return !!value.length

  return !!value
}

const minLength = (value: string | unknown[] | null, minLength: number): boolean => {
  if (typeof value === 'string')
    return !value || value.trim().length >= minLength

  return !!value && value.length >= minLength
}

const maxLength = (value: string | unknown[] | null, maxLength: number): boolean => {
  if (typeof value === 'string')
    return !value || value.trim().length <= maxLength

  return !!value && value.length <= maxLength
}

const min = (value: number | Date, min: number | Date): boolean => {
  if (value === null)
    return true

  if (!(value instanceof Date) && typeof value !== 'number')
    throw new RuleError('min', ['Number', 'Date'])

  if (value instanceof Date)
    return value.getTime() >= (min as Date).getTime()

  return value >= (min as number)
}

const max = (value: number | Date | null, max: number | Date): boolean => {
  if (value === null)
    return true

  if (!(value instanceof Date) && !(typeof value === 'number'))
    throw new RuleError('max', ['Number', 'Date'])

  if (value instanceof Date)
    return value.getTime() <= (max as Date).getTime()

  return value <= (max as number)
}

const fileSize = (file: File | null, maxFileSize: number): boolean => {
  if (!file)
    return true

  if (!(file instanceof File))
    throw new RuleError('filesize', ['File'])

  return file.size <= maxFileSize
}

const email = (
  value: string | null,
): boolean => !value || /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)

const url = (
  value: string,
): boolean => !value || /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(value)

export default {
  required,
  minLength,
  maxLength,
  min,
  max,
  fileSize,
  email,
  url,
}
