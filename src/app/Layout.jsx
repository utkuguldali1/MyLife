import { Link, Outlet } from 'react-router'
import { Settings } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import MobileNav from '../components/layout/MobileNav'
import AppLogo from '../components/layout/AppLogo'
import ThemeToggle from '../features/theme/ThemeToggle'
import { useTheme } from '../features/theme/useTheme'

// The frame around every page: menus on the outside, the current page inside.
// <Outlet /> is the spot where the current page (Dashboard, Calendar, …) appears.
export default function Layout() {
  // The theme lives here, once, so the sidebar and mobile header always agree.
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />

      {/* Top bar — phones only */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
        <AppLogo />
        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            aria-label="Settings"
            className="rounded-md px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Settings size={16} />
          </Link>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Page content. "md:pl-60" leaves room for the sidebar on larger screens;
          "pb-24" leaves room for the bottom menu on phones. */}
      <main className="pb-24 md:pb-0 md:pl-60">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
