import { BookOpen, CalendarClock, ClipboardList, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Menu, { MenuItem } from '../../components/ui/Menu'

// The "+ Add" button with a small menu: assignment / exam / course
export default function AddMenu({ onAdd, label = 'Add', withCourse = true }) {
  return (
    <Menu
      trigger={({ toggle, open }) => (
        <Button variant="primary" onClick={toggle} aria-expanded={open}>
          <Plus size={16} /> {label}
        </Button>
      )}
    >
      {(close) => {
        const pick = (kind) => () => {
          onAdd(kind)
          close()
        }
        return (
          <>
            <MenuItem icon={ClipboardList} onClick={pick('task')}>
              Assignment or homework
            </MenuItem>
            <MenuItem icon={CalendarClock} onClick={pick('event')}>
              Exam or presentation
            </MenuItem>
            {withCourse && (
              <MenuItem icon={BookOpen} onClick={pick('course')}>
                Course
              </MenuItem>
            )}
          </>
        )
      }}
    </Menu>
  )
}
