// The title area at the top of every page.
//   title:       big heading, e.g. "Calendar"
//   description: one line of grey text under the heading
//   children:    optional buttons on the right (e.g. "New task") — used later
export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
