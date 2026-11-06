import { PROFILE } from '../../data/profile'
import type { Values } from './validation'

/**
 * Optional form endpoint (see `.env.example`). Any service that accepts a JSON
 * POST works, e.g. Formspree (`https://formspree.io/f/<id>`) or your own API.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim()

export type DeliveryMethod = 'endpoint' | 'mail-app'

/**
 * Sends the message to the configured endpoint. Without one, it opens the
 * visitor's email app with the message pre-filled, so the form always works.
 */
export async function sendMessage(values: Values): Promise<DeliveryMethod> {
  if (ENDPOINT) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...values,
        // Conventional fields understood by Formspree and similar services.
        _subject: `Portfolio: ${values.subject}`,
        _replyto: values.email,
      }),
    })
    if (!response.ok) throw new Error(`Contact endpoint responded with ${response.status}`)
    return 'endpoint'
  }

  const body = `${values.message}\n\n— ${values.name}\n${values.email}`
  window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`
  return 'mail-app'
}
