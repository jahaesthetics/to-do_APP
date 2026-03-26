export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: string // ISO string
  completedAt?: string
  userId: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  coins: number
  streak: number
  lastActiveDate: string // YYYY-MM-DD local
  totalTasksCompleted: number
  level: number
  xp: number
  purchasedThemes: string[]
  activeTheme: string
  purchasedAvatars: string[]
  activeAvatar: string
  joinedAt: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'theme' | 'avatar'
  preview: string // color or emoji
  colors?: ThemeColors
}

export interface ThemeColors {
  bg: string
  surface: string
  surfaceAlt: string
  border: string
  primary: string
  primaryHover: string
  primaryGlow: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  success: string
  danger: string
  warning: string
}

export interface DailyStats {
  date: string
  completed: number
  added: number
}
