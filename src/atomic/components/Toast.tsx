import { Icon } from '../atoms'
import { Alert, type AlertProps, type AnnouncementPolicy } from './Alert'
export type ToastProps = Omit<AlertProps, 'announce' | 'action'> & { onDismiss: () => void }
export function Toast({ onDismiss, announcement, ...props }: ToastProps) {
  const policy: AnnouncementPolicy = announcement ?? (props.tone === 'danger' || props.tone === 'warning' ? 'assertive' : 'polite')
  return <Alert {...props} announcement={policy} className={`c-toast ${props.className ?? ''}`} action={<button type="button" className="c-toast__dismiss" aria-label="Dismiss notification" onClick={onDismiss}><Icon name="close" size="small" /></button>} />
}
