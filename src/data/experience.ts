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
  title: 'Building,\nLearning,\nImproving.',
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: 'Software Developer / Mobile Application Developer',
    // TODO: replace the company name, location and start date with your own.
    company: 'Company Name',
    start: 'Start date',
    end: 'Present',
    responsibilities: [
      'Developed cross-platform mobile applications using React Native and Expo.',
      'Integrated REST APIs and implemented dynamic application workflows.',
      'Built enterprise mobile solutions for operational business processes.',
      'Implemented real-time vehicle tracking and location-based functionality.',
      'Worked with configurable web-based business workflows to deliver dynamic mobile experiences.',
      'Managed application builds, releases, and deployment for Android and iOS.',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'REST APIs', 'Axios', 'Firebase'],
  },
]
