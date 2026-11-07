import { TIME_OPTIONS } from '../../lib/courses'
import { Select } from './Field'

// A time picker that always shows 24-hour times in 15-minute steps.
// (The browser's own time field can show AM/PM depending on the computer.)
//   allowEmpty: adds a "–" option for "no time"
export default function TimeSelect({ value, onChange, allowEmpty = false, ...props }) {
  // Keep an unusual saved time (e.g. "10:10") selectable
  const options =
    value && !TIME_OPTIONS.includes(value) ? [...TIME_OPTIONS, value].sort() : TIME_OPTIONS
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props}>
      {allowEmpty && <option value="">–</option>}
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </Select>
  )
}
