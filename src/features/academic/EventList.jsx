import { useMemo, useState } from 'react'
import { groupEvents } from '../../lib/events'
import TaskSection from '../tasks/TaskSection'
import EventItem from './EventItem'

// Exams and presentations: upcoming first, past ones folded away.
export default function EventList({
  events,
  courseById,
  typeById,
  today,
  onEdit,
  showCourse = true,
}) {
  const [showPast, setShowPast] = useState(false)
  const { upcoming, past } = useMemo(() => groupEvents(events, today), [events, today])

  const renderEvent = (event) => (
    <EventItem
      key={event.id}
      event={event}
      course={courseById[event.courseId]}
      typeName={typeById[event.typeId]?.name}
      today={today}
      showCourse={showCourse}
      onEdit={() => onEdit(event)}
    />
  )

  return (
    <div className="space-y-8">
      <TaskSection title="Upcoming" count={upcoming.length}>
        {upcoming.length === 0 ? (
          <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Nothing coming up
          </li>
        ) : (
          upcoming.map(renderEvent)
        )}
      </TaskSection>
      {past.length > 0 && (
        <TaskSection
          title="Past"
          count={past.length}
          collapsible
          open={showPast}
          onToggle={() => setShowPast((o) => !o)}
        >
          {past.map(renderEvent)}
        </TaskSection>
      )}
    </div>
  )
}
