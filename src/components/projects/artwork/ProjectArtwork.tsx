import { EnterpriseArtwork } from './EnterpriseArtwork'
import { QuestArtwork } from './QuestArtwork'
import { RacingArtwork } from './RacingArtwork'
import { ToolkitArtwork } from './ToolkitArtwork'
import { cx } from '../../../utils/cx'
import { ARTWORK_META } from './meta'
import type { ArtworkKind, ArtworkProps } from './types'

/**
 * The light-toned illustrations are pure greys, so in the dark theme they are
 * inverted into dark versions of themselves instead of glowing on a black page.
 */
export function ProjectArtwork({ kind, className, ...rest }: ArtworkProps & { kind: ArtworkKind }) {
  const props = { ...rest, className: cx(className, ARTWORK_META[kind].tone === 'light' && 'dark:invert') }
  switch (kind) {
    case 'racing':
      return <RacingArtwork {...props} />
    case 'quest':
      return <QuestArtwork {...props} />
    case 'toolkit':
      return <ToolkitArtwork {...props} />
    case 'enterprise':
      return <EnterpriseArtwork {...props} />
  }
}
