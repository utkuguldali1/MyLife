import { Navigate, Route, Routes } from 'react-router'
import Layout from './Layout'
import DashboardPage from '../features/dashboard/DashboardPage'
import AcademicPage from '../features/academic/AcademicPage'
import DailyLifePage from '../features/daily-life/DailyLifePage'
import RoutinesPage from '../features/routines/RoutinesPage'
import CalendarPage from '../features/calendar/CalendarPage'
import SettingsPage from '../features/settings/SettingsPage'

// Which page to show for which web address.
// All pages sit inside <Layout>, so they all get the sidebar and menus.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/academic" element={<AcademicPage />} />
        <Route path="/daily-life" element={<DailyLifePage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Any unknown address goes back to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
