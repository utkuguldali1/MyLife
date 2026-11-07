import { Moon, Sun } from 'lucide-react'

// A button that switches between light and dark mode.
// `showLabel` adds the text next to the icon (used in the desktop sidebar).
export default function ThemeToggle({ theme, onToggle, showLabel = false }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Light mode' : 'Dark mode'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${label.toLowerCase()}`}
      title={`Switch to ${label.toLowerCase()}`}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {showLabel && <span>{label}</span>}
    </button>
  )
}
