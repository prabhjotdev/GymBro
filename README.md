# GymBro – Offline-First PWA Gym Tracker

A mobile-first, offline-capable gym tracker built with React + TypeScript, MUI v5, Redux Toolkit, and Firebase.

## Features

- **Weekly Schedule** – Assign Push / Pull / Legs / Cardio to days of the week
- **Routine Builder** – Predefined exercise library + custom exercises with sets, rep ranges, and rest times
- **Workout Logging** – Strong-style logging with autofill from last session, rest timer, and atomic save
- **Progress Tracking** – Per-exercise history, PR display, and estimated 1RM (Epley formula)
- **Profile & Nutrition** – TDEE estimate and protein range (not medical advice)
- **Offline-first** – Firestore offline persistence; works in airplane mode and syncs when reconnected
- **PWA** – Installable with manifest + service worker (Workbox)
- **Dark mode** – Default dark theme with toggle

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript + Vite |
| Component library | MUI v5 |
| State | Redux Toolkit |
| Backend/DB | Firebase (Firestore + Anonymous Auth) |
| PWA | vite-plugin-pwa (Workbox) |
| CI/CD | GitHub Actions → Firebase Hosting |

---

## Local Development

### 1. Prerequisites

```
Node.js 20+
npm 10+
Firebase project (free Spark plan is sufficient)
```

### 2. Clone and install

```bash
git clone https://github.com/YOUR_ORG/gymbro.git
cd gymbro
npm install
```

### 3. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Enable **Authentication** → Sign-in method → **Anonymous**
3. Enable **Firestore Database** (start in production mode)
4. Register a **Web App** and copy the config values

### 4. Set environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase project values
```

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project and name it "default"
firebase deploy --only firestore:rules
```

### 6. Run locally

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | TypeCheck + production build |
| `npm run typecheck` | TypeScript check without building |
| `npm run lint` | ESLint check (zero warnings) |
| `npm run preview` | Preview production build locally |

---

## Deployment (Firebase Hosting)

### Manual deploy

```bash
npm run build
firebase deploy --only hosting
```

### CI/CD via GitHub Actions

Add the following **GitHub repository secrets**:

| Secret | How to get |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project settings → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase project settings → Web app config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase project settings → Web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase project settings → Web app config |
| `VITE_FIREBASE_APP_ID` | Firebase project settings → Web app config |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project settings → Service accounts → Generate new private key (entire JSON) |

**Workflows:**
- `.github/workflows/ci.yml` — runs on every PR: lint + typecheck + build
- `.github/workflows/deploy.yml` — runs on push to `main`: build + deploy to Firebase Hosting

---

## Data Model

All data is namespaced per user: `users/{uid}/...`

```
users/{uid}/profile             – UserProfile
users/{uid}/exercises/{id}      – Exercise
users/{uid}/routines/{id}       – Routine
users/{uid}/routineExercises/{id} – RoutineExercise
users/{uid}/scheduleTemplate/{id} – ScheduleTemplate (dayOfWeek → routineId)
users/{uid}/workoutSessions/{id} – WorkoutSession
users/{uid}/workoutEntries/{id}  – WorkoutEntry
users/{uid}/setEntries/{id}      – SetEntry
```

Anonymous sign-in is used so each device gets its own per-user namespace without requiring a real login.

---

## Future Improvements

### Adding real login / multi-device sync

1. Enable Google / Apple / Email sign-in in Firebase Auth console
2. Add a `LinkWithRedirect` / `signInWithPopup` flow on the Profile page
3. When the user links accounts, migrate their anonymous UID data to the new UID using a Cloud Function (trigger on `auth.user().onDelete` or a manual migration button)
4. The Firestore security rules already handle any authenticated user — no rules changes needed

### Possible enhancements

- Barbell / dumbbell weight plate calculator
- Volume / tonnage charts (Recharts is already installed)
- Export workout data as CSV
- Share routines between users (add a `public_routines` top-level collection)
- Wearable / HealthKit integration via a React Native wrapper

---

## Security Notes

- Firebase config values (`apiKey`, etc.) are **public by design** — Firestore rules enforce data isolation
- Firestore rules (`firestore.rules`) ensure each user can only access `users/{their-uid}/...`
- No server-side secrets are exposed in the frontend bundle
