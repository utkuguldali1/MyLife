import { CalendarDays } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendar" description="Everything in one monthly or weekly view." />
      <EmptyState
        icon={CalendarDays}
        title="Calendar coming soon"
        description="Deadlines, exams, presentations and routines will appear here in color. Coming in Step 7."
      />
    </>
  )
}
