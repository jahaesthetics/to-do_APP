import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import type { Task } from '../types'

// ─── Demo mode: localStorage task store ──────────────────────────────────────
const DEMO_TASKS_KEY = 'fq_demo_tasks'

function getDemoTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem(DEMO_TASKS_KEY) ?? '[]') }
  catch { return [] }
}

function saveDemoTasks(tasks: Task[]) {
  localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks))
}

// Listeners for demo mode real-time updates
const demoListeners = new Set<(tasks: Task[]) => void>()

function notifyDemoListeners() {
  const tasks = getDemoTasks()
  demoListeners.forEach(fn => fn(tasks))
}
// ─────────────────────────────────────────────────────────────────────────────

export async function addTask(
  userId: string,
  data: Pick<Task, 'title' | 'description' | 'priority' | 'category'>
): Promise<Task> {
  const now = new Date().toISOString()

  if (!isFirebaseConfigured || !db) {
    const task: Task = {
      id: 'task_' + Date.now(),
      ...data,
      completed: false,
      userId,
      createdAt: now,
    }
    saveDemoTasks([task, ...getDemoTasks()])
    notifyDemoListeners()
    return task
  }

  const taskData = {
    ...data,
    completed: false,
    userId,
    createdAt: now,
    serverTimestamp: serverTimestamp(),
  }
  const ref = await addDoc(collection(db, 'tasks'), taskData)
  return { id: ref.id, ...taskData } as Task
}

export async function toggleTask(
  task: Task,
  onComplete: (taskId: string) => Promise<void>
): Promise<void> {
  const newCompleted = !task.completed
  const now = new Date().toISOString()

  if (!isFirebaseConfigured || !db) {
    const tasks = getDemoTasks().map(t =>
      t.id === task.id ? { ...t, completed: newCompleted, completedAt: newCompleted ? now : undefined } : t
    )
    saveDemoTasks(tasks)
    notifyDemoListeners()
    if (newCompleted) await onComplete(task.id)
    return
  }

  await updateDoc(doc(db, 'tasks', task.id), {
    completed: newCompleted,
    completedAt: newCompleted ? now : null,
  })
  if (newCompleted) await onComplete(task.id)
}

export async function deleteTask(taskId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    saveDemoTasks(getDemoTasks().filter(t => t.id !== taskId))
    notifyDemoListeners()
    return
  }
  await deleteDoc(doc(db, 'tasks', taskId))
}

export async function updateTask(
  taskId: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'category'>>
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    saveDemoTasks(getDemoTasks().map(t => t.id === taskId ? { ...t, ...data } : t))
    notifyDemoListeners()
    return
  }
  await updateDoc(doc(db, 'tasks', taskId), data)
}

export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    demoListeners.add(callback)
    // Immediately emit current state
    callback(getDemoTasks().filter(t => t.userId === userId))
    return () => { demoListeners.delete(callback) }
  }

  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
    callback(tasks)
  })
}

export async function getTasksForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Task[]> {
  if (!isFirebaseConfigured || !db) {
    return getDemoTasks().filter(t =>
      t.userId === userId &&
      t.createdAt >= startDate &&
      t.createdAt <= endDate
    )
  }
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    where('createdAt', '>=', startDate),
    where('createdAt', '<=', endDate),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
}
