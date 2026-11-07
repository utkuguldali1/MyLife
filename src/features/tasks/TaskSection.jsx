import { ChevronRight } from 'lucide-react'

// A titled group of tasks, e.g. "Today · 3".
//   collapsible + open + onToggle: lets the section fold away (used for "Completed")
//   action: an optional small button on the right of the heading
export default function TaskSection({
  title,
  count,
  children,
  collapsible = false,
  open = true,
  onToggle,
  action,
  note,
}) {
  const heading = (
    <>
      {collapsible && (
        <ChevronRight size={15} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      )}
      <span>{title}</span>
      <span className="font-normal text-neutral-400 dark:text-neutral-500">{count}</span>
    </>
  )

  return (
    <section>
      <div className="mb-2 flex min-h-8 items-center justify-between gap-2">
        {collapsible ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
          >
            {heading}
          </button>
        ) : (
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {heading}
          </h2>
        )}
        {action}
      </div>
      {note}
      {open && <ul className="space-y-2">{children}</ul>}
    </section>
  )
}
