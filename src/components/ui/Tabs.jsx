// A row of tabs, e.g. "Tasks | Exams & presentations | Courses".
//   tabs:     [{ value, label, count? }]
//   value:    the selected tab
//   onChange: called with the new tab's value
export default function Tabs({ tabs, value, onChange }) {
  return (
    <div
      role="tablist"
      className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 [scrollbar-width:none] md:mx-0 md:px-0 dark:border-neutral-800"
    >
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
              selected
                ? 'border-indigo-600 font-medium text-neutral-900 dark:border-indigo-400 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="rounded-full bg-neutral-100 px-1.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
