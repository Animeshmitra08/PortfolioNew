import type { IconName } from '../components/ui/Icon'

export interface SkillGroup {
  title: string
  blurb: string
  icon: IconName
  items: string[]
}

export const SKILLS_SECTION = {
  label: 'Tech stack',
  title: 'Tools Behind the Work.',
  intro: 'The languages, frameworks and tools I reach for, grouped by where they fit in a product.',
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Frontend Development',
    blurb: 'Typed, component-driven interfaces for the web and mobile.',
    icon: 'browser',
    items: ['React', 'React Native', 'Expo', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    title: 'Backend & Integration',
    blurb: 'Connecting apps to data, services and real-time back ends.',
    icon: 'nodes',
    items: ['REST APIs', 'Axios', 'Node.js', 'Supabase', 'Firebase'],
  },
  {
    title: 'Mobile Engineering',
    blurb: 'Navigation, UI, storage and the path from build to store.',
    icon: 'phone',
    items: ['Expo Router', 'React Native Paper', 'MMKV', 'EAS Build', 'Android & iOS deployment'],
  },
  {
    title: '3D & Interactive Development',
    blurb: 'Real-time scenes, modelling and physics for interactive work.',
    icon: 'cube',
    items: ['Three.js', 'React Three Fiber', 'Blender', 'Matter.js'],
  },
  {
    title: 'Developer Tools',
    blurb: 'The everyday toolkit for versioning, building and designing.',
    icon: 'terminal',
    items: ['Git', 'GitHub', 'VS Code', 'npm', 'Figma'],
  },
]
