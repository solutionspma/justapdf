# Worklog + Connections (Commit/Deploy)

This document summarizes the current system wiring, connections, and deployment notes
for committing and deploying changes, including API key handling.

## Project Type

- Static Vanilla JS frontend in `public/`
- Netlify Functions backend in `netlify/functions/`
- Firebase Auth + Firestore + Storage
- No frameworks, no bundlers, no build step

## Frontend Connections

### Entry + Routing

- `public/src/main.js` initializes app, listens to auth changes, and renders routes.
- `public/src/app.js` handles simple client-side route rendering via `render(path)`.
- Netlify redirect (`netlify.toml`) routes all paths to `public/index.html`.

### Firebase Client

- `public/src/firebase.js` initializes Firebase using `firebaseConfig` from `public/src/config.js`.
- Auth persistence uses `browserLocalPersistence`.
- Storage and Firestore use Firebase SDK (no fetch/XHR uploads).

### Firebase Config

- `public/src/config.js` reads config from `window.__ENV__` (if present), with defaults.
- No `import.meta.env` usage.
- Expected keys for static injection:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_MEASUREMENT_ID` (optional)

## Backend Connections

### Netlify Function

- `netlify/functions/api.js` provides the API entrypoint (Express wrapped by `serverless-http`).
- `/api/*` routes are mapped to the function via `netlify.toml`.

### Database + Storage Helpers

- `backend/database/connection.js` bootstraps Firebase Admin (if env vars present).
- Provides `db` and `storage` helpers for server-side operations.
- Requires the following env vars for Firebase Admin:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_STORAGE_BUCKET`
  - or `FIREBASE_SERVICE_ACCOUNT_JSON`

## Firebase Rules Deployment

Rules are stored in:
- `firestore.rules`
- `storage.rules`

Firebase CLI deployment (example):

```
npx firebase-tools deploy --project justapdf-b0f05 --only firestore:rules,storage
```

## Auth + Upload Flow (Current)

- User signs in with Firebase Auth.
- Upload uses Firebase Storage SDK:
  - `ref()`
  - `uploadBytesResumable()`
  - `getDownloadURL()` for preview
- Storage path:
  - `uploads/users/{uid}/original/{uuid}/{filename}.pdf`

## Netlify Deployment

Deploy command:

```
npx netlify deploy --prod
```

Deploy paths (from `netlify.toml`):
- `public/` for static assets
- `netlify/functions/` for serverless functions

## API Keys / Env Vars (Netlify)

Set via CLI (production context):

```
npx netlify env:set FIREBASE_API_KEY "<value>" --context production
npx netlify env:set FIREBASE_AUTH_DOMAIN "<value>" --context production
npx netlify env:set FIREBASE_PROJECT_ID "<value>" --context production
npx netlify env:set FIREBASE_STORAGE_BUCKET "<value>" --context production
npx netlify env:set FIREBASE_MESSAGING_SENDER_ID "<value>" --context production
npx netlify env:set FIREBASE_APP_ID "<value>" --context production
npx netlify env:set FIREBASE_MEASUREMENT_ID "<value>" --context production
```

Admin SDK (server-side) keys:

```
npx netlify env:set FIREBASE_CLIENT_EMAIL "<value>" --context production
npx netlify env:set FIREBASE_PRIVATE_KEY "<value>" --context production
npx netlify env:set FIREBASE_SERVICE_ACCOUNT_JSON "<value>" --context production
```

Note: Use either `FIREBASE_SERVICE_ACCOUNT_JSON` or the triplet
`FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`.

## Commit + Push

Example commit:

```
git add <files>
git commit -m "wire core operation registry, pricing, editor execution, and admin access"
git push origin main
```

## Known Constraints

- No new frameworks or build systems.
- Keep all operations real; no placeholders.
- Netlify functions must stay compatible with Node 18.
