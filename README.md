# Gym Genie (Sprint 1)

Expo + React Native gym companion app with:
- Authentication (sign up, log in, log out)
- Profile view/edit
- Protected app routes
- Persistent machine queue flow with Appwrite
- Persistent equipment checkout/condition reporting flow with Appwrite

## Prerequisites

- Node.js 18+
- npm 9+
- Expo Go app (for mobile testing) or iOS Simulator / Android Emulator
- Appwrite Cloud or self-hosted Appwrite project

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variables

Create `.env` in the project root (or copy from `.env.example`):

```bash
cp .env.example .env
```

Set these values:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://<your-appwrite-endpoint>/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
EXPO_PUBLIC_APPWRITE_PROJECT_NAME=Gym Genie
EXPO_PUBLIC_APPWRITE_DATABASE_ID=gym_genie
EXPO_PUBLIC_APPWRITE_MACHINES_COLLECTION_ID=machines
EXPO_PUBLIC_APPWRITE_MACHINE_QUEUE_COLLECTION_ID=machine_queue_entries
EXPO_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID=profiles
EXPO_PUBLIC_APPWRITE_EQUIPMENT_ITEMS_COLLECTION_ID=equipment_items
EXPO_PUBLIC_APPWRITE_EQUIPMENT_CHECKOUTS_COLLECTION_ID=equipment_checkouts
EXPO_PUBLIC_APPWRITE_EQUIPMENT_REPORTS_COLLECTION_ID=equipment_condition_reports
APPWRITE_API_KEY=<server-api-key-for-setup-script>
```

## 3) Appwrite setup (required for auth, profile, queue, and equipment)

In your Appwrite project:
- Create a project
- Add a platform for your target:
  - Web: your local web URL (for Expo web)
  - iOS/Android: your app bundle/package ID
- Enable Email/Password authentication
- Create a server API key with access to Databases

Provision the backend resources:

```bash
npm run setup:backend
```

This script creates:
- Database: `gym_genie`
- Collections: `machines`, `machine_queue_entries`, `equipment_items`, `equipment_checkouts`, `equipment_condition_reports`
- Collection: `profiles`
- Required attributes and indexes
- Seed machine and equipment documents

The setup script is safe to re-run. Existing resources are left in place.

Without valid Appwrite config, auth flows will show a configuration warning and protected flows will not work.

## 4) Run the app

Start development server:

```bash
npm run start
```

Then choose a target from Expo CLI, or run directly:

```bash
npm run ios
npm run android
npm run web
```

## Useful scripts

```bash
npm run test
npm run lint
npm run build
```

## Project structure (Sprint 1)

- `app/` routes (`expo-router`)
- `app/(app)/` protected screens (home/profile/queue/equipment)
- `context/AuthContext.tsx` auth + session state
- `context/GymDataContext.tsx` Appwrite-backed queue/equipment state
- `lib/appwrite.ts` Appwrite client setup and backend IDs
- `lib/gymBackend.ts` queue/equipment database operations and mapping
- `scripts/setup-appwrite-backend.mjs` backend provisioning and seed script
- `components/ui/` reusable UI components

## Notes

- Restart Expo after changing `.env`.
- `APPWRITE_API_KEY` is only for the local setup script. Do not expose it in client builds.
