import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, CheckCircle2, Lock, Sparkles, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { purchaseItem } from '../firebase/user'
import { cn, formatNumber } from '../lib/utils'
import type { ShopItem } from '../types'

const SHOP_ITEMS: ShopItem[] = [
  // Themes
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep space vibes with electric blue accents',
    price: 200,
    type: 'theme',
    preview: '#58a6ff',
    colors: { bg: '#060910', surface: '#0d1117', surfaceAlt: '#161b22', border: 'rgba(255,255,255,0.06)', primary: '#58a6ff', primaryHover: '#388bfd', primaryGlow: 'rgba(88,166,255,0.3)', textPrimary: '#e6edf3', textSecondary: '#8b949e', textMuted: '#484f58', success: '#3fb950', danger: '#f85149', warning: '#d29922' },
  },
  {
    id: 'forest',
    name: 'Forest Glow',
    description: 'Fresh emerald tones for a calm focus session',
    price: 200,
    type: 'theme',
    preview: '#4ade80',
  },
  {
    id: 'sunset',
    name: 'Sunset Ember',
    description: 'Warm amber and orange hues to stay energized',
    price: 300,
    type: 'theme',
    preview: '#fb923c',
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Mysterious teal accents from the deep',
    price: 300,
    type: 'theme',
    preview: '#22d3ee',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    description: 'Soft pink elegance for creative minds',
    price: 400,
    type: 'theme',
    preview: '#f472b6',
  },
  // Avatars
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'For those who battle tasks head-on',
    price: 150,
    type: 'avatar',
    preview: '⚔️',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    description: 'Silent. Swift. Productive.',
    price: 150,
    type: 'avatar',
    preview: '🥷',
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    description: 'Reach for the stars in your productivity',
    price: 250,
    type: 'avatar',
    preview: '👨‍🚀',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Cast spells of focus and concentration',
    price: 250,
    type: 'avatar',
    preview: '🧝',
  },
  {
    id: 'dragon',
    name: 'Dragon Lord',
    description: 'Legendary status. For the truly dedicated.',
    price: 500,
    type: 'avatar',
    preview: '🐉',
  },
]

interface PurchaseConfirmProps {
  item: ShopItem
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function PurchaseConfirm({ item, onConfirm, onCancel, loading }: PurchaseConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative glass-heavy rounded-2xl p-6 w-full max-w-sm mx-4 z-10 shadow-glass"
      >
        <div className="text-center">
          <motion.div
            className="text-4xl mb-3"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            {item.type === 'theme'
              ? <span className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: item.preview, boxShadow: `0 0 20px ${item.preview}` }} />
              : item.preview
            }
          </motion.div>
          <h3 className="text-lg font-bold text-textPrimary mt-1">{item.name}</h3>
          <p className="text-textSecondary text-sm mt-1 mb-4">{item.description}</p>
          <div className="flex items-center justify-center gap-1.5 mb-5">
            <span className="text-coin text-lg">🪙</span>
            <span className="text-coin font-bold text-xl">{item.price}</span>
            <span className="text-textMuted text-sm">coins</span>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-textSecondary hover:bg-surfaceAlt transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white shadow-glow-sm hover:bg-primaryHover transition-all disabled:opacity-50"
            >
              {loading ? 'Buying...' : 'Confirm 🛍️'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ShopPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { setTheme } = useTheme()
  const [tab, setTab] = useState<'theme' | 'avatar'>('theme')
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)

  const owned = (id: string, type: 'theme' | 'avatar') => {
    if (type === 'theme') return (profile?.purchasedThemes ?? ['dark']).includes(id)
    return (profile?.purchasedAvatars ?? ['default']).includes(id)
  }

  const isActive = (id: string, type: 'theme' | 'avatar') => {
    if (type === 'theme') return profile?.activeTheme === id
    return profile?.activeAvatar === id
  }

  const handleBuy = async () => {
    if (!confirmItem || !user || !profile) return
    if (profile.coins < confirmItem.price) {
      toast.error('Not enough coins! 😢 Complete more tasks.')
      setConfirmItem(null)
      return
    }
    setBuyingId(confirmItem.id)
    try {
      await purchaseItem(user.uid, confirmItem.id, confirmItem.type, confirmItem.price)
      await refreshProfile()
      if (confirmItem.type === 'theme') {
        await setTheme(confirmItem.id)
      }
      toast.success(`${confirmItem.name} unlocked! 🎉`, {
        description: confirmItem.type === 'theme' ? 'Theme applied!' : 'Avatar equipped!',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed'
      toast.error(msg)
    } finally {
      setBuyingId(null)
      setConfirmItem(null)
    }
  }

  const handleApply = async (item: ShopItem) => {
    if (!user || !profile) return
    if (item.type === 'theme') {
      await setTheme(item.id)
      toast.success(`${item.name} theme applied! ✨`)
    }
  }

  const items = SHOP_ITEMS.filter((i) => i.type === tab)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
              Shop 🛍️
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              Spend your hard-earned coins on exclusive upgrades
            </p>
          </div>
          {/* Coin balance */}
          <motion.div
            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 border border-border"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-lg">🪙</span>
            <motion.span
              key={profile?.coins}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-coin font-bold text-base"
            >
              {formatNumber(profile?.coins ?? 0)}
            </motion.span>
          </motion.div>
        </div>

        {/* Earn hint */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5 text-sm text-textSecondary"
        >
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          Complete tasks to earn coins (+10 per task, bonus on streaks!)
        </motion.div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-6">
        {(['theme', 'avatar'] as const).map((t) => (
          <motion.button
            key={t}
            onClick={() => setTab(t)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize',
              tab === t
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-textMuted hover:text-textSecondary'
            )}
          >
            {t === 'theme' ? '🎨' : '👤'} {t === 'theme' ? 'Themes' : 'Avatars'}
          </motion.button>
        ))}
      </div>

      {/* Items Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const isOwned = owned(item.id, item.type)
            const active = isActive(item.id, item.type)
            const canAfford = (profile?.coins ?? 0) >= item.price

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={cn(
                  'glass rounded-xl border transition-all duration-300',
                  active
                    ? 'border-primary/40 shadow-glow-sm'
                    : isOwned
                    ? 'border-success/30'
                    : 'border-border hover:border-primary/20 hover:shadow-glass'
                )}
              >
                <div className="p-4">
                  {/* Preview */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.type === 'theme' ? (
                      <motion.div
                        className="w-10 h-10 rounded-xl flex-shrink-0 border border-white/10"
                        style={{
                          background: item.preview,
                          boxShadow: `0 0 12px ${item.preview}60`,
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      />
                    ) : (
                      <motion.div
                        className="w-10 h-10 rounded-xl bg-surfaceAlt border border-border flex items-center justify-center text-2xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {item.preview}
                      </motion.div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-textPrimary font-semibold text-sm">{item.name}</p>
                        {active && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-medium"
                          >
                            Active
                          </motion.span>
                        )}
                        {isOwned && !active && (
                          <span className="text-[10px] bg-success/20 text-success border border-success/30 px-1.5 py-0.5 rounded-full font-medium">
                            Owned
                          </span>
                        )}
                      </div>
                      <p className="text-textMuted text-[11px] mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Price + Action */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🪙</span>
                      <span className={cn('text-sm font-bold', canAfford ? 'text-coin' : 'text-textMuted')}>
                        {item.price}
                      </span>
                    </div>

                    {isOwned ? (
                      item.type === 'theme' && !active ? (
                        <motion.button
                          onClick={() => handleApply(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/15 text-success border border-success/25 hover:bg-success/25 transition-all"
                        >
                          Apply ✨
                        </motion.button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {active ? 'In use' : 'Owned'}
                        </div>
                      )
                    ) : (
                      <motion.button
                        onClick={() => setConfirmItem(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!canAfford || buyingId === item.id}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                          canAfford
                            ? 'bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:shadow-glow-sm'
                            : 'bg-surfaceAlt text-textMuted border border-border cursor-not-allowed'
                        )}
                      >
                        {canAfford ? (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Buy
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Need {item.price - (profile?.coins ?? 0)} more
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmItem && (
          <PurchaseConfirm
            item={confirmItem}
            onConfirm={handleBuy}
            onCancel={() => setConfirmItem(null)}
            loading={buyingId === confirmItem.id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
