import { useEffect, useState } from 'react'

// The key under which the chosen theme is saved in the browser.
// (The same key is used by the small script in index.html.)
const STORAGE_KEY = 'slo-theme'

// Decide which theme to start with:
// 1. the theme the user picked last time, if there is one
// 2. otherwise, whatever the computer's own setting is (light or dark)
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Browser storage can be blocked (e.g. private mode) — just ignore it.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// A "hook" is a reusable piece of React logic.
// This one remembers the current theme and gives us a function to switch it.
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  // Whenever the theme changes: update the page and remember the choice.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore — the theme just won't be remembered next time.
    }
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
