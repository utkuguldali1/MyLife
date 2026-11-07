import { GraduationCap } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function AcademicPage() {
  return (
    <>
      <PageHeader title="Academic" description="Courses, assignments, exams and presentations." />
      <EmptyState
        icon={GraduationCap}
        title="No courses yet"
        description="You'll be able to add courses and track assignments and exams here. Coming in Step 4."
      />
    </>
  )
}
