import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// 🔑 Replace with your Firebase project credentials
// https://console.firebase.google.com → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDH4_FVABYqZRd0aL-IwACm-woXHA8zQQ8",
  authDomain: "to-do-app-88caa.firebaseapp.com",
  projectId: "to-do-app-88caa",
  storageBucket: "to-do-app-88caa.firebasestorage.app",
  messagingSenderId: "1012107791324",
  appId: "1:1012107791324:web:8cf98cb79024f198f8dd19",
  measurementId: "G-N9J46HFTWB"
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
)

let app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    _auth = getAuth(app)
    _db = getFirestore(app)
  } catch (e) {
    console.warn('[FocusQuest] Firebase init failed — running in demo mode.', e)
  }
}

export const auth = _auth
export const db = _db
export default app
