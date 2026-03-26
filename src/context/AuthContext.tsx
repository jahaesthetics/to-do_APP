import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import { createUserProfile, getUserProfile } from '../firebase/user'
import type { UserProfile } from '../types'
import { getTodayString } from '../lib/utils'

// ─── Demo mode helpers (localStorage) ───────────────────────────────────────
const DEMO_USER_KEY = 'fq_demo_user'
const DEMO_PROFILE_KEY = 'fq_demo_profile'

function getDemoUser(): User | null {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getDemoProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveDemoUser(u: User | null) {
  if (u) localStorage.setItem(DEMO_USER_KEY, JSON.stringify(u))
  else localStorage.removeItem(DEMO_USER_KEY)
}

function saveDemoProfile(p: UserProfile | null) {
  if (p) localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(p))
  else localStorage.removeItem(DEMO_PROFILE_KEY)
}

function makeDemoUser(uid: string, email: string, displayName: string): User {
  return { uid, email, displayName } as unknown as User
}

function makeDemoProfile(uid: string, email: string, displayName: string): UserProfile {
  const today = getTodayString()
  return {
    uid, email, displayName,
    coins: 0, streak: 0, lastActiveDate: today,
    totalTasksCompleted: 0, level: 1, xp: 0,
    purchasedThemes: ['dark'], activeTheme: 'dark',
    purchasedAvatars: ['default'], activeAvatar: 'default',
    joinedAt: today,
  }
}
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  register: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    if (!isFirebaseConfigured) {
      const p = getDemoProfile()
      setProfile(p)
      return
    }
    const p = await getUserProfile(user.uid)
    setProfile(p)
  }, [user])

  useEffect(() => {
    // ── Demo mode ──────────────────────────────────────────────────────────
    if (!isFirebaseConfigured) {
      const demoUser = getDemoUser()
      const demoProfile = demoUser ? getDemoProfile() : null
      setUser(demoUser)
      setProfile(demoProfile)
      setLoading(false)
      return
    }

    // ── Firebase mode ──────────────────────────────────────────────────────
    if (!auth) { setLoading(false); return }

    const timeout = setTimeout(() => setLoading(false), 4000)
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout)
      setUser(firebaseUser)
      if (firebaseUser) {
        let p = await getUserProfile(firebaseUser.uid)
        if (!p) {
          p = await createUserProfile(
            firebaseUser.uid,
            firebaseUser.email ?? '',
            firebaseUser.displayName ?? 'Explorer'
          )
        }
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => { clearTimeout(timeout); unsub() }
  }, [])

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
      const uid = 'demo_' + Date.now()
      const u = makeDemoUser(uid, email, displayName)
      const p = makeDemoProfile(uid, email, displayName)
      saveDemoUser(u)
      saveDemoProfile(p)
      setUser(u)
      setProfile(p)
      return
    }
    if (!auth) throw new Error('Auth not initialized')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    const p = await createUserProfile(cred.user.uid, email, displayName)
    setProfile(p)
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const stored = getDemoUser()
      if (stored && stored.email === email) {
        setUser(stored)
        setProfile(getDemoProfile())
        return
      }
      // Auto-create demo account on first login
      const uid = 'demo_' + Date.now()
      const u = makeDemoUser(uid, email, email.split('@')[0])
      const p = makeDemoProfile(uid, email, email.split('@')[0])
      saveDemoUser(u)
      saveDemoProfile(p)
      setUser(u)
      setProfile(p)
      return
    }
    if (!auth) throw new Error('Auth not initialized')
    await signInWithEmailAndPassword(auth, email, password)
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (!isFirebaseConfigured) {
      saveDemoUser(null)
      saveDemoProfile(null)
      setUser(null)
      setProfile(null)
      return
    }
    if (!auth) return
    await signOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
