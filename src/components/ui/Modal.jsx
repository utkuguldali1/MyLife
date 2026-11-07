import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// A pop-up window. It uses the browser's built-in <dialog> element, which
// already handles the Escape key and keeps keyboard focus inside the pop-up.
//   open:     show or hide it
//   onClose:  called when the user closes it (X button, Escape, click outside)
//   title:    heading at the top
//   footer:   buttons at the bottom (e.g. Cancel / Save)
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Put the cursor in the field marked with data-autofocus (if any)
      dialog.querySelector('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const width = size === 'sm' ? 'max-w-sm' : 'max-w-lg'

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // A click directly on the <dialog> (not its content) means the dark backdrop was clicked
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-xl bg-white p-0 text-neutral-900 shadow-xl ring-1 ring-black/5 backdrop:bg-black/40 backdrop:backdrop-blur-[2px] dark:bg-neutral-900 dark:text-neutral-100 dark:ring-white/10`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
