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
```

## Run the authenticated scanner

```powershell
npm run scan
```

A visible Chromium window opens. Sign in through the official LEB2 page if needed, then return to the terminal and press Enter. The scanner visits the class list and each `/class/{id}/activity` page, prints a summary, and writes `debug/leb2-scan.json`.

The class selector is validated against the supplied HTML. The activity rows are client-rendered and were not present in the supplied activity HTML, so the scanner must not be considered fully validated until `docs/html-samples/activity-item.sample.html` contains one sanitized rendered activity item and a real authenticated scan extracts it.

## Privacy

Keep `.leb2-profile/` and `debug/` local. Before sharing HTML, remove personal information, cookies, CSRF tokens, JWTs, API keys, and other session credentials. The credentials visible in the pasted HTML should be invalidated by logging out of LEB2 and signing in again.
