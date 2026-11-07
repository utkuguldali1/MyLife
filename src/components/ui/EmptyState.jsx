// A friendly placeholder box shown when there's nothing to display yet.
//   icon:        the icon component to show (from lucide-react)
//   title:       short bold message
//   description: one sentence of explanation
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          <Icon size={20} />
        </div>
      )}
      <h2 className="text-sm font-medium">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  )
}
