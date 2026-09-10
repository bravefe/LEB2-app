# prompt.md

## Project: LEB2 Unfinished Schoolwork Checker for Windows

Build a Windows desktop app that checks my LEB2 classes and shows any schoolwork that is unfinished, overdue, or due soon.

The app must work with LEB2 class pages such as:

- `https://app.leb2.org/class`
- `https://app.leb2.org/class/1583085/activity`

The app should visit the class list page, find every class, open each class’s activity page, read assignment/activity information, and show work that has not been completed.

LEB2 class cards may not link directly to the activity page. For example, a class card can expose this access URL:

```text
https://app.leb2.org/class/1582970/checkAfterAccessClass
```

The scanner must extract the numeric class ID from the card and construct the activity URL directly:

```text
https://app.leb2.org/class/1582970/activity
```

It must not treat `checkAfterAccessClass` as the activity URL or depend on the intermediate access endpoint redirecting correctly.

## Main goal

Create a clean Windows desktop application where I can:

- Sign in to LEB2 through the official website.
- Scan all of my classes automatically.
- Find assignments, quizzes, activities, and other schoolwork.
- Detect whether each item is unfinished, submitted, completed, overdue, or due soon.
- Receive Windows notifications for upcoming or overdue work.
- Open the original activity page in LEB2 when I click an assignment.

## Required technology

Use this stack:

- **Desktop framework:** Electron
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **Browser/page scanning:** Playwright
- **Local database:** SQLite
- **Database library:** better-sqlite3 or Prisma with SQLite
- **Notifications:** Electron/Windows native notifications
- **Build tool:** Vite
- **Package manager:** npm

Do not store the user’s LEB2 password directly. Use a persistent Playwright browser profile or secure session/cookie storage so the user signs in through the real LEB2 login page.

---

# Step-by-step development plan

## Step 1: Get and validate LEB2 page information first

Do not start building the full app until the page structure has been tested.

### Step 1.1: Ask for page HTML

Ask me to provide the HTML structure from these pages after I log in:

- The class list page: `https://app.leb2.org/class`
- At least one activity page: `https://app.leb2.org/class/1583085/activity`

Ask me to do this:

1. Open the page in Chrome or Edge.
2. Press `F12` to open Developer Tools.
3. Open the **Elements** tab.
4. Copy the HTML.

Explain that private details such as full name, student ID, email, grades, comments, and classmate information should be removed before sharing.

### Step 1.2: Identify selectors

After receiving the HTML, identify reliable CSS selectors for:

- Class links and class IDs
- Class titles
- Activity/assignment title
- Activity URL
- Due date
- Submission/completion status
- Assignment type
- Any pagination or “load more” controls
- Empty states such as “No activities”

For the rendered assessment activity table, use these selectors from the activity page HTML:

- Activity block: `#assessmentListDesktop #table tbody tr`
- Activity title: `.assessment__title`
- Activity URL: `.assessment__title-link[href]`
- Creator: `.assessment__creator`
- Assignment type: `.badge__assessment-type`
- Publish date: `.tooltip__start-date`
- Due date: `.tooltip__due-date`
- Submission status: `.badge__submit-status`
- Attachments: `.assessment__download-attachments`

The title is not a generic `activity-item` field. It is rendered inside each table row as:

```html
<span class="assessment__title">Facebook Group (updated)</span>
```

For class navigation, use the numeric ID from the card `name` attribute, such as `card-1582970`. If the card's `data-url` points to `/checkAfterAccessClass`, replace that endpoint with `/activity` using the extracted class ID. Validate this conversion with at least one real class URL.

Do not rely only on CSS class names if they appear generated or unstable. Prefer stable attributes, semantic tags, visible labels, `data-*` attributes, and predictable URL patterns.

### Step 1.3: Build a scanner test before the GUI

Create a Playwright proof-of-concept script before creating the full interface.

The test script must:

1. Start a persistent Chromium browser profile.
2. Open the LEB2 login page if the user is not logged in.
3. Pause or wait until login is complete.
4. Open `https://app.leb2.org/class`.
5. Extract all available class names and class URLs.
6. Extract each numeric class ID and construct `/class/{id}/activity` from it, even when the card URL ends in `/checkAfterAccessClass`.
7. Visit each constructed class activity page.
8. Extract each `#assessmentListDesktop #table tbody tr` activity row and its available details.
9. Print a clean result to the terminal.
10. Save the raw extracted result to a local JSON file for debugging.

Example terminal output:

```text
Scan complete

Classes found: 4
Activities found: 12
Unfinished: 5
Overdue: 1

[UNDONE] Mathematics - Homework Chapter 3 - Due: 2026-09-12
[OVERDUE] Physics - Lab Report - Due: 2026-09-08
[SUBMITTED] English - Essay Draft - Due: 2026-09-15
```

### Step 1.4: Test criteria

Do not proceed to the main GUI until these conditions are met:

- The scanner can find all visible classes.
- The scanner converts class access URLs such as `/checkAfterAccessClass` to the correct `/activity` URL using the numeric class ID.
- The scanner can visit each activity page.
- The scanner can extract at least title and status for activities.
- The scanner handles missing due dates without crashing.
- The scanner saves a JSON debug result.
- The scanner clearly marks unknown statuses instead of assuming an item is incomplete.

If LEB2 uses client-side rendering, wait for the correct selectors before extraction. If the page has multiple tabs, filters, or paginated activity lists, detect and handle them.

---

## Step 2: Build the desktop GUI

After the scanner test works, build the Electron + React desktop interface.

### Required screens & Layout

#### 1. Mobile-Like Vertical Window
- Default window dimensions: **440px wide × 760px high** (resizable, minimum 360px × 560px).
- Vertical scrollable single-column layout optimized for quick mobile-like desktop widget glancing.
- Styled to closely match the authentic LEB2 app design (referenced from `docs/html-samples/hidden/activity-page.html`):
  - Clean top brand navigation bar with LEB2 logo badge and live connection indicator.
  - Authentic LEB2 status badges: green (`Submitted`), coral/red (`Not Submitted`), amber (`Late`), and teal (`Marked Done`).
  - Assignment type pills: `Individual` / `Group`.

#### 2. Top Summary & Actions
- Prominently displays primary metrics at the top:
  - **Not Submitted: {count}** (counts unsubmitted, non-done assignments)
  - **Total Courses: {count}** (total enrolled courses)
- Prominent **Scan** button with loading spinner during scan operations.
- **Last scan date and time** placed directly below the Scan button (e.g., `Last scan: Sep 10, 2026 at 14:35`).
- Feedback and error alerts displayed via dismissible inline toast banners.

#### 3. Filter Tabs (Not Submitted, By Due Date, All Work)
- Segmented control to switch between three primary views:
  - **Not Submitted ({count})**: Default view on open; grouped by course, showing only active, uncompleted assignments that are not marked as done.
  - **By Due Date ({count})**: Chronologically sorted list by nearest deadline; features overdue badges, due dates with urgency styling, course code tags, and an optional "Include submitted" filter.
  - **All Work ({count})**: Grouped by course; shows all assignments (submitted, late, not submitted, and marked as done).

#### 4. Course-Grouped Assignment List
- Hierarchical display grouped by course:
  - Course Header: `[Course Code] [Subject Name]` (e.g., `CPE 333 OPERATING SYSTEMS`), section pill (e.g., `Section 31`), and remaining to-do badge.
  - Under each course: list of assignments belonging to that course:
    - Assignment title (clickable to open in LEB2).
    - Status badge (`Not Submitted`, `Submitted`, `Late`, `Marked Done`).
    - Assignment type tag (`Individual` / `Group`).
    - Due date (e.g., `Due: September 10, 2026 at 17:30`), with warning highlight for pending/overdue deadlines.
    - Quick checkmark toggle button for instant mark-as-done without opening context menu.

#### 5. "Mark as Done" Context Menu
- Right-clicking an assignment row opens a custom context menu:
  - **Mark as Done** / **Mark as Undone**: Toggles the assignment's completion status.
  - **Open in LEB2**: Opens the activity URL in the user's default browser.
  - When marked as done, the assignment immediately disappears from the default "Not Submitted" view and displays with a "Marked Done" badge in "All Work".
- Right-clicking a course header opens a course context menu:
  - **Mark Course as Done** / **Mark Course as Undone**: Toggles course-level completion status.
  - **Mark All in Course as Done**: Sets all assignments within the course to done.
  - **Open Course Page**: Opens the LEB2 class page in the browser.
- "Mark as Done" states are persisted in the SQLite database (`assignments` and `courses` tables) across app launches and scans.

---

## Step 3: Assignment status rules

Use a careful status evaluation system.

### Status values

```ts
type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "completed"
  | "graded"
  | "overdue"
  | "unknown";
```

### Unfinished rule

An assignment should be considered unfinished when:

```ts
const unfinishedStatuses = ["not_started", "in_progress", "unknown"];
```

An item is overdue only when:

```ts
const isOverdue =
  assignment.dueAt !== null &&
  new Date(assignment.dueAt) < new Date() &&
  !["submitted", "completed", "graded"].includes(assignment.status);
```

Important rules:

- Never mark an activity as completed unless LEB2 clearly says it is submitted, completed, graded, or equivalent.
- If status cannot be read, use `unknown`.
- Do not treat a missing due date as overdue.
- Preserve the original status text from LEB2 for debugging.
- Make status-label mappings easy to edit in one configuration file.

---

## Step 4: Local database design

Use SQLite with the following tables.

```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  last_scanned_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  assignment_type TEXT,
  status TEXT NOT NULL,
  raw_status_text TEXT,
  due_at TEXT,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  source_hash TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE scans (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  classes_found INTEGER NOT NULL DEFAULT 0,
  activities_found INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE TABLE notification_log (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## Step 5: Notifications

Use Windows notifications.

Send notifications only when appropriate:

- A new unfinished assignment is found.
- An assignment is due within the user’s chosen reminder period.
- An assignment is overdue.
- Do not repeatedly send the exact same notification for the same assignment and reminder type.

Example notifications:

```text
LEB2 Work Checker
Physics: Lab Report is due tomorrow at 23:59.
```

```text
LEB2 Work Checker
Overdue: Mathematics Homework Chapter 3 was due on 8 September.
```

---

## Step 6: Error handling and safety

The app must handle these cases gracefully:

- User is not signed in.
- Login session has expired.
- LEB2 website is unavailable.
- A class page fails to load.
- Activity page layout changes.
- No classes are found.
- No activities are found.
- An assignment has no due date.
- An assignment status cannot be recognized.
- Internet connection is unavailable.

Show clear user-friendly messages. Save technical error information only in local logs.

Do not:

- Store passwords in plain text.
- Submit assignments automatically.
- Change, delete, or edit anything on LEB2.
- Scrape more frequently than needed.
- Send the user’s school data to an external server.

This is a read-only personal productivity app.

---

# Project file structure

Create this project structure:

```text
leb2-work-checker/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.yml
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── .env.example
├── docs/
│   ├── leb2-selector-notes.md
│   ├── html-samples/
│   │   ├── class-list.sample.html
│   │   └── activity-item.sample.html
│   └── testing-checklist.md
├── scripts/
│   ├── scan-leb2.ts
│   ├── test-selectors.ts
│   └── export-debug-data.ts
├── playwright/
│   ├── selectors.ts
│   ├── session.ts
│   ├── scanner.ts
│   ├── parser.ts
│   ├── status-mapper.ts
│   └── types.ts
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   │   ├── scan.ipc.ts
│   │   ├── settings.ipc.ts
│   │   ├── courses.ipc.ts
│   │   └── assignments.ipc.ts
│   ├── services/
│   │   ├── scheduler.service.ts
│   │   ├── notification.service.ts
│   │   ├── session.service.ts
│   │   └── logger.service.ts
│   └── database/
│       ├── database.ts
│       ├── schema.sql
│       ├── course.repository.ts
│       ├── assignment.repository.ts
│       ├── scan.repository.ts
│       └── settings.repository.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── assets/
│   │   └── app-icon.svg
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── AssignmentCard.tsx
│   │   ├── AssignmentTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DueDateLabel.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingState.tsx
│   │   └── ScanButton.tsx
│   ├── pages/
│   │   ├── WelcomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AssignmentsPage.tsx
│   │   ├── CoursesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── hooks/
│   │   ├── useAssignments.ts
│   │   ├── useCourses.ts
│   │   ├── useScan.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── date-utils.ts
│   │   ├── status-utils.ts
│   │   └── constants.ts
│   └── types/
│       ├── assignment.ts
│       ├── course.ts
│       ├── scan.ts
│       └── electron-api.d.ts
└── tests/
    ├── parser.test.ts
    ├── status-mapper.test.ts
    ├── date-utils.test.ts
    └── scanner.integration.test.ts
```

---

# Implementation order

Implement in this exact order:

1. Set up the Electron, React, TypeScript, Vite, Tailwind, and SQLite project.
2. Create the Playwright persistent login/session flow.
3. Ask for and save sanitized HTML examples from the LEB2 class and activity pages.
4. Implement selectors and parser logic based on the provided HTML.
5. Build and run the command-line scanner test.
6. Confirm extracted classes and activities are accurate.
7. Add SQLite storage and assignment upsert logic.
8. Build the Electron IPC layer.
9. Build the React dashboard and assignment list.
10. Add filters, sorting, and course page.
11. Add scheduled scanning.
12. Add Windows notifications.
13. Add error handling, debug logs, tests, installer configuration, and README instructions.

---

# Expected first deliverable

Before building the complete desktop app, provide:

1. The initial project setup commands.
2. The first implementation of the Playwright scanner.
3. A list of HTML sections needed from me to make selectors accurate.
4. A terminal test command.
5. A sample JSON output file format.
6. A clear statement of whether the scanner successfully found classes and activities.

Do not claim the scanner works until it has been tested using actual sanitized LEB2 HTML or a real authenticated test session.