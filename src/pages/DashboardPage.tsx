import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next' // Добавили импорт
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts'
import { TrendingUp, Flame, Trophy, Target, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToTasks } from '../firebase/tasks'
import { getLevelFromXP, getXPToNextLevel, formatNumber, getCategoryEmoji } from '../lib/utils'
import { cn } from '../lib/utils'
import type { Task } from '../types'

// Custom Recharts tooltip
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const { t } = useTranslation() // Добавили перевод для тултипа
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2.5 border border-border shadow-glass text-xs">
      <p className="text-textSecondary font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-textPrimary font-semibold">{p.value}</span>
          <span className="text-textMuted capitalize">
            {p.name === 'added' ? t('dashboard.legend_added') : t('dashboard.legend_completed')}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass rounded-xl p-4 border border-border"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', color)}>
        {icon}
      </div>
      <motion.p
        key={String(value)}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl font-bold text-textPrimary"
      >
        {value}
      </motion.p>
      <p className="text-textSecondary text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-textMuted text-[11px] mt-0.5">{sub}</p>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation() // Активировали хук перевода
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTasks(user.uid, (t) => {
      setTasks(t)
      setLoading(false)
    })
    return unsub
  }, [user])

  // Build last-7-days chart data
  const chartData = (() => {
    const days: { date: string; label: string; completed: number; added: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label = i === 0 ? t('dashboard.today') : d.toLocaleDateString('en', { weekday: 'short' })
      const dayTasks = tasks.filter((t) => t.createdAt.slice(0, 10) === dateStr)
      days.push({
        date: dateStr,
        label,
        completed: dayTasks.filter((t) => t.completed).length,
        added: dayTasks.length,
      })
    }
    return days
  })()

  // Category breakdown
  const categoryBreakdown = (() => {
    const map: Record<string, number> = {}
    tasks.filter((t) => t.completed).forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  })()

  const level = getLevelFromXP(profile?.xp ?? 0)
  const xpProgress = getXPToNextLevel(profile?.xp ?? 0)
  const xpPercent = Math.round((xpProgress.current / xpProgress.needed) * 100)

  const CHART_COLORS = ['#a855f7', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764', '#2e1065']

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surfaceAlt border border-border animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-surfaceAlt border border-border animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-textSecondary text-sm mt-1">
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Trophy className="w-4 h-4 text-yellow-400" />}
          label={t('dashboard.stat_level')}
          value={level}
          sub={t('dashboard.stat_xp_sub', { current: xpProgress.current, needed: xpProgress.needed })}
          color="bg-yellow-400/10"
          delay={0}
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-streak" />}
          label={t('dashboard.stat_streak')}
          value={`${profile?.streak ?? 0}🔥`}
          sub={t('dashboard.stat_streak_sub')}
          color="bg-orange-400/10"
          delay={0.05}
        />
        <StatCard
          icon={<span className="text-coin text-base">🪙</span>}
          label={t('dashboard.stat_coins')}
          value={formatNumber(profile?.coins ?? 0)}
          sub={t('dashboard.stat_coins_sub')}
          color="bg-yellow-300/10"
          delay={0.1}
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-success" />}
          label={t('dashboard.stat_completed')}
          value={profile?.totalTasksCompleted ?? 0}
          sub={t('dashboard.stat_completed_sub')}
          color="bg-green-400/10"
          delay={0.15}
        />
      </div>

      {/* XP Progress Bar (Level) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 border border-border mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-textPrimary text-sm font-semibold">
                {t('dashboard.level_explorer', { level })}
              </p>
              <p className="text-textMuted text-[11px]">
                {t('dashboard.xp_to_next', { percent: xpPercent, next: level + 1 })}
              </p>
            </div>
          </div>
          <span className="text-textMuted text-xs">{xpProgress.current} XP</span>
        </div>
        <div className="h-2.5 bg-surfaceAlt rounded-full overflow-hidden border border-border/50">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
              boxShadow: '0 0 8px var(--color-primary-glow)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Bar Chart — Last 7 days */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-xl p-5 border border-border mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-textPrimary font-semibold text-sm">{t('dashboard.chart_title')}</h2>
        </div>
        <p className="text-textMuted text-[11px] mb-5">{t('dashboard.chart_sub')}</p>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="added" name="added" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={`rgba(168, 85, 247, 0.25)`} />
              ))}
            </Bar>
            <Bar dataKey="completed" name="completed" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/25" />
            {t('dashboard.legend_added')}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            {t('dashboard.legend_completed')}
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5 border border-border"
        >
          <h2 className="text-textPrimary font-semibold text-sm mb-4">{t('dashboard.top_categories')}</h2>
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, count], i) => {
              const maxCount = categoryBreakdown[0][1]
              const pct = Math.round((count / maxCount) * 100)
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm w-5 text-center">{getCategoryEmoji(cat)}</span>
                  <span className="text-textSecondary text-xs capitalize w-20">{cat}</span>
                  <div className="flex-1 h-2 bg-surfaceAlt rounded-full overflow-hidden border border-border/50">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.05 }}
                    />
                  </div>
                  <span className="text-textMuted text-xs w-6 text-right">{count}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}