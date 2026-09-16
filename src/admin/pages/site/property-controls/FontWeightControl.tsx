import { useRef, useState } from 'react'
import type { ControlProps } from './shared'
import { ControlRow } from '@ui/components/ControlRow'
import { Input } from '@ui/components/Input'

interface FontWeightControlProps extends ControlProps<string> {
  min: number
  max: number
  step?: number
  placeholder?: string
}

/** Editable weight control used when the selected family exposes a weight axis. */
export function FontWeightControl({
  propKey,
  value,
  onChange,
  label,
  min,
  max,
  step = 50,
  placeholder,
}: FontWeightControlProps) {
  const [draft, setDraft] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  const [lastExternalValue, setLastExternalValue] = useState(value)
  const skipNextBlur = useRef(false)

  if (!isEditing && value !== lastExternalValue) {
    setLastExternalValue(value)
    setDraft(value)
  }

  function commit(nextValue: string) {
    setIsEditing(false)
    if (nextValue === value) return
    onChange(propKey, nextValue)
  }

  function cancel(input: HTMLInputElement) {
    skipNextBlur.current = true
    setDraft(value)
    setIsEditing(false)
    input.blur()
  }

  return (
    <ControlRow propKey={propKey} label={label}>
      <Input
        id={`ctrl-${propKey}`}
        type="text"
        inputMode="numeric"
        value={draft}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        numberSpinner
        fieldSize="sm"
        aria-label={label}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          if (skipNextBlur.current) {
            skipNextBlur.current = false
            return
          }
          commit(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.blur()
          } else if (event.key === 'Escape') {
            event.preventDefault()
            cancel(event.currentTarget)
          }
        }}
      />
    </ControlRow>
  )
}
