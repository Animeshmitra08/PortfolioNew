import type { IconName } from '../components/ui/Icon'

export interface ApproachStage {
  title: string
  body: string
  icon: IconName
}

export const APPROACH_SECTION = {
  label: 'My approach',
  title: 'From concept to creation.',
}

export const APPROACH_STAGES: ApproachStage[] = [
  {
    title: 'Understand',
    body: 'Understand the problem, requirements, and user expectations.',
    icon: 'search',
  },
  {
    title: 'Design',
    body: 'Create clean, intuitive, and functional experiences.',
    icon: 'pen',
  },
  {
    title: 'Develop',
    body: 'Build scalable, maintainable, and performant solutions.',
    icon: 'code',
  },
  {
    title: 'Deliver',
    body: 'Test, refine, deploy, and continuously improve.',
    icon: 'send',
  },
]
