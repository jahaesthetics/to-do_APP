import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Zap, Eye, EyeOff, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    displayName?: string
    email?: string
    password?: string
  }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!displayName.trim()) e.displayName = t('auth.err_name_req')
    else if (displayName.length < 2) e.displayName = t('auth.err_name_min')
    if (!email) e.email = t('auth.err_email_req')
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('auth.err_email_inv')
    if (!password) e.password = t('auth.err_pass_req')
    else if (password.length < 6) e.password = t('auth.err_pass_min')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(email, password, displayName)
      toast.success(t('auth.toast_welcome_new', { name: displayName }))
      navigate('/tasks')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (msg.includes('email-already-in-use')) {
        toast.error(t('auth.toast_err_email_in_use'))
      } else {
        toast.error(t('auth.toast_err_register_generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  const perks = [
    { icon: '⚡', text: t('auth.perk_coins') },
    { icon: '🔥', text: t('auth.perk_streaks') },
    { icon: '🏆', text: t('auth.perk_level') },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg">
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md px-4"
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 animate-pulse-glow">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
            Focus<span className="text-primary">Quest</span>
          </h1>
          <p className="text-textSecondary text-sm mt-1">{t('app.logo_sub_register')}</p>
        </motion.div>

        {/* Perks */}
        <motion.div
          className="flex gap-3 mb-6 justify-center flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {perks.map((perk, i) => (
            <motion.div
              key={perk.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-xs text-textSecondary"
            >
              <span>{perk.icon}</span>
              <span>{perk.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass rounded-2xl p-8 shadow-glass"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-textPrimary">{t('auth.register_title')}</h2>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-textMuted text-sm mb-6">{t('auth.register_subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">
                {t('auth.name_label')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className={cn(
                    'w-full bg-surfaceAlt border rounded-xl pl-10 pr-4 py-3 text-sm text-textPrimary',
                    'placeholder:text-textMuted transition-all duration-200',
                    'focus:outline-none focus:border-primary/50 input-glow',
                    errors.displayName ? 'border-danger/50' : 'border-border'
                  )}
                />
              </div>
              {errors.displayName && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-danger text-xs mt-1.5"
                >
                  {errors.displayName}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">
                {t('auth.email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  className={cn(
                    'w-full bg-surfaceAlt border rounded-xl pl-10 pr-4 py-3 text-sm text-textPrimary',
                    'placeholder:text-textMuted transition-all duration-200',
                    'focus:outline-none focus:border-primary/50 input-glow',
                    errors.email ? 'border-danger/50' : 'border-border'
                  )}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-danger text-xs mt-1.5"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.register_password_placeholder')}
                  className={cn(
                    'w-full bg-surfaceAlt border rounded-xl pl-10 pr-10 py-3 text-sm text-textPrimary',
                    'placeholder:text-textMuted transition-all duration-200',
                    'focus:outline-none focus:border-primary/50 input-glow',
                    errors.password ? 'border-danger/50' : 'border-border'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-danger text-xs mt-1.5"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mt-2',
                'bg-primary text-white shadow-glow-sm hover:bg-primaryHover hover:shadow-glow',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {t('auth.creating_account')}
                </span>
              ) : (
                t('auth.begin_quest_button')
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.p
          className="text-center text-textMuted text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t('auth.already_on_quest')} 
          <Link
            to="/login"
            className="text-primary font-medium hover:text-primaryHover transition-colors"
          >
            {t('auth.signin_link')}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
