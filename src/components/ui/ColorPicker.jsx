import { COLOR_NAMES, colorClasses } from '../../lib/colors'
import Menu from './Menu'

// A round color button that opens a palette to pick a new color
export default function ColorPicker({ value, onChange }) {
  return (
    <Menu
      align="left"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Change color"
          title="Change color"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <span className={`h-4 w-4 rounded-full ${colorClasses(value).dot}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="grid grid-cols-6 gap-1 p-1">
          {COLOR_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              title={colorClasses(name).label}
              aria-label={colorClasses(name).label}
              onClick={() => {
                onChange(name)
                close()
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                name === value ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <span className={`h-4 w-4 rounded-full ${colorClasses(name).dot}`} />
            </button>
          ))}
        </div>
      )}
    </Menu>
  )
}
