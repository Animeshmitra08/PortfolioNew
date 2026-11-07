import type { IconName } from '../components/ui/Icon'

export interface SkillGroup {
  title: string
  blurb: string
  icon: IconName
  items: string[]
}

export const SKILLS_SECTION = {
  label: 'Tech stack',
  title: 'Tools behind the work.',
  intro: 'The languages, frameworks and tools I reach for, grouped by where they fit in a product.',
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Frontend development',
    blurb: 'Typed interfaces built from components, for the web and mobile.',
    icon: 'browser',
    items: ['React', 'React Native', 'Expo', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    title: 'Backend and integration',
    blurb: 'Connecting apps to data, services and live back ends.',
    icon: 'nodes',
    items: ['REST APIs', 'Axios', 'Node.js', 'Supabase', 'Firebase'],
  },
  {
    title: 'Mobile engineering',
    blurb: 'Navigation, UI, storage and the path from build to store.',
    icon: 'phone',
    items: ['Expo Router', 'React Native Paper', 'MMKV', 'EAS Build', 'Android & iOS deployment'],
  },
  {
    title: '3D and interactive development',
    blurb: 'Live scenes, modelling and physics for interactive work.',
    icon: 'cube',
    items: ['Three.js', 'React Three Fiber', 'Blender', 'Matter.js'],
  },
  {
    title: 'Developer tools',
    blurb: 'The everyday toolkit for versioning, building and designing.',
    icon: 'terminal',
    items: ['Git', 'GitHub', 'VS Code', 'npm', 'Figma'],
  },
]
