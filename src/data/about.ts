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
  headline: 'Engineering Ideas Into Real-World Products.',
  intro: [
    "I'm a software developer passionate about building practical digital products, mobile applications, and interactive experiences. I enjoy working across frontend development, mobile engineering, API integration, and 3D technologies.",
    'My approach combines clean architecture, thoughtful UI design, and performance-focused development to create applications that solve real problems.',
  ],
  highlights: [
    {
      title: 'Mobile Application Development',
      tag: 'Mobile',
      body: 'Cross-platform apps for Android and iOS with React Native and Expo.',
      icon: 'phone',
    },
    {
      title: 'Interactive 3D Experiences',
      tag: '3D',
      body: 'Real-time scenes and games built with Three.js and React Three Fiber.',
      icon: 'cube',
    },
    {
      title: 'Full-Stack Integration',
      tag: 'Full-stack',
      body: 'REST APIs, Firebase and Supabase wired into dependable app workflows.',
      icon: 'layers',
    },
    {
      title: 'Product Engineering',
      tag: 'Product',
      body: 'Clean architecture and considered UI, shaped around real problems.',
      icon: 'target',
    },
  ] satisfies Highlight[],
}
