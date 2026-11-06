import { EnterpriseArtwork } from './EnterpriseArtwork'
import { QuestArtwork } from './QuestArtwork'
import { RacingArtwork } from './RacingArtwork'
import { ToolkitArtwork } from './ToolkitArtwork'
import type { ArtworkKind, ArtworkProps } from './types'

export function ProjectArtwork({ kind, ...props }: ArtworkProps & { kind: ArtworkKind }) {
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
