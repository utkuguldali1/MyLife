import { useEffect, useState } from 'react'
import { todayISO } from '../lib/dates'

// Gives today's date ("YYYY-MM-DD") and keeps it correct:
// if the app stays open past midnight, it updates by itself.
export function useToday() {
  const [today, setToday] = useState(todayISO)

  useEffect(() => {
    const update = () => setToday(todayISO())
    const timer = setInterval(update, 60_000) // check once a minute
    window.addEventListener('focus', update) // and when you come back to the tab
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', update)
    }
  }, [])

  return today
}
