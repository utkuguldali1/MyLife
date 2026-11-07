import { NavLink } from 'react-router'
import { navItems } from '../../app/navigation'

// The menu bar at the bottom of the screen on phones.
// ("md:hidden" = hidden from tablet size upwards, where the sidebar is used.)
export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
      <ul className="grid grid-cols-5">
        {navItems.map(({ path, shortLabel, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
                  isActive
                    ? 'font-medium text-indigo-600 dark:text-indigo-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`
              }
            >
              <Icon size={20} />
              {shortLabel}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
