import { useRef } from 'react'

/**
 * Overlays return focus to their trigger when they close. Menus move focus onto items as the pointer
 * hovers them, so browsers then treat that returned focus as keyboard focus and draw the ring after a
 * mouse interaction. When the overlay closes by pointer, return focus quietly; keyboard closes keep the ring.
 */
export function usePointerAwareFocusReturn<T extends HTMLElement>() {
  const trigger = useRef<T>(null)
  const pointer = useRef(false)
  const contentProps = {
    onPointerDown: () => { pointer.current = true },
    onKeyDown: () => { pointer.current = false },
    onPointerDownOutside: () => { pointer.current = true },
    onCloseAutoFocus: (event: Event) => {
      const element = trigger.current
      if (!pointer.current || !element) return
      pointer.current = false
      event.preventDefault()
      element.setAttribute('data-focus-quiet', '')
      const restore = () => {
        element.removeAttribute('data-focus-quiet')
        element.removeEventListener('blur', restore)
        element.removeEventListener('keydown', restore)
      }
      element.addEventListener('blur', restore)
      element.addEventListener('keydown', restore)
      element.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
    },
  }
  return { trigger, contentProps }
}
