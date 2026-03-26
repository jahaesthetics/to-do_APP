import { Navigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default function Layout() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg">
        {/* Sonner Toast Provider */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            },
            className: 'sonner-toast',
          }}
          richColors
          expand={false}
          gap={8}
        />

        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </ThemeProvider>
  )
}
