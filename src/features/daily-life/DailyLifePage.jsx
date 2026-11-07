import { House } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function DailyLifePage() {
  return (
    <>
      <PageHeader title="Daily Life" description="Chores, errands and everyday responsibilities." />
      <EmptyState
        icon={House}
        title="No tasks yet"
        description="You'll be able to add, complete and postpone everyday tasks here. Coming in Step 3."
      />
    </>
  )
}
