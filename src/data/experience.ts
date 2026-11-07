export interface ExperienceEntry {
  role: string
  company: string
  location?: string
  /** Shown as written, e.g. "Jan 2023". */
  start: string
  /** Use "Present" for a current role. */
  end: string
  responsibilities: string[]
  stack: string[]
}

export const EXPERIENCE_SECTION = {
  label: 'Experience',
  title: 'Building,\nlearning,\nimproving.',
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: 'Software Developer / Mobile Application Developer',
    // TODO: replace the company name, location and start date with your own.
    company: 'Company Name',
    start: 'Start date',
    end: 'Present',
    responsibilities: [
      'Developed Android and iOS apps from one React Native and Expo codebase.',
      'Integrated REST APIs and implemented dynamic application workflows.',
      'Built enterprise mobile apps for operational business processes.',
      'Implemented live vehicle tracking and location features.',
      'Turned business workflows configured on the web into dynamic mobile screens.',
      'Managed application builds, releases, and deployment for Android and iOS.',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'REST APIs', 'Axios', 'Firebase'],
  },
]
