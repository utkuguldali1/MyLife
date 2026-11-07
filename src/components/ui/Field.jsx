// Form building blocks: a label + input, text area and dropdown,
// all sharing the same look.

const inputBase =
  'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700 dark:placeholder:text-neutral-500'

// A label with a form control inside it
export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea rows={3} className={`${inputBase} resize-y ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${inputBase} pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
}
