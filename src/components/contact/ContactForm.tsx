import { useState, type ChangeEvent, type FormEvent } from 'react'
import { PROFILE } from '../../data/profile'
import { cx } from '../../utils/cx'
import { ArrowIcon } from '../ui/ArrowIcon'
import { Icon } from '../ui/Icon'
import { LABEL } from '../ui/typography'
import { sendMessage, type DeliveryMethod } from './sendMessage'
import {
  EMPTY_VALUES,
  FIELDS,
  MAX_LENGTH,
  trimValues,
  validate,
  type Field,
  type Values,
} from './validation'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent'; via: DeliveryMethod }
  | { kind: 'error' }

const ALL_TOUCHED: Record<Field, boolean> = { name: true, email: true, subject: true, message: true }

const INPUT =
  'peer block w-full rounded-none border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-base text-neutral-950 transition-colors duration-300 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-neutral-950 focus:outline-none aria-[invalid=true]:border-neutral-950'

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY_VALUES)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const errors = validate(values)
  const submitting = status.kind === 'submitting'
  const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined)

  const change = (field: Field) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))
    if (status.kind === 'sent' || status.kind === 'error') setStatus({ kind: 'idle' })
  }
  const blur = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget

    setTouched(ALL_TOUCHED)
    const firstInvalid = FIELDS.find((field) => errors[field])
    if (firstInvalid) {
      ;(form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus()
      return
    }

    // Spam trap: people never see this field, bots tend to fill it in.
    const trap = form.elements.namedItem('website') as HTMLInputElement | null
    if (trap?.value) {
      setStatus({ kind: 'sent', via: 'endpoint' })
      return
    }

    setStatus({ kind: 'submitting' })
    try {
      const via = await sendMessage(trimValues(values))
      setStatus({ kind: 'sent', via })
      // Keep the text for the mail-app hand-off, in case no mail app opens.
      if (via === 'endpoint') {
        setValues(EMPTY_VALUES)
        setTouched({})
      }
    } catch {
      setStatus({ kind: 'error' })
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-describedby="contact-status" className="relative grid gap-9">
      <div className="grid gap-9 sm:grid-cols-2 sm:gap-8">
        <TextField
          field="name"
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          error={errorFor('name')}
          onChange={change('name')}
          onBlur={blur('name')}
        />
        <TextField
          field="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errorFor('email')}
          onChange={change('email')}
          onBlur={blur('email')}
        />
      </div>
      <TextField
        field="subject"
        label="Subject"
        placeholder="What would you like to build?"
        value={values.subject}
        error={errorFor('subject')}
        onChange={change('subject')}
        onBlur={blur('subject')}
      />
      <TextField
        field="message"
        label="Message"
        multiline
        placeholder="A few lines about the idea, timeline and anything else useful."
        value={values.message}
        error={errorFor('message')}
        onChange={change('message')}
        onBlur={blur('message')}
        counter={`${values.message.length} / ${MAX_LENGTH.message}`}
      />

      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex cursor-pointer items-center gap-4 rounded-full bg-neutral-950 py-2.5 pr-2.5 pl-6 text-sm font-medium text-white transition-[box-shadow,opacity,scale] duration-300 hover:shadow-[var(--shadow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Sending…' : 'Send Message'}
          <span className="flex size-9 items-center justify-center rounded-full bg-white text-neutral-950">
            {submitting ? (
              <span aria-hidden className="size-3.5 animate-spin rounded-full border-[1.5px] border-neutral-950 border-t-transparent" />
            ) : (
              <ArrowIcon direction="right" className="text-[0.8rem]" />
            )}
          </span>
        </button>

        <p id="contact-status" role="status" className="text-sm leading-relaxed text-neutral-500">
          <StatusMessage status={status} />
        </p>
      </div>
    </form>
  )
}

function StatusMessage({ status }: { status: Status }) {
  switch (status.kind) {
    case 'sent':
      return status.via === 'endpoint' ? (
        <span className="inline-flex items-center gap-2 text-neutral-950">
          <Icon name="check" className="size-4" />
          Thanks — your message is on its way. I’ll reply soon.
        </span>
      ) : (
        <>
          Your email app should open with the message ready to send. If it didn’t, write to{' '}
          <a className="text-neutral-950 underline underline-offset-4" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
          .
        </>
      )
    case 'error':
      return (
        <span className="text-neutral-950">
          Something went wrong sending your message. Please try again, or email{' '}
          <a className="underline underline-offset-4" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
          .
        </span>
      )
    default:
      return null
  }
}

interface TextFieldProps {
  field: Field
  label: string
  value: string
  error?: string
  placeholder?: string
  type?: 'text' | 'email'
  inputMode?: 'text' | 'email'
  autoComplete?: string
  multiline?: boolean
  counter?: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur: () => void
}

function TextField({
  field,
  label,
  value,
  error,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  multiline = false,
  counter,
  onChange,
  onBlur,
}: TextFieldProps) {
  const id = `contact-${field}`
  const errorId = `${id}-error`
  const shared = {
    id,
    name: field,
    value,
    placeholder,
    required: true,
    maxLength: MAX_LENGTH[field],
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange,
    onBlur,
    className: cx(INPUT, multiline && 'min-h-36 resize-y'),
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={cx('text-neutral-500', LABEL)}>
          {label}
        </label>
        {counter && <span aria-hidden className="font-mono text-[0.65rem] text-neutral-400">{counter}</span>}
      </div>
      <div className="relative mt-1">
        {multiline ? (
          <textarea {...shared} rows={5} />
        ) : (
          <input {...shared} type={type} inputMode={inputMode} autoComplete={autoComplete} />
        )}
        {/* Focus line draws across from the left. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100 motion-reduce:transition-none"
        />
      </div>
      {error && (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-xs text-neutral-950">
          <Icon name="alert" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
