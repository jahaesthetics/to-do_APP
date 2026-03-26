import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import {
  addTask,
  toggleTask,
  deleteTask,
  subscribeToTasks,
} from '../firebase/tasks'
import { updateStreakAndCoins } from '../firebase/user'
import AddTaskModal from '../components/tasks/AddTaskModal'
import TaskItem from '../components/tasks/TaskItem'
import { cn, getCategoryEmoji } from '../lib/utils'
import type { Task } from '../types'

type FilterType = 'all' | 'active' | 'completed'

const COIN_REWARD = 10

export default function TasksPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTasks(user.uid, (fetched) => {
      setTasks(fetched)
      setLoading(false)
    })
    return unsub
  }, [user])

  const handleAdd = useCallback(
    async (data: Pick<Task, 'title' | 'description' | 'priority' | 'category'>) => {
      if (!user) return
      await addTask(user.uid, data)
      toast.success('Quest added! 🎯', { duration: 2000 })
    },
    [user]
  )

  const handleToggle = useCallback(
    async (task: Task) => {
      if (!user) return
      const wasCompleted = task.completed

      await toggleTask(task, async () => {
        const { newStreak, streakBonus } = await updateStreakAndCoins(user.uid, COIN_REWARD)
        await refreshProfile()

        // Coins toast
        toast.success(`+${COIN_REWARD} Coins! 🪙`, {
          description: streakBonus > 0
            ? `Streak bonus: +${streakBonus} 🔥 (${newStreak} day streak!)`
            : `Keep it up! 🔥 ${newStreak} day streak`,
          duration: 3500,
        })
      })

      if (!wasCompleted) {
        // XP animation feedback
        toast.success('Task complete! ⚡', { duration: 1500 })
      }
    },
    [user, refreshProfile]
  )

  const handleDelete = useCallback(async (taskId: string) => {
    await deleteTask(taskId)
    toast.info('Task removed', { duration: 1500 })
  }, [])

  // Derive unique categories
  const categories = ['all', ...Array.from(new Set(tasks.map((t) => t.category)))]

  // Filter + search
  const filtered = tasks.filter((t) => {
    if (filter === 'active' && t.completed) return false
    if (filter === 'completed' && !t.completed) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)
  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
              Your Quests
              <motion.span
                className="ml-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                ⚔️
              </motion.span>
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              {activeTasks.length === 0
                ? 'All clear! Add a new quest 🎉'
                : `${activeTasks.length} quest${activeTasks.length !== 1 ? 's' : ''} remaining`}
            </p>
          </div>

          <motion.button
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-glow-sm hover:bg-primaryHover hover:shadow-glow transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Quest</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="flex justify-between text-xs text-textMuted mb-1.5">
              <span>Daily Progress</span>
              <span className="font-medium text-textSecondary">{completionRate}% complete</span>
            </div>
            <div className="h-2 bg-surfaceAlt rounded-full overflow-hidden border border-border/50">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primaryHover rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-textMuted mt-1">
              <span>{completedTasks.length} done</span>
              <span>{tasks.length} total</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: 'Active', value: activeTasks.length, icon: '⚡', color: 'text-primary' },
          { label: 'Done', value: completedTasks.length, icon: '✅', color: 'text-success' },
          { label: 'Coins', value: profile?.coins ?? 0, icon: '🪙', color: 'text-coin' },
        ].map(({ label, value, icon, color }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.03, y: -2 }}
            className="glass rounded-xl p-3 border border-border text-center"
          >
            <span className="text-lg">{icon}</span>
            <motion.p
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn('text-xl font-bold mt-0.5', color)}
            >
              {value}
            </motion.p>
            <p className="text-textMuted text-[11px] uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-3 mb-5"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quests..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary/50 input-glow transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize',
                filter === f
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-textMuted hover:text-textSecondary'
              )}
            >
              {f === 'all' && <Filter className="w-3 h-3" />}
              {f === 'active' && <Circle className="w-3 h-3" />}
              {f === 'completed' && <CheckCircle2 className="w-3 h-3" />}
              {f}
            </motion.button>
          ))}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 capitalize',
                  categoryFilter === cat
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-surface border-border text-textMuted hover:text-textSecondary'
                )}
              >
                {cat === 'all' ? '🔍 All' : `${getCategoryEmoji(cat)} ${cat}`}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="h-16 rounded-xl bg-surfaceAlt border border-border animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-4"
          >
            {search ? '🔍' : filter === 'completed' ? '🏆' : '⚡'}
          </motion.div>
          <p className="text-textSecondary font-medium">
            {search
              ? 'No quests match your search'
              : filter === 'completed'
              ? 'No completed quests yet'
              : 'No quests yet — add one!'}
          </p>
          {!search && filter === 'all' && (
            <motion.button
              onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center gap-2 mx-auto bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Create your first quest
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div className="space-y-2.5" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
