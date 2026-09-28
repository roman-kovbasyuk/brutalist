import { Banner, TextAction } from '../components'
import './release-notice.css'

export type ReleaseNoticeProps = {
  message: string
  /** Optional destination, such as the release notes. */
  link?: { label: string; href: string }
  /** Shows a close control. The parent removes the notice and decides whether it returns. */
  onDismiss?: () => void
  /** Accessible name of the close control; defaults to “Dismiss notice”. */
  dismissLabel?: string
}

/**
 * A site-wide notice about a release or other time-sensitive news, with an optional destination and close control.
 * It keeps no timers or storage: the parent owns visibility.
 */
export function ReleaseNotice({ message, link, onDismiss, dismissLabel = 'Dismiss notice' }: ReleaseNoticeProps) {
  return <div className="b-release-notice">
    <Banner
      className="b-release-notice__message"
      tone="accent"
      title={message}
      action={link && <TextAction href={link.href} className="c-banner__action">{link.label}</TextAction>}
      onDismiss={onDismiss}
      dismissLabel={dismissLabel}
    />
  </div>
}
