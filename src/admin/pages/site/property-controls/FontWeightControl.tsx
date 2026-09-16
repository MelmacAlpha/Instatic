import type { ControlProps } from './shared'
import { ControlRow } from '@ui/components/ControlRow'
import { Input } from '@ui/components/Input'

interface FontWeightControlProps extends ControlProps<string> {
  min: number
  max: number
  step?: number
  placeholder?: string
}

/** Numeric weight control used when the selected family exposes a weight axis. */
export function FontWeightControl({
  propKey,
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  placeholder,
}: FontWeightControlProps) {
  return (
    <ControlRow propKey={propKey} label={label}>
      <Input
        id={`ctrl-${propKey}`}
        type="number"
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        fieldSize="sm"
        aria-label={label}
        onChange={(event) => onChange(propKey, event.target.value)}
      />
    </ControlRow>
  )
}
