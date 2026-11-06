/**
 * Personal details used across the portfolio (contact section, footer,
 * project links). Update them here and every section follows.
 */
export interface Profile {
  /** Short brand name, matching the header logo. */
  name: string
  fullName: string
  role: string
  /** One-line professional tagline, shown in the footer. */
  tagline: string
  email: string
  github: string
  /** Full profile URL. Leave empty to hide LinkedIn links until one is added. */
  linkedin: string
}

export const PROFILE: Profile = {
  name: 'Animesh',
  fullName: 'Animesh Mitra',
  role: 'Software Developer',
  tagline:
    'Software developer building mobile applications, interactive 3D experiences and practical digital products.',
  email: 'animeshmitra003@gmail.com',
  github: 'https://github.com/Animeshmitra08',
  linkedin: '',
}

export interface ContactChannel {
  label: string
  href: string
  /** Human-readable value, e.g. the address or handle. */
  display: string
  external: boolean
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/** Email, GitHub and LinkedIn (when set), in display order. */
export function getContactChannels(profile: Profile = PROFILE): ContactChannel[] {
  const channels: ContactChannel[] = [
    { label: 'Email', href: `mailto:${profile.email}`, display: profile.email, external: false },
    { label: 'GitHub', href: profile.github, display: stripProtocol(profile.github), external: true },
  ]
  if (profile.linkedin) {
    channels.push({
      label: 'LinkedIn',
      href: profile.linkedin,
      display: stripProtocol(profile.linkedin),
      external: true,
    })
  }
  return channels
}
