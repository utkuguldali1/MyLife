import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { lastEntryByRoutine } from '../../lib/routines'

// Routines plus quick lookups (category by id, newest history entry by routine)
export function useRoutineData() {
  const routines = useAppStore((s) => s.routines)
  const completionLog = useAppStore((s) => s.completionLog)
  const categories = useAppStore((s) => s.categories)

  const lastEntries = useMemo(() => lastEntryByRoutine(completionLog), [completionLog])
  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  )
  return { routines, lastEntries, categoryById }
}
