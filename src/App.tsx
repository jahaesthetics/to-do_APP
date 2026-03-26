import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import DashboardPage from './pages/DashboardPage'
import ShopPage from './pages/ShopPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — guarded inside Layout */}
          <Route element={<Layout />}>
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
