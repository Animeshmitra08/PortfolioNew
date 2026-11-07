import type { IconName } from '../components/ui/Icon'

export interface Highlight {
  title: string
  /** Short uppercase label drawn beside its node in the About visual. */
  tag: string
  body: string
  icon: IconName
}

export const ABOUT = {
  label: 'About me',
  headline: 'Turning ideas into products people use.',
  intro: [
    "I'm a software developer who builds mobile apps, interactive 3D and the integrations that connect them to real systems. Most of my work is in React Native, Expo and TypeScript, with Three.js and React Three Fiber for 3D.",
    'I care about clean architecture, considered interfaces and smooth performance on real phones, not just on a fast development machine.',
  ],
  highlights: [
    {
      title: 'Mobile app development',
      tag: 'Mobile',
      body: 'Apps for Android and iOS from one React Native and Expo codebase.',
      icon: 'phone',
    },
    {
      title: 'Interactive 3D experiences',
      tag: '3D',
      body: 'Live 3D scenes and games built with Three.js and React Three Fiber.',
      icon: 'cube',
    },
    {
      title: 'APIs and integration',
      tag: 'APIs',
      body: 'REST APIs, Firebase and Supabase wired into dependable app workflows.',
      icon: 'layers',
    },
    {
      title: 'Product engineering',
      tag: 'Product',
      body: 'Clean architecture and considered UI, shaped around real problems.',
      icon: 'target',
    },
  ] satisfies Highlight[],
}
