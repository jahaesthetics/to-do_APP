import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, getCategoryEmoji, getPriorityColor } from '../../lib/utils'
import type { Task } from '../../types'

interface Props {
  task: Task
  onToggle: (task: Task) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  index: number
}

// Animated checkmark SVG
function CheckmarkIcon({ checked }: { checked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={checked ? 'currentColor' : 'currentColor'}
        strokeWidth="1.5"
        className={checked ? 'text-primary' : 'text-textMuted'}
        fill={checked ? 'currentColor' : 'none'}
        style={{ fillOpacity: checked ? 0.15 : 0 }}
      />
      <AnimatePresence>
        {checked && (
          <motion.path
            d="M8 12l3 3 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </svg>
  )
}

export default function TaskItem({ task, onToggle, onDelete, index }: Props) {
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleToggle = async () => {
    if (toggling) return
    setToggling(true)
    try {
      await onToggle(task)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setDeleting(false)
    }
  }

  const priorityColor = getPriorityColor(task.priority)
  const categoryEmoji = getCategoryEmoji(task.category)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{
        layout: { type: 'spring', stiffness: 400, damping: 30 },
        default: { delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      className={cn(
        'group glass rounded-xl border transition-all duration-300',
        task.completed
          ? 'border-border/50 opacity-60'
          : 'border-border hover:border-primary/20 hover:shadow-glass hover:scale-[1.005]'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            onClick={handleToggle}
            disabled={toggling}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="w-5 h-5 flex-shrink-0 mt-0.5 disabled:cursor-wait"
          >
            <CheckmarkIcon checked={task.completed} />
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {/* Priority dot + title */}
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                    style={{ background: priorityColor }}
                    animate={!task.completed ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium task-strikethrough transition-all duration-300',
                      task.completed
                        ? 'text-textMuted line-through done'
                        : 'text-textPrimary'
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-textMuted bg-surfaceAlt px-2 py-0.5 rounded-md border border-border/50">
                    {categoryEmoji} {task.category}
                  </span>
                  <span className={cn('text-[11px] font-medium capitalize')} style={{ color: priorityColor }}>
                    {task.priority}
                  </span>
                  {task.completed && task.completedAt && (
                    <span className="text-[11px] text-success">
                      ✅ Done
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {task.description && (
                  <motion.button
                    onClick={() => setExpanded(!expanded)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-textMuted hover:text-textSecondary hover:bg-surfaceAlt transition-all"
                  >
                    {expanded
                      ? <ChevronUp className="w-3.5 h-3.5" />
                      : <ChevronDown className="w-3.5 h-3.5" />
                    }
                  </motion.button>
                )}
                <motion.button
                  onClick={handleDelete}
                  disabled={deleting}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-textMuted hover:text-danger hover:bg-danger/10 transition-all"
                >
                  {deleting
                    ? <motion.div
                        className="w-3.5 h-3.5 border-2 border-danger/30 border-t-danger rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                      />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && task.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-2 ml-8 text-xs text-textSecondary bg-surfaceAlt rounded-lg p-3 border border-border/50 leading-relaxed">
                {task.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
