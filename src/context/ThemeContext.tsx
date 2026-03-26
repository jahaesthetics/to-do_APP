import React, { createContext, useContext, useEffect, useState } from 'react'
import { applyTheme } from '../firebase/user'
import { useAuth } from './AuthContext'

interface ThemeContextValue {
  theme: string
  setTheme: (themeId: string, save?: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [theme, setThemeState] = useState('dark')

  // Sync with user profile on mount/change
  useEffect(() => {
    if (profile?.activeTheme) {
      applyThemeToDOM(profile.activeTheme)
      setThemeState(profile.activeTheme)
    }
  }, [profile?.activeTheme])

  const setTheme = async (themeId: string, save = true) => {
    applyThemeToDOM(themeId)
    setThemeState(themeId)
    if (save && user) {
      await applyTheme(user.uid, themeId)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyThemeToDOM(themeId: string) {
  document.documentElement.setAttribute('data-theme', themeId)
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
