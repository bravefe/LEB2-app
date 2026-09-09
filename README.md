# LEB2 Work Checker

Step 1 currently contains a Playwright scanner proof of concept. It uses a persistent Chromium profile so the LEB2 password is never stored by this project.

## Setup

```powershell
npm install
npx playwright install chromium
```

## Validate the supplied class HTML

```powershell
npm run test:selectors
npm run test:database
```

## Run the authenticated scanner

```powershell
npm run scan
```

A visible Chromium window opens. Sign in through the official LEB2 page if needed. The scanner waits for the class cards after the sign-in redirect, visits the class list and each `/class/{id}/activity` page, prints a summary, writes `debug/leb2-scan.json`, and stores the scan in `.data/leb2.sqlite`.

You can provide alternate output paths:

```powershell
npm run scan -- debug/custom-scan.json .data/custom.sqlite
```

The database test uses an in-memory SQLite database and confirms that repeated scans upsert existing courses and assignments.

## Desktop build

```powershell
npm run build
npm start
```

The renderer is built with Vite and the Electron main process is emitted to `dist-electron/electron/`. The desktop window uses the same persistent Playwright login flow and local SQLite database.

The class and activity selectors are validated against the supplied sanitized HTML fixtures. A real authenticated scan is still required to confirm the live seven-class session and any live layout differences.

## Privacy

Keep `.leb2-profile/` and `debug/` local. Before sharing HTML, remove personal information, cookies, CSRF tokens, JWTs, API keys, and other session credentials. The credentials visible in the pasted HTML should be invalidated by logging out of LEB2 and signing in again.
