import { Check } from 'lucide-react'

// The tick box used to complete a task (round) or a checklist item (square).
export default function TaskCheckbox({ checked, onChange, label, shape = 'round', size = 'md' }) {
  const dimension = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'
  const corners = shape === 'round' ? 'rounded-full' : 'rounded'
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex shrink-0 items-center justify-center border transition-colors ${dimension} ${corners} ${
        checked
          ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
          : 'border-neutral-300 bg-white hover:border-indigo-500 dark:border-neutral-600 dark:bg-transparent'
      }`}
    >
      {checked && <Check size={size === 'sm' ? 10 : 12} strokeWidth={3} />}
    </button>
  )
}
