export const FIELDS = ['name', 'email', 'subject', 'message'] as const
export type Field = (typeof FIELDS)[number]
export type Values = Record<Field, string>
export type Errors = Partial<Record<Field, string>>

export const EMPTY_VALUES: Values = { name: '', email: '', subject: '', message: '' }

export const MAX_LENGTH: Record<Field, number> = {
  name: 80,
  email: 254,
  subject: 120,
  message: 4000,
}

export const MIN_MESSAGE_LENGTH = 20

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validate(values: Values): Errors {
  const errors: Errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const subject = values.subject.trim()
  const message = values.message.trim()

  if (!name) errors.name = 'Please enter your name.'
  else if (name.length < 2) errors.name = 'Your name should be at least 2 characters.'

  if (!email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.'

  if (!subject) errors.subject = 'Please add a subject.'
  else if (subject.length < 3) errors.subject = 'The subject should be at least 3 characters.'

  if (!message) errors.message = 'Please write a message.'
  else if (message.length < MIN_MESSAGE_LENGTH)
    errors.message = `Please write at least ${MIN_MESSAGE_LENGTH} characters so I have some context.`

  for (const field of FIELDS) {
    if (!errors[field] && values[field].length > MAX_LENGTH[field]) {
      errors[field] = `Please keep this under ${MAX_LENGTH[field]} characters.`
    }
  }

  return errors
}

export function trimValues(values: Values): Values {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    subject: values.subject.trim(),
    message: values.message.trim(),
  }
}
