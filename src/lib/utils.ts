import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00')
  const b = new Date(dateB + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function getLevelFromXP(xp: number): number {
  // Every 500 XP = 1 level
  return Math.floor(xp / 500) + 1
}

export function getXPToNextLevel(xp: number): { current: number; needed: number } {
  const current = xp % 500
  return { current, needed: 500 }
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high': return '#f87171'
    case 'medium': return '#fbbf24'
    case 'low': return '#4ade80'
  }
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    work: '💼',
    personal: '🌱',
    health: '💪',
    learning: '📚',
    creative: '🎨',
    social: '👥',
    finance: '💰',
    other: '⚡',
  }
  return map[category.toLowerCase()] ?? '⚡'
}
