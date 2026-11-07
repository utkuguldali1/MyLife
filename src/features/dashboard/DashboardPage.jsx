import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function DashboardPage() {
  // Today's date written out, e.g. "Saturday, November 7".
  // useState(() => ...) works it out once when the page opens.
  const [today] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  )

  return (
    <>
      <PageHeader title="Today" description={today} />
      <EmptyState
        icon={LayoutDashboard}
        title="Your daily overview"
        description="Today's tasks, upcoming exams and deadlines will appear here. Coming in Step 6."
      />
    </>
  )
}
