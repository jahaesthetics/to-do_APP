import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import type { UserProfile } from '../types'
import { getTodayString, getDayDiff } from '../lib/utils'

// ─── Demo mode: localStorage user store ──────────────────────────────────────
const DEMO_PROFILE_KEY = 'fq_demo_profile'

function getDemoProfile(): UserProfile | null {
  try { return JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) ?? 'null') }
  catch { return null }
}

function saveDemoProfile(p: UserProfile) {
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(p))
}
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<UserProfile> {
  const today = getTodayString()
  const profile: UserProfile = {
    uid, email, displayName,
    coins: 0, streak: 0, lastActiveDate: today,
    totalTasksCompleted: 0, level: 1, xp: 0,
    purchasedThemes: ['dark'], activeTheme: 'dark',
    purchasedAvatars: ['default'], activeAvatar: 'default',
    joinedAt: today,
  }

  if (!isFirebaseConfigured || !db) {
    saveDemoProfile(profile)
    return profile
  }

  await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() })
  return profile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) return getDemoProfile()
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function updateStreakAndCoins(
  uid: string,
  coinsToAdd: number
): Promise<{ newCoins: number; newStreak: number; streakBonus: number }> {
  const profile = isFirebaseConfigured && db
    ? await (async () => {
        const snap = await getDoc(doc(db!, 'users', uid))
        if (!snap.exists()) throw new Error('User not found')
        return snap.data() as UserProfile
      })()
    : getDemoProfile()

  if (!profile) throw new Error('Profile not found')

  const today = getTodayString()
  const diff = getDayDiff(profile.lastActiveDate, today)

  let newStreak = profile.streak
  let streakBonus = 0

  if (diff === 0) {
    // same day — no streak change
  } else if (diff === 1) {
    newStreak = profile.streak + 1
    if (newStreak === 7) streakBonus = 50
    else if (newStreak === 30) streakBonus = 100
    else if (newStreak % 7 === 0) streakBonus = 25
  } else {
    newStreak = 1
  }

  const xpGain = coinsToAdd / 2
  const newCoins = profile.coins + coinsToAdd + streakBonus
  const newXP = profile.xp + xpGain + streakBonus / 2
  const newLevel = Math.floor(newXP / 500) + 1

  const updated: UserProfile = {
    ...profile,
    coins: newCoins,
    streak: newStreak,
    lastActiveDate: today,
    totalTasksCompleted: profile.totalTasksCompleted + 1,
    xp: newXP,
    level: newLevel,
  }

  if (!isFirebaseConfigured || !db) {
    saveDemoProfile(updated)
  } else {
    await updateDoc(doc(db, 'users', uid), {
      coins: newCoins, streak: newStreak, lastActiveDate: today,
      totalTasksCompleted: updated.totalTasksCompleted, xp: newXP, level: newLevel,
    })
  }

  return { newCoins, newStreak, streakBonus }
}

export async function purchaseItem(
  uid: string,
  itemId: string,
  itemType: 'theme' | 'avatar',
  price: number
): Promise<void> {
  const profile = isFirebaseConfigured && db
    ? await (async () => {
        const snap = await getDoc(doc(db!, 'users', uid))
        if (!snap.exists()) throw new Error('User not found')
        return snap.data() as UserProfile
      })()
    : getDemoProfile()

  if (!profile) throw new Error('Profile not found')
  if (profile.coins < price) throw new Error('Not enough coins')

  const updated: Partial<UserProfile> = { coins: profile.coins - price }
  if (itemType === 'theme') {
    updated.purchasedThemes = [...new Set([...(profile.purchasedThemes ?? []), itemId])]
  } else {
    updated.purchasedAvatars = [...new Set([...(profile.purchasedAvatars ?? []), itemId])]
  }

  if (!isFirebaseConfigured || !db) {
    saveDemoProfile({ ...profile, ...updated })
    return
  }
  await updateDoc(doc(db, 'users', uid), updated)
}

export async function applyTheme(uid: string, themeId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const p = getDemoProfile()
    if (p) saveDemoProfile({ ...p, activeTheme: themeId })
    return
  }
  await updateDoc(doc(db, 'users', uid), { activeTheme: themeId })
}

export async function applyAvatar(uid: string, avatarId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    const p = getDemoProfile()
    if (p) saveDemoProfile({ ...p, activeAvatar: avatarId })
    return
  }
  await updateDoc(doc(db, 'users', uid), { activeAvatar: avatarId })
}
