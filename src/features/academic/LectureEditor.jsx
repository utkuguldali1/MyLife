import { Plus, X } from 'lucide-react'
import { createId } from '../../lib/ids'
import { addMinutesToTime, timeToMinutes, WEEKDAYS } from '../../lib/courses'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import TimeSelect from '../../components/ui/TimeSelect'

// Edits the list of weekly lecture times inside the course form.
// Each row: weekday, start, end and an optional label ("Tutorial", "Lab"…).
export default function LectureEditor({ lectures, onChange }) {
  const update = (id, changes) =>
    onChange(lectures.map((l) => (l.id === id ? { ...l, ...changes } : l)))

  function changeStart(lecture, start) {
    // Keep the same length when the start moves (90 minutes if unclear)
    const length = timeToMinutes(lecture.end) - timeToMinutes(lecture.start)
    update(lecture.id, { start, end: addMinutesToTime(start, length > 0 ? length : 90) })
  }

  function addLecture() {
    const last = lectures.at(-1)
    onChange([
      ...lectures,
      {
        id: createId(),
        weekday: last ? Math.min(last.weekday + 1, 5) : 1,
        start: last?.start ?? '10:15',
        end: last?.end ?? '11:45',
        label: '',
      },
    ])
  }

  return (
    <div className="space-y-2">
      {lectures.map((lecture) => (
        <div
          key={lecture.id}
          className="flex flex-wrap items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50"
        >
          <Select
            value={lecture.weekday}
            onChange={(e) => update(lecture.id, { weekday: Number(e.target.value) })}
            aria-label="Weekday"
            className="w-auto"
          >
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.long}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-1.5">
            <TimeSelect
              value={lecture.start}
              onChange={(start) => changeStart(lecture, start)}
              aria-label="Start time"
              className="w-auto"
            />
            <span className="text-neutral-400">–</span>
            <TimeSelect
              value={lecture.end}
              onChange={(end) => update(lecture.id, { end })}
              aria-label="End time"
              className="w-auto"
            />
          </div>
          <Input
            value={lecture.label}
            onChange={(e) => update(lecture.id, { label: e.target.value })}
            placeholder="Label, e.g. Tutorial (optional)"
            aria-label="Label"
            className="min-w-40 flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove lecture time"
            onClick={() => onChange(lectures.filter((l) => l.id !== lecture.id))}
          >
            <X size={15} />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="ghost" onClick={addLecture}>
        <Plus size={15} /> Add lecture time
      </Button>
    </div>
  )
}
