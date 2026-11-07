export interface NavLink {
  label: string
  /** In-page anchor, e.g. `#work`. */
  href: string
}

/** Every section, in page order. The mobile menu and footer list them all. */
export const SECTIONS: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Experience', href: '#experience' },
  { label: 'Approach', href: '#approach' },
  { label: 'Contact', href: '#contact' },
]

/** The desktop header's shorter list, also in page order. */
export const PRIMARY_NAV: NavLink[] = SECTIONS.filter((link) =>
  ['#about', '#work', '#approach', '#contact'].includes(link.href),
)

/** Section ids (without `#`), for scroll tracking. */
export const SECTION_IDS: string[] = SECTIONS.map((link) => link.href.slice(1))
