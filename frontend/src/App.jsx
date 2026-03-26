import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/rbac/ProtectedRoute'

import HomePage          from './pages/HomePage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import ReportPage        from './pages/ReportPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import DashboardPage     from './pages/DashboardPage'
import AdminPage         from './pages/admin/AdminPage'
import OrgPage           from './pages/org/OrgPage'
import UnauthorizedPage  from './pages/UnauthorizedPage'
import NotFoundPage      from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"             element={<HomePage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Any logged-in user */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* USER only — report a problem */}
        <Route path="/report" element={
          <ProtectedRoute roles={['user']}>
            <ReportPage />
          </ProtectedRoute>
        } />

        {/* ADMIN only */}
        <Route path="/admin/*" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        } />

        {/* ORGANIZATION only */}
        <Route path="/organization/*" element={
          <ProtectedRoute roles={['organization']}>
            <OrgPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
