import { Repeat } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function RoutinesPage() {
  return (
    <>
      <PageHeader title="Routines" description="Recurring tasks that reschedule themselves." />
      <EmptyState
        icon={Repeat}
        title="No routines yet"
        description="Set up things like laundry every 7 days or cleaning every Sunday. Coming in Step 5."
      />
    </>
  )
}
