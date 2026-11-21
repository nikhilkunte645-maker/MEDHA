# MEDHA — Adaptive AI Learning Intelligence Platform
> *"Know what you know. Fix what you don't."*

**Hero Headline:** Meet Medha. The tutor that knows what you don't.  
**Academic Scope:** Class 10 Physics — *Electricity* (Concepts C01 to C09)  
**Hackathon:** Product Space Agentic AI Hackathon (Problem Statement PS-2)  
**Architecture:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Google Gemini 2.5 Flash, Framer Motion  
**Design System:** The Intelligent Learning Studio (Minimal, editorial, high-contrast typography, calm surface design)

---

## 1. Executive Summary & The Problem

Generic AI tutors and LLM chatbots answer student questions or grade multiple-choice options, but they suffer from critical pedagogical shortcomings:
1. **Lucky Guesses vs. Real Understanding:** They treat correct multiple-choice guesses as genuine conceptual mastery.
2. **Surface Corrections vs. Root Misconceptions:** They correct the final arithmetic without diagnosing the underlying mental model that caused the mistake.
3. **Black-Box Progress Tracking:** They cannot pinpoint where in a prerequisite chain a student's confusion originated.

**MEDHA** is an evidence-based cognitive learning intelligence platform that:
- Diagnoses a student's existing understanding across an **authentic 9-concept prerequisite Directed Acyclic Graph (DAG)**.
- Analyzes the student's **written reasoning** using server-side **Google Gemini 2.5 Flash** (with verified offline heuristic fallback).
- Detects specific cognitive misconceptions (e.g., *Current vs. Voltage confusion*, *Series current decay*, *Parallel resistance fallacies*).
- Calibrates mastery deterministically on a 0–100 scale using **Bayesian inertia damping and headroom decay**.
- Schedules **spaced revision** (1 / 3 / 7 day intervals) calibrated to concept stability.
- Empowers teachers with **class-wide cohort heatmaps, misconception frequency analytics**, and student drill-downs.

---

## 2. The 9 Core Physics Concepts (Class 10 Electricity)

Knowledge is modeled as a strictly acyclic prerequisite DAG:

| Concept Code | Concept Name | Key Formulas | Prerequisites | Difficulty |
|---|---|---|---|:---:|
| **C01** | Electric Charge and Current | $I = \frac{Q}{t}$, $Q = n \cdot e$ | None (Entry) | Level 1 |
| **C02** | Potential Difference | $V = \frac{W}{Q}$, $1\text{ V} = \frac{1\text{ J}}{1\text{ C}}$ | C01 | Level 2 |
| **C03** | Circuit Diagrams and Symbols | Standard NCERT schematics | C01, C02 | Level 1 |
| **C04** | Ohm's Law | $V = I \cdot R$ (at const. temp) | C01, C02, C03 | Level 2 |
| **C05** | Resistivity | $R = \rho \frac{L}{A}$, $V_{\text{vol}} = A \cdot L$ | C04 | Level 2 |
| **C06** | Resistors in Series | $R_s = R_1 + R_2 + \dots$, $I_1 = I_2 = I_{\text{total}}$ | C04, C05 | Level 2 |
| **C07** | Resistors in Parallel | $\frac{1}{R_p} = \frac{1}{R_1} + \frac{1}{R_2} + \dots$, $V_1 = V_2 = V_{\text{total}}$ | C04, C05 | Level 3 |
| **C08** | Heating Effect of Current | $H = I^2 R t$, Fuse rating | C04, C06, C07 | Level 2 |
| **C09** | Electric Power | $P = VI = I^2R = \frac{V^2}{R}$, kWh billing | C04, C06, C07, C08 | Level 3 |

---

## 3. Product Architecture & Portals

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router                  │
│                     Edge & Session Middleware               │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │                       │
      Role: Student          Role: Teacher           Role: Admin
               ▼                      ▼                       ▼
   ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐
   │    Student Studio    ││    Teacher Studio    ││  Governance Console  │
   │  (/student)          ││  (/teacher)          ││  (/admin)            │
   │                      ││                      ││                      │
   │ • Cognitive Overview ││ • Scoped Cohort View ││ • User Provisioning  │
   │ • Diagnostic Test    ││ • Misconception Dist.││ • Class Mapping      │
   │ • Concept Topology   ││ • Student Drill-down ││ • Security Audit Log │
   │ • Misconception Hub  ││ • Gradebook Export   ││ • Session Control    │
   │ • Adaptive Practice  ││                      ││                      │
   │ • Spaced Revision    ││                      ││                      │
   └───────────┬──────────┘└──────────┬───────────┘└──────────┬───────────┘
               │                      │                       │
               └──────────────────────┼───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │              Backend REST API Layer          │
               │  /api/student/*   /api/teacher/*  /api/admin │
               │  /api/diagnose-reasoning  /api/status        │
               └──────────────────────┬───────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │        Cognitive Intelligence Engine         │
               │ • Google Gemini 2.5 Flash (Live Online)      │
               │ • Curated Deterministic Heuristics (Fallback)│
               │ • Bayesian Mastery Updates with Inertia      │
               │ • 1 / 3 / 7-Day Spaced Repetition Protocol   │
               └──────────────────────────────────────────────┘
```

---

## 4. The Student Experience (7 Core Views)

1. **Cognitive Overview:** Unified learning command center displaying overall mastery percentage, active misconceptions, next actionable recommendation, and prerequisite health breakdown.
2. **Diagnostic Assessment:** Adaptive baseline calibration test requiring step-by-step written reasoning to uncover cognitive gaps before practice begins.
3. **Concept Topology:** Interactive 9-node DAG visualization illustrating prerequisite paths, completion states, and concept formula reference sheets.
4. **Misconception Studio:** Signature remediation experience that extracts student written statements, explains why the mental model is physically flawed, and presents the correct scientific law.
5. **Adaptive Practice:** Targeted question generator synthesizing challenges calibrated to the student's weakest concept nodes with step-by-step feedback.
6. **Spaced Revision:** Retention calendar scheduling overdue and upcoming concept reviews using evidence-based 1, 3, and 7-day decay intervals.
7. **60-Second Walkthrough Modal:** One-click automated simulation demonstrating end-to-end diagnosis for evaluators and judges.

---

## 5. The Teacher & Admin Experiences

### Teacher Studio (`/teacher`)
- **Strict Cohort Scoping:** Teachers view only their assigned classrooms (e.g. Dr. Sharma is scoped strictly to Class 10-A, with 403 Forbidden enforced on unassigned sections).
- **Class Misconception Frequencies:** Aggregates top classroom fallacies (e.g., `SERIES_CURRENT_DECAY`) so teachers can tailor lesson plans.
- **Individual Student Drill-Down:** Deep-dive inspection into any student's historical mastery curves and attempt reasoning evidence.
- **Gradebook Telemetry Export:** Instant one-click export of cohort telemetry in CSV and JSON formats.

### Governance Console (`/admin`)
- **User Provisioning:** Create students and teachers with automatic bcrypt password hashing (10 salt rounds).
- **Class Management:** Associate teachers and enrolled students with academic sections.
- **Immutable Audit Trail:** Real-time log of security events (logins, session expirations, and blocked cross-class access attempts).
- **Zero Credential Exposure:** Password hashes are strictly omitted from all client-facing API responses.

---

## 6. AI & Educational Accuracy

### Dual-Pipeline Cognitive Reasoning Engine
When a student submits written physical reasoning, MEDHA evaluates it through a dual-mode pipeline:
1. **Online Mode (Google Gemini 2.5 Flash):** Evaluates reasoning against expert physics diagnostic system prompts, returning structured JSON with detected misconception codes, evidence quotes, and remedial actions.
2. **Offline Fallback Heuristic:** If the Gemini API key is omitted, exhausted, or network-constrained, MEDHA transparently switches to verified deterministic heuristics.
3. **Radical Transparency:** Every question generation and diagnostic response explicitly carries `is_offline_fallback: true/false`. Offline heuristics are never falsely represented as live AI.

---

## 7. Security & Data Isolation Architecture

- **IDOR Protection:** Verified student-to-student data isolation. Student queries derive identity strictly from the cryptographically verified session token (`medha_session`), ignoring spoofed query or body IDs.
- **Role-Based Access Control:** Next.js middleware guards `/student`, `/teacher`, and `/admin`. Role elevation via client payloads is blocked at the database tier.
- **Brute-Force Rate Limiting:** Account login throttles and blocks automated attacks after 5 consecutive failures.
- **Pristine Seed Architecture:** Runtime database mutations are decoupled from git (`.gitignore`), with a canonical seed template (`data/medha_seed.json`) for fresh deployments.

---

## 8. Demo Persona Credentials

For live demonstration and testing on `http://localhost:3000`:

| Persona | Email | Password | Role | Scoped Context |
| :--- | :--- | :--- | :--- | :--- |
| **Student (Priya)** | `priya@student.medha.edu` | `Medha@2026!` | `student` | Completed diagnostic, 9 concepts mapped, C03 misconception detected |
| **Student (Aarav)** | `aarav@student.medha.edu` | `Medha@2026!` | `student` | Fresh clean-slate baseline for testing onboarding |
| **Teacher (Dr. Sharma)** | `sharma@teacher.medha.edu` | `Medha@2026!` | `teacher` | Class 10-A (CBSE Physics), student drill-down, CSV/JSON export |
| **Administrator** | `admin@medha.edu` | `Medha@2026!` | `admin` | User provisioning, class mapping, immutable security audit log |

---

## 9. Verification & Automated Testing

### 1. TypeScript Strictness
```bash
npx tsc --noEmit
# Output: Exit code 0 (0 type errors)
```

### 2. Comprehensive Full-System Regression Suite
```bash
npx tsx scripts/regression-suite.mjs
# Output: 100% PASS across DAG topology, inertia mathematics, Cases A-H reasoning
```

### 3. Role-Based Security & IDOR Isolation Suite
```bash
npx tsx scripts/role-security-regression.mjs
# Output: 100% PASS across bcrypt verification, teacher class isolation, and rate-limiting
```

### 4. Independent QA Engine Audit
```bash
npx tsx scripts/qa-audit.mjs
# Output: 100% PASS across diagnostic coverage and 1/3/7-day spaced repetition
```

### 5. Production Server Route Verification
```bash
node scripts/verify-live-routes.mjs
# Output: 100% PASS across public, student, teacher, and admin HTTP endpoints
```

---

## 10. Installation & Local Execution

### Prerequisites
- Node.js v20+ (tested on Node v24.19.0)
- npm v10+

### Step-by-Step Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MEDHA
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   *(Optional)* Add your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If omitted, MEDHA operates in verified offline heuristic mode).*

4. **Run Production Build:**
   ```bash
   npm run build
   ```
5. **Start Production Server:**
   ```bash
   npm run start
   ```
   Open `http://localhost:3000` in your browser.

---

## 11. Deployment Considerations

- **Server-Side Compatibility:** Built with standard Next.js 15 App Router and Node.js server runtimes. Fully compatible with Node.js container environments (Docker, Google Cloud Run, Railway, AWS ECS).
- **Persistent Storage Note:** The application currently utilizes a server-side JSON database (`data/medha_server_db.json`) seeded from `data/medha_seed.json`. For stateless ephemeral serverless deployments (e.g. Vercel), a persistent database adapter (PostgreSQL / Supabase / Redis) is recommended for long-term production state persistence.
