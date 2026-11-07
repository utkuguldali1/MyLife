import { NavLink } from 'react-router'
import { Settings } from 'lucide-react'
import { navItems } from '../../app/navigation'
import ThemeToggle from '../../features/theme/ThemeToggle'
import AppLogo from './AppLogo'

// The menu on the left side of the screen. Only visible on larger screens
// ("hidden md:flex" = hidden on phones, shown from tablet size upwards).
export default function Sidebar({ theme, onToggleTheme }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-neutral-200 bg-neutral-50 px-3 py-4 md:flex dark:border-neutral-800 dark:bg-neutral-900">
      <div className="px-2.5 pb-6">
        <AppLogo />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              isActive
                ? 'bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} showLabel />
      </div>
    </aside>
  )
}
