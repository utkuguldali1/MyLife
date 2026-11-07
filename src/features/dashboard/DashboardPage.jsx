import { LayoutDashboard } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useToday } from '../../hooks/useToday'
import { formatLongDate } from '../../lib/dates'

export default function DashboardPage() {
  const today = useToday()

  return (
    <>
      <PageHeader title="Today" description={formatLongDate(today)} />
      <EmptyState
        icon={LayoutDashboard}
        title="Your daily overview"
        description="Today's tasks, upcoming exams and deadlines will appear here. Coming in Step 6."
      />
    </>
  )
}
