import { useEffect, useId, useState, type CSSProperties } from 'react'
import { Icon, Text } from '../atoms'
import './color-picker.css'

export type ColorPickerProps = { label: string; value?: string; onChange?: (value: string) => void; presets?: readonly string[] }

/** Accepts `#rrggbb`, `rrggbb`, `#rgb` or `rgb` and returns a lowercase six-digit hex, or undefined. */
function normalizeHex(input: string): string | undefined {
  const raw = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(raw)) return `#${raw.split('').map(digit => digit + digit).join('')}`
  return /^[0-9a-f]{6}$/.test(raw) ? `#${raw}` : undefined
}

/** Picks ink or white for a mark drawn on top of a color. */
function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? 'ink' : 'light'
}

/** A color field: a swatch that opens the system picker, an editable hex value and preset swatches. */
export function ColorPicker({ label, value = '#72b8ff', onChange, presets = ['#72b8ff', '#23a094', '#dc341e', '#000000', '#ffffff'] }: ColorPickerProps) {
  const id = useId()
  const [current, setCurrent] = useState(normalizeHex(value) ?? value)
  const [draft, setDraft] = useState(current)
  const [invalid, setInvalid] = useState(false)
  useEffect(() => { const next = normalizeHex(value) ?? value; setCurrent(next); setDraft(next); setInvalid(false) }, [value])
  const update = (next: string) => {
    const normalized = normalizeHex(next)
    if (!normalized) return false
    setDraft(normalized)
    setInvalid(false)
    if (normalized !== current) { setCurrent(normalized); onChange?.(normalized) }
    return true
  }
  const commitDraft = () => { if (!update(draft)) setInvalid(true) }
  return <div className="c-color-picker" role="group" aria-labelledby={`${id}-label`}>
    <Text as="span" id={`${id}-label`} variant="h7">{label}</Text>
    <div className="c-color-picker__field" data-invalid={invalid || undefined}>
      <span className="c-color-picker__swatch" style={{ '--c-swatch': current } as CSSProperties}>
        <input className="c-color-picker__native" aria-label={label} type="color" value={current} onChange={event => update(event.target.value)} />
      </span>
      <input
        id={`${id}-hex`}
        className="c-color-picker__hex"
        aria-label={`${label} hex value`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        maxLength={7}
        value={draft}
        onChange={event => { setDraft(event.target.value); if (invalid && normalizeHex(event.target.value)) setInvalid(false) }}
        onBlur={commitDraft}
        onKeyDown={event => {
          if (event.key === 'Enter') { event.preventDefault(); commitDraft() }
          if (event.key === 'Escape') { setDraft(current); setInvalid(false) }
        }}
      />
    </div>
    {invalid && <p id={`${id}-error`} role="alert" className="c-color-picker__error"><Text as="span" variant="small" tone="inherit">Enter a hex color, such as #72b8ff.</Text></p>}
    <div className="c-color-picker__presets" role="group" aria-label={`${label} presets`}>
      {presets.map(color => {
        const selected = current.toLowerCase() === color.toLowerCase()
        return <button key={color} type="button" className="c-color-picker__preset" aria-label={`Use ${color}`} aria-pressed={selected} title={color} data-mark={readableOn(normalizeHex(color) ?? '#ffffff')} style={{ '--c-swatch': color } as CSSProperties} onClick={() => update(color)}>
          {selected && <Icon name="check" size="small" />}
        </button>
      })}
    </div>
  </div>
}
