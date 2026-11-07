import PageHeader from '../../components/layout/PageHeader'
import AcademicTypeManager from './AcademicTypeManager'
import CategoryManager from './CategoryManager'
import DataManager from './DataManager'

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Categories, academic types, backups and your data." />
      <div className="max-w-2xl space-y-10">
        <CategoryManager />
        <AcademicTypeManager />
        <DataManager />
      </div>
    </>
  )
}
