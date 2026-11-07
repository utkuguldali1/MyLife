import { useEffect, useRef, useState } from 'react'

// A small drop-down menu that opens when you click its button
// and closes when you click anywhere else or press Escape.
//   trigger:  function that draws the button: ({ open, toggle }) => <button…/>
//   children: function that draws the menu content: (close) => …
//   align:    "right" or "left" edge of the button
export default function Menu({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handlePointer(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-1 min-w-48 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/10 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

// One clickable line inside a Menu
export function MenuItem({ icon: Icon, children, onClick, danger = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
      }`}
    >
      {Icon && <Icon size={15} className="shrink-0 opacity-70" />}
      {children}
    </button>
  )
}

// A small grey heading inside a Menu
export function MenuLabel({ children }) {
  return (
    <div className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-neutral-500 dark:text-neutral-500">
      {children}
    </div>
  )
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
}
