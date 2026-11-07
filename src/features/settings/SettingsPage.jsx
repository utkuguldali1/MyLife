import PageHeader from '../../components/layout/PageHeader'
import CategoryManager from './CategoryManager'
import DataManager from './DataManager'

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Categories, backups and your data." />
      <div className="max-w-2xl space-y-10">
        <CategoryManager />
        <DataManager />
      </div>
    </>
  )
}
