import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿', short: 'UZ' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => i18n.language.startsWith(l.code)) ?? LANGUAGES[0]

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('i18n-lang', code)
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-1.5">
      {/* Dropdown — opens upward */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{
              background: 'rgba(15,15,20,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language.startsWith(lang.code)
              return (
                <motion.button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  whileHover={{ backgroundColor: 'rgba(168,85,247,0.12)' }}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary font-semibold'
                      : 'text-white/70 hover:text-white',
                  ].join(' ')}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="flex-1 text-left text-xs font-medium">{lang.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeLangDot"
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill trigger */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-colors hover:border-primary/40"
        style={{
          background: 'rgba(15,15,20,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        aria-label="Switch language"
      >
        <Globe className="w-3.5 h-3.5 text-white/40" />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold text-white/80">{current.short}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-[10px] leading-none"
        >
          ▲
        </motion.span>
      </motion.button>
    </div>
  )
}
