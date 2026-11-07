// A row of small toggle buttons where exactly one is selected
export default function ChoiceButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors ${
        selected
          ? 'bg-indigo-50 font-medium text-indigo-700 ring-1 ring-indigo-600/30 ring-inset dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/30'
          : 'text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}
