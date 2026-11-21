# MEDHA — SECURE ROLE-BASED ACCESS CONTROL & DATA ISOLATION ARCHITECTURE PLAN

**Project:** MEDHA — Adaptive AI Learning Intelligence Platform  
**Target Roles:** Student, Teacher, Administrator  
**Date:** November 21, 2026  
**Status:** Architecture Blueprint & Implementation Strategy  

---

## 1. FORENSIC AUDIT OF EXISTING SYSTEM

### 1.1 Current Architecture Overview
- **Framework:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4.
- **Routing:** Single root entrypoint (`src/app/page.tsx`) wrapped in `AppShell.tsx`, toggling between seven functional screens via internal React state (`currentTab`).
- **Current Persistence (`src/lib/storage.ts`):** Client-side browser `localStorage` using key `medha_learner_profile_v2`.
- **Teacher Analytics (`src/components/TeacherAnalyticsView.tsx`):** Renders in the same client application shell, allowing any user to toggle between `SAMPLE_COHORT` and active local learner data.
- **API Endpoints:**
  - `/api/diagnose-reasoning` (Unauthenticated POST)
  - `/api/generate-question` (Unauthenticated POST)
  - `/api/status` (Public GET)

### 1.2 Identified Security Weaknesses & Risks
1. **Zero Authentication:** No login, credentials, session cookies, or user verification exists in the application.
2. **Missing Role Boundaries:** The Teacher Dashboard is accessible to any user simply by clicking the "Teacher Dashboard" tab in `AppShell.tsx` or setting `currentTab = 'teacher'`.
3. **Insecure Data Storage (LocalStorage Only):** Learner mastery data, diagnostic attempts, and reasoning strings are stored in plaintext browser `localStorage`. Any script or browser extension can read or tamper with scores.
4. **No Cross-Student Isolation:** If multiple students share a device/browser, their attempts and profiles overwrite one another.
5. **Unprotected API Endpoints:** `/api/diagnose-reasoning` and `/api/generate-question` can be invoked anonymously without session verification, making them vulnerable to rate abuse and unauthorized extraction.
6. **No Teacher Class Scoping:** Teachers currently have access to hardcoded global sample cohorts rather than strictly assigned, authenticated classes.
7. **Absence of Audit Logging:** Sensitive administrative events (role changes, account provisioning, class exports) are not logged.

---

## 3. THREE-ROLE ACCESS CONTROL MATRIX (RBAC)

| Resource / Capability | Student | Teacher | Administrator |
|---|:---:|:---:|:---:|
| **Student Portal (`/student`)** | ✅ Allowed (Own data only) | ❌ Denied | ❌ Denied (or view-as test mode) |
| **Take Baseline Diagnostic** | ✅ Allowed (Own profile) | ❌ Denied | ❌ Denied |
| **View Own Concept DAG & Mastery** | ✅ Allowed (Own profile) | ❌ Denied | ❌ Denied |
| **Submit Reasoning & Receive Diagnosis** | ✅ Allowed (Own attempts) | ❌ Denied | ❌ Denied |
| **Adaptive Practice & Revision Queue** | ✅ Allowed (Own queue) | ❌ Denied | ❌ Denied |
| **Teacher Portal (`/teacher`)** | ❌ **Strictly Denied (403)** | ✅ Allowed (Assigned classes) | ❌ Denied (Requires Admin Portal) |
| **Class Heatmap & Gap Analytics** | ❌ **Strictly Denied** | ✅ Allowed (Assigned classes) | ✅ Allowed |
| **Student Drill-Down** | ❌ **Strictly Denied** | ✅ Allowed (Assigned classes only) | ✅ Allowed |
| **Export Class Telemetry** | ❌ **Strictly Denied** | ✅ Allowed (Assigned classes only) | ✅ Allowed |
| **Admin Portal (`/admin`)** | ❌ **Strictly Denied** | ❌ **Strictly Denied** | ✅ Allowed |
| **Provision Teacher / Student Accounts** | ❌ **Strictly Denied** | ❌ **Strictly Denied** | ✅ Allowed |
| **Assign Teacher to Classes** | ❌ **Strictly Denied** | ❌ **Strictly Denied** | ✅ Allowed |
| **Revoke Sessions & Audit Security Logs**| ❌ **Strictly Denied** | ❌ **Strictly Denied** | ✅ Allowed |

---

## 4. AUTHENTICATION & SESSION ARCHITECTURE

### 4.1 Cryptographic & Password Security
- **Password Hashing:** `bcryptjs` with salt work factor $10$ (or Node.js `scrypt` with 32-byte salt). Plaintext passwords are never logged, stored, or exposed.
- **Session Tokens:** Cryptographically random 256-bit hexadecimal tokens generated via `node:crypto.randomBytes(32)`.
- **Session Cookie:**
  - Name: `medha_session`
  - Attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (in production / HTTPS).
  - Expiration: 7 days sliding window with server-side revocation lookup.
- **Brute-Force & Rate Limiting:** Server-side in-memory failure counter tracking IP and username attempts. After 5 consecutive failed attempts, locks authentication for 15 minutes.

### 4.2 Pre-Configured Seed Personas (Demonstration & Audit)
To support comprehensive offline testing, judging, and security evaluation, the server database will initialize with isolated, distinct seed accounts:

1. **Student 1 (Class 10-A):**
   - Username / Email: `priya@student.medha.edu`
   - Role: `student`
   - Class ID: `CLASS-10A`
2. **Student 2 (Class 10-A):**
   - Username / Email: `aarav@student.medha.edu`
   - Role: `student`
   - Class ID: `CLASS-10A`
3. **Student 3 (Class 10-B - Isolated):**
   - Username / Email: `rohit@student.medha.edu`
   - Role: `student`
   - Class ID: `CLASS-10B` (Assigned to a different class)
4. **Teacher 1 (Class 10-A Assigned):**
   - Username / Email: `sharma@teacher.medha.edu`
   - Role: `teacher`
   - Assigned Classes: `['CLASS-10A']` (Can access Priya & Aarav, but CANNOT access Rohit)
5. **Teacher 2 (Class 10-B Assigned):**
   - Username / Email: `verma@teacher.medha.edu`
   - Role: `teacher`
   - Assigned Classes: `['CLASS-10B']` (Can access Rohit, CANNOT access Priya & Aarav)
6. **Administrator:**
   - Username / Email: `admin@medha.edu`
   - Role: `admin`
   - Permissions: Global system administration, user provisioning, class mapping, session revocation.

---

## 5. SERVER-SIDE PERSISTENCE & DATA ISOLATION

### 5.1 Storage Architecture
To ensure complete portability, fast execution, zero external cloud dependencies, and zero Windows compilation failures, the server-side persistence layer is implemented as an atomic, ACID-compliant file-backed JSON database engine (`src/lib/server/db.ts`) stored in a secured server directory (`data/medha_server_db.json`).
- **Collections:**
  - `users`: `{ id, email, passwordHash, name, role, classId, assignedClassIds, createdAt, isDeactivated }`
  - `sessions`: `{ token, userId, role, createdAt, expiresAt }`
  - `learner_profiles`: `{ userId, name, masteryMap, attempts, diagnosticCompleted, createdAt, lastActive }`
  - `classes`: `{ id, name, grade, section, studentIds, teacherIds }`
  - `audit_logs`: `{ id, timestamp, event, userId, role, ip, details }`
- **Atomic Persistence:** Writes use atomic file writes (`fs.writeFileSync` to temporary file + rename) with mutex locking to prevent race conditions.

### 5.2 Server-Side Ownership Enforcement
- **Student Operations:** Every request to retrieve or update mastery, diagnostic attempts, or revision schedules derives `studentId = session.userId`. The client is never allowed to specify a `targetStudentId` to read or modify another student's data (eliminates IDOR).
- **Teacher Operations:** Whenever a teacher requests student data (`/api/teacher/students/[studentId]`), the server verifies:
  1. `session.role === 'teacher'`
  2. The teacher is assigned to `student.classId`
  3. If not assigned $\implies$ HTTP 403 Forbidden.

---

## 6. ENDPOINT ARCHITECTURE & AUTHORIZATION SPECIFICATION

| Endpoint | Method | Allowed Roles | Authorization Verification Logic |
|---|:---:|:---:|---|
| `/api/auth/login` | POST | Public | Validates credentials, creates session, sets HTTP-only cookie. |
| `/api/auth/logout` | POST | Authenticated | Revokes session token in database, clears cookie. |
| `/api/auth/session` | GET | Authenticated | Returns current authenticated user metadata `{ id, name, email, role, classId }`. |
| `/api/student/profile` | GET | `student` | Returns caller's own learner profile. |
| `/api/student/profile` | PUT | `student` | Updates caller's own learner profile. |
| `/api/student/attempts` | POST | `student` | Records caller's attempt and updates caller's mastery. |
| `/api/teacher/classes` | GET | `teacher` | Returns metadata of ONLY classes assigned to the authenticated teacher. |
| `/api/teacher/analytics`| GET | `teacher` | Aggregates mastery telemetry for assigned classes only. |
| `/api/teacher/students/[id]`| GET | `teacher` | Verifies target student belongs to caller's assigned class before returning profile. |
| `/api/teacher/export` | GET | `teacher` | Generates authorized CSV/JSON report for assigned class only; logs audit event. |
| `/api/admin/users` | GET, POST | `admin` | Lists or creates teacher/student accounts. |
| `/api/admin/classes` | POST | `admin` | Assigns teachers or students to classes. |
| `/api/admin/sessions`| DELETE | `admin` | Revokes user sessions. |
| `/api/admin/audit-logs`| GET | `admin` | Returns security event audit trail. |
| `/api/diagnose-reasoning`| POST | Authenticated | Analyzes reasoning for the authenticated caller. |
| `/api/generate-question`| POST | Authenticated | Generates question calibrated to caller's mastery. |

---

## 7. UX & ROUTING SEPARATION PLAN

1. `/login`: Secure, modern login page with MEDHA branding, role badge, email & password inputs, and quick persona switcher for testing.
2. `/student`: Complete Student Learning Intelligence Portal. Re-uses MEDHA's 9-concept learning engine (Diagnostic, Cognitive Overview, Concept Graph, Misconception Insights, Adaptive Practice, Spaced Revision) with strict student navigation. Zero teacher links.
3. `/teacher`: Dedicated Academic Teacher Portal. Features class selector (only assigned classes appear), concept mastery heatmap, misconception distribution, student drill-down, and authorized telemetry export.
4. `/admin`: Administrative Command Center. User management, class assignment mapping, session revocation, and security audit logs.
5. `middleware.ts`: Next.js Edge-compatible middleware intercepting requests to `/student/*`, `/teacher/*`, and `/admin/*`. Validates session cookie and redirects unauthorized roles immediately with HTTP 307 to `/login` or `/unauthorized`.

---

## 8. IMPLEMENTATION & EXECUTION TIMELINE

1. Install required packages (`bcryptjs`, `@types/bcryptjs`).
2. Implement server-side database & session engine (`src/lib/server/db.ts`).
3. Implement password hashing & security utility (`src/lib/server/auth.ts`).
4. Implement API Route Handlers for Auth, Student, Teacher, and Admin.
5. Configure Next.js Middleware (`src/middleware.ts`) for route-level protection.
6. Build `/login` authentication interface.
7. Build dedicated `/student` portal and `/teacher` portal.
8. Build `/admin` portal.
9. Create comprehensive security regression test suite `scripts/role-security-regression.mjs`.
10. Run test suite, execute production build (`npm run build`), and verify browser behavior.
11. Document final audit in `MEDHA_ROLE_BASED_SECURITY_AUDIT.md`.
