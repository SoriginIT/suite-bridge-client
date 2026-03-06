# Suite Bridge

**Suite Bridge** is an admin web app for managing and monitoring **enterprise data sync**. Admins sign in, see a list of synced searches (registry), start or stop syncs, view progress and status, and run batch syncs—all through a simple dashboard.

---

## Project overview

### What is Suite Bridge?

Suite Bridge connects to a backend API that performs data syncing. The frontend gives administrators:

- **A single place** to see all synced searches (the “registry”) and their last sync time and status.
- **One-click actions** to run a normal sync or a “hard” sync for a search, or to sync all searches at once.
- **Live progress** when a sync is running (percentage, records processed, and the option to stop it).
- **Clear feedback** when something is already running (so you don’t start a second sync by mistake) and when something fails.

The app does not store your data; it talks to your backend (Node + Express) at a URL you configure. All sync logic and data live on the server.

### Who is it for?

- **Admins** who need to trigger syncs, check status, and see what’s running.
- **Developers** who integrate with the sync API and work on the frontend codebase.

---

## What’s implemented (documentation)

This section describes what the app does today, in plain language and with a bit of technical detail.

### 1. Login

- **What you see:** A login page with username and password.
- **What it does:** You enter credentials and click “Sign in.” If they match the configured values, you are taken to the dashboard. If not, you see an error message.
- **Technical note:** Credentials are currently hardcoded in the app (for development). In production you would replace this with real authentication (e.g. your backend login API).

### 2. Dashboard (Home)

- **What you see:** A home screen with a short overview: how many synced searches exist and a “Sync all” button.
- **What it does:** Shows the total number of entries in the sync registry. “Sync all” starts a batch sync of all registered searches on the backend. You can jump to the full registry from here.
- **Technical note:** The page loads the registry from the API to show the count. “Sync all” calls the backend batch endpoint.

### 3. Entities (registry and sync actions)

- **What you see:** A table listing all “synced searches” (each row is one search): its ID, table name, last sync time, status, record counts, and action buttons.
- **What it does:**
  - **Sync:** Starts a normal sync for that search. You see a progress panel and can stop it if needed.
  - **Hard sync:** Starts a hard sync for that search (same progress/stop behavior).
  - **Status:** Opens a side panel with detailed status for that search (last sync, last hard sync, record count, etc.).
  - **Drop:** Asks for confirmation, then removes that search from the backend (table and config). The row disappears from the list after a refresh.
  - **Sync all:** Same as on the dashboard—starts a batch sync for every search in the registry.
- **Technical note:** The table is filled by the registry API. Each action calls the corresponding backend endpoint (start sync, hard sync, status by search, drop, run batch). If a sync is already running, starting another shows a “Sync already in progress” message and lets you view that run’s progress.

### 4. Sync in progress (banner and progress panel)

- **What you see:** When a sync is running, a banner appears at the top of the dashboard area with “Sync in progress” and the sync ID. A progress panel shows percentage, records processed, and a “Stop” button.
- **What it does:** The app polls the backend every few seconds for that sync’s status. When the sync finishes (or is stopped), the panel shows the final result (success, failed, or stopped) and how long it took. You can close the panel when done.
- **Technical note:** The current sync ID and status are kept in app-wide state (SyncContext) so the banner and panel appear on any page (Dashboard or Entities). Stopping a sync calls the backend stop endpoint.

### 5. Logs

- **What you see:** A “Logs” page with a short message.
- **What it does:** Placeholder for sync and activity history. It can show the last sync result if one just completed. Full log history will depend on a backend endpoint that returns past sync runs.
- **Technical note:** Ready for a future API that returns a list of sync runs (time, status, errors, etc.).

### 6. Settings

- **What you see:** A simple “Settings” page.
- **What it does:** Placeholder for app or sync configuration. You can add options here later (e.g. API URL, scheduler info) when the backend supports them.
- **Technical note:** No backend calls yet; structure is in place for future settings.

### 7. Logout

- **What you see:** A profile (user) icon in the top bar. Clicking it opens a “Logout” dialog: “Are you sure you want to logout?”
- **What it does:** “Yes” takes you back to the login page. “No” closes the dialog.
- **Technical note:** Logout only clears the current screen (navigates to login). Session or token handling can be added when you connect to a real auth API.

---

## Technology (for developers)

- **React 19** and **Vite 7** for the UI and build.
- **Tailwind CSS** for styling.
- **React Router** for navigation (login, dashboard, entities, logs, settings).
- **Axios** for HTTP requests to your backend.
- **react-icons** (Font Awesome) for icons.
- **react-hot-toast** for success and error messages.

### API base URL

The app calls your backend at a base URL you set in a `.env` file:

- **Base URL:** `http://localhost:8000/api/v1` (or your server’s URL).
- **Sync routes** are under that base, e.g.:
  - Registry: `GET .../sync/registry`
  - Start sync: `POST .../sync` with `{ searchId }`
  - Status: `GET .../sync/status/:syncId`
  - And others as listed in the code (see `src/services/syncApi.js`).

Only variables starting with `VITE_` are available in the browser. The app reads `VITE_API_BASE_URL` and uses it for all API calls.

### Folder structure

```
src/
├── components/       Reusable UI (Modal, layout, sync banner/panel, etc.)
├── config/           App config (config.js – reads env like API base URL)
├── context/          React context (e.g. SyncContext for sync state)
├── hooks/            Custom React hooks (for future use)
├── pages/            Screens (login, home, entities, logs, settings)
├── routes/           Route definitions (AppRoutes.jsx)
├── services/         API clients (api.js, syncApi.js)
├── utils/            Helper functions (for future use)
├── App.jsx
├── main.jsx
└── index.css
```

### Environment variables

- Create a `.env` file in the project root (it is not committed to Git).
- Set at least:
  - `VITE_API_BASE_URL=http://localhost:8000/api/v1`  
  (Use your real backend URL in production.)

---

## How to run the project

1. **Install dependencies (once)**  
   From the project root:  
   `npm install`

2. **Start the development server**  
   `npm run dev`  
   Open the URL shown (e.g. http://localhost:5173).

3. **Log in**  
   Use the configured username and password (see the login screen or code for the default dev credentials).

4. **Production build**  
   `npm run build`  
   Output is in the `dist` folder.  
   `npm run preview` runs a local preview of the built app.

---

## Summary

Suite Bridge is the admin interface for your sync backend. It provides login, a dashboard, a registry of synced searches with Sync / Hard sync / Status / Drop and “Sync all,” live progress and stop, and placeholders for logs and settings. Configuration is done via `.env` (e.g. `VITE_API_BASE_URL`). This README is updated as features are added so both technical and non-technical readers can understand what the project does and what’s implemented.
