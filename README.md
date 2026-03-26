# ⚡ FocusQuest

A gamified productivity web app — Notion meets Habit Tracker. Turn your tasks into quests, earn coins, build streaks, and level up.

## Tech Stack

- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS** — custom CSS variable theming
- **Framer Motion** — fluid micro-interactions
- **Sonner** — elegant toast notifications
- **Recharts** — styled activity charts
- **Firebase** (Auth + Firestore)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Email/Password** Authentication
4. Create a **Firestore** database (start in test mode)
5. Copy your config into `src/firebase/config.ts`:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
}
```

### 3. Set up Firestore rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email/password login & registration with validation |
| ✅ Tasks | Add, complete, delete with animated checkmark |
| 🔥 Streaks | Auto-calculated daily streak with milestone bonuses |
| 🪙 Coins | +10 per task, +50 at 7-day streak, +100 at 30-day |
| 🏆 Levels | XP system — 500 XP per level |
| 📊 Dashboard | Weekly bar chart, category breakdown, stat cards |
| 🎨 Themes | 6 themes — Dark, Midnight, Forest, Sunset, Ocean, Rose |
| 👤 Avatars | 5 purchasable avatars shown in sidebar |
| 🛍️ Shop | Glass-card shop with purchase confirmation flow |
| 📱 Responsive | Mobile sidebar with slide-in drawer |

## Project Structure

```
src/
├── firebase/
│   ├── config.ts       # Firebase initialization
│   ├── tasks.ts        # Task CRUD + real-time listener
│   └── user.ts         # Profile, streak, coins, shop
├── context/
│   ├── AuthContext.tsx  # Global auth state
│   └── ThemeContext.tsx # CSS variable theme switcher
├── components/
│   ├── layout/
│   │   ├── Layout.tsx   # Protected route wrapper + Toaster
│   │   └── Sidebar.tsx  # Navigation + animated stats
│   └── tasks/
│       ├── TaskItem.tsx  # Animated task row
│       └── AddTaskModal.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── TasksPage.tsx
│   ├── DashboardPage.tsx
│   └── ShopPage.tsx
├── lib/utils.ts         # cn(), date helpers, formatters
└── types/index.ts       # All TypeScript interfaces
```
