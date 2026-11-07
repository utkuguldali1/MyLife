import { CalendarDays, GraduationCap, House, LayoutDashboard, Repeat } from 'lucide-react'

// The list of pages in the app.
// Both the desktop sidebar and the mobile bottom bar are built from this list,
// so adding a page here adds it to both menus.
//   path:       the web address of the page
//   label:      the full name (desktop sidebar)
//   shortLabel: a shorter name that fits on a phone screen
//   icon:       the little picture next to the name
export const navItems = [
  { path: '/', label: 'Dashboard', shortLabel: 'Today', icon: LayoutDashboard },
  { path: '/academic', label: 'Academic', shortLabel: 'Academic', icon: GraduationCap },
  { path: '/daily-life', label: 'Daily Life', shortLabel: 'Daily', icon: House },
  { path: '/routines', label: 'Routines', shortLabel: 'Routines', icon: Repeat },
  { path: '/calendar', label: 'Calendar', shortLabel: 'Calendar', icon: CalendarDays },
]
