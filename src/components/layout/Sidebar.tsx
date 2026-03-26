import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare,
  BarChart2,
  ShoppingBag,
  LogOut,
  Zap,
  Menu,
  X,
  Trophy,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { cn, getLevelFromXP, getXPToNextLevel, formatNumber } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', emoji: '✅' },
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard', emoji: '📊' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop', emoji: '🛍️' },
]

// Animated counter for coins/streak
function AnimatedStat({
  value,
  icon,
  label,
  color,
}: {
  value: number
  icon: string
  label: string
  color: string
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5"
      whileHover={{ scale: 1.05 }}
    >
      <div className={cn('flex items-center gap-1 text-sm font-bold', color)}>
        <span>{icon}</span>
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {formatNumber(value)}
        </motion.span>
      </div>
      <span className="text-textMuted text-[10px] uppercase tracking-wider">{label}</span>
    </motion.div>
  )
}

export default function Sidebar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('See you next time! 👋')
    navigate('/login')
  }

  const level = profile ? getLevelFromXP(profile.xp) : 1
  const xpProgress = profile ? getXPToNextLevel(profile.xp) : { current: 0, needed: 500 }
  const xpPercent = Math.round((xpProgress.current / xpProgress.needed) * 100)

  const avatarEmojis: Record<string, string> = {
    default: '🧙',
    warrior: '⚔️',
    ninja: '🥷',
    astronaut: '👨‍🚀',
    wizard: '🧝',
    dragon: '🐉',
  }
  const avatar = avatarEmojis[profile?.activeAvatar ?? 'default'] ?? '🧙'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-textPrimary font-bold text-base tracking-tight">
              Focus<span className="text-primary">Quest</span>
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Block */}
      {profile && (
        <div className="px-4 py-4 border-b border-border">
          <div className="bg-surfaceAlt rounded-xl p-3 border border-border">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {avatar}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-textPrimary text-sm font-semibold truncate">
                  {profile.displayName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Trophy className="w-3 h-3 text-primary" />
                  <span className="text-primary text-xs font-medium">Level {level}</span>
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-textMuted">
                <span>XP Progress</span>
                <span>{xpProgress.current} / {xpProgress.needed}</span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-around mt-3 pt-3 border-t border-border">
              <AnimatedStat
                value={profile.coins}
                icon="🪙"
                label="Coins"
                color="text-coin"
              />
              <div className="w-px h-8 bg-border" />
              <AnimatedStat
                value={profile.streak}
                icon="🔥"
                label="Streak"
                color="text-streak animate-streak-pulse"
              />
              <div className="w-px h-8 bg-border" />
              <AnimatedStat
                value={profile.totalTasksCompleted}
                icon="✅"
                label="Done"
                color="text-success"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20 shadow-glow-sm'
                  : 'text-textSecondary hover:bg-surfaceAlt hover:text-textPrimary border border-transparent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-base">{emoji}</span>
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-textMuted group-hover:text-textSecondary')} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-primary/10 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-primary/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-surface border-r border-border sticky top-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-textSecondary shadow-card"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-surface border-r border-border z-50 overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
