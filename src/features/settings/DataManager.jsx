import { useRef, useState } from 'react'
import { Download, FlaskConical, Trash2, Upload } from 'lucide-react'
import { pickData, useAppStore } from '../../store/useAppStore'
import { downloadBackup, readBackupFile } from '../../services/storage'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

// One line in the "Your data" list: text on the left, button on the right
function DataRow({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{description}</div>
      </div>
      {children}
    </div>
  )
}

export default function DataManager() {
  const replaceAllData = useAppStore((s) => s.replaceAllData)
  const resetAllData = useAppStore((s) => s.resetAllData)
  const loadSampleData = useAppStore((s) => s.loadSampleData)

  const fileInputRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [confirm, setConfirm] = useState(null) // "sample" | "clear" | null
  const [message, setMessage] = useState(null) // { type: "success" | "error", text }

  function handleExport() {
    downloadBackup(pickData(useAppStore.getState()))
    setMessage({ type: 'success', text: 'Backup downloaded. Keep the file somewhere safe.' })
  }

  async function handleFileChosen(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again later
    if (!file) return
    try {
      setPendingImport(await readBackupFile(file))
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section>
      <h2 className="text-sm font-semibold">Your data</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Everything is saved in this browser only. Download a backup now and then, so you never
        lose it.
      </p>

      <div className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
        <DataRow title="Export backup" description="Download all your data as a .json file.">
          <Button onClick={handleExport}>
            <Download size={15} /> Export
          </Button>
        </DataRow>

        <DataRow title="Import backup" description="Replace your data with a backup file.">
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChosen}
            className="hidden"
          />
        </DataRow>

        <DataRow
          title="Load sample data"
          description="Fill the app with example tasks to try it out."
        >
          <Button onClick={() => setConfirm('sample')}>
            <FlaskConical size={15} /> Load sample
          </Button>
        </DataRow>

        <DataRow title="Clear all data" description="Delete everything and start fresh.">
          <Button variant="danger" onClick={() => setConfirm('clear')}>
            <Trash2 size={15} /> Clear all
          </Button>
        </DataRow>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
          }`}
        >
          {message.text}
        </p>
      )}

      <ConfirmDialog
        open={pendingImport !== null}
        title="Replace all data?"
        message="Your current data will be replaced by the backup. Export a backup first if you want to keep it."
        confirmLabel="Replace"
        danger
        onConfirm={() => {
          replaceAllData(pendingImport)
          setMessage({ type: 'success', text: 'Backup imported.' })
        }}
        onCancel={() => setPendingImport(null)}
      />
      <ConfirmDialog
        open={confirm === 'sample'}
        title="Load sample data?"
        message="This replaces your current data with example data."
        confirmLabel="Load sample"
        onConfirm={() => {
          loadSampleData()
          setMessage({ type: 'success', text: 'Sample data loaded.' })
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'clear'}
        title="Clear all data?"
        message="This deletes all your tasks, courses, routines and categories. It can't be undone."
        confirmLabel="Clear everything"
        danger
        onConfirm={() => {
          resetAllData()
          setMessage({ type: 'success', text: 'All data cleared.' })
        }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  )
}
