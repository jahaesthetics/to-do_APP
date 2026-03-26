import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, AlignLeft, Tag, AlertTriangle } from 'lucide-react'
import { cn, getCategoryEmoji } from '../../lib/utils'
import type { Task } from '../../types'

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Creative', 'Social', 'Finance', 'Other']
const PRIORITIES: Array<{ value: Task['priority']; label: string; color: string; dot: string }> = [
  { value: 'low', label: 'Low', color: 'text-green-400', dot: 'bg-green-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { value: 'high', label: 'High', color: 'text-red-400', dot: 'bg-red-400' },
]

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (data: Pick<Task, 'title' | 'description' | 'priority' | 'category'>) => Promise<void>
}

export default function AddTaskModal({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [category, setCategory] = useState('Work')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setCategory('Work')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task title is required')
      return
    }
    setLoading(true)
    try {
      await onAdd({ title: title.trim(), description: description.trim(), priority, category: category.toLowerCase() })
      reset()
      onClose()
    } catch {
      setError('Failed to add task. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full sm:max-w-lg glass-heavy rounded-t-2xl sm:rounded-2xl shadow-glass p-6 mx-0 sm:mx-4 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">New Quest</h2>
                <p className="text-textMuted text-xs mt-0.5">Complete it to earn 🪙 coins</p>
              </div>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-8 h-8 rounded-lg bg-surfaceAlt border border-border flex items-center justify-center text-textMuted hover:text-textPrimary transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <div className="relative">
                  <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError('') }}
                    placeholder="What needs to be done?"
                    className={cn(
                      'w-full bg-surfaceAlt border rounded-xl pl-10 pr-4 py-3 text-sm text-textPrimary',
                      'placeholder:text-textMuted transition-all duration-200',
                      'focus:outline-none focus:border-primary/50 input-glow',
                      error ? 'border-danger/50' : 'border-border'
                    )}
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-danger text-xs mt-1.5"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Description */}
              <div className="relative">
                <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-textMuted" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details (optional)"
                  rows={2}
                  className="w-full bg-surfaceAlt border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-textPrimary placeholder:text-textMuted resize-none focus:outline-none focus:border-primary/50 input-glow transition-all duration-200"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-textMuted uppercase tracking-wider mb-2 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <motion.button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200',
                        priority === p.value
                          ? `bg-surfaceAlt border-current ${p.color} shadow-sm`
                          : 'bg-surfaceAlt border-border text-textMuted hover:border-border/80 hover:text-textSecondary'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', p.dot)} />
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-textMuted uppercase tracking-wider mb-2 block">
                  <Tag className="inline w-3 h-3 mr-1" />
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                        category === cat
                          ? 'bg-primary/15 border-primary/30 text-primary'
                          : 'bg-surfaceAlt border-border text-textMuted hover:text-textSecondary'
                      )}
                    >
                      {getCategoryEmoji(cat)} {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-textSecondary hover:bg-surfaceAlt transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white shadow-glow-sm hover:bg-primaryHover hover:shadow-glow transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Task ✨'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
