# MASTERY — Adaptive AI Learning Intelligence Platform
> *"Know what you know. Discover what you don't."*

**Event:** Product Space Agentic AI Hackathon  
**Problem Statement:** PS-2 — Adaptive Learning & Conceptual Knowledge Tracking  
**Domain Model:** Class 10 Physics — Chapter: *Electricity* (Concepts C01 to C08)  
**Live Target Architecture:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Google Gemini 2.5 Flash, Framer Motion

---

## 1. Executive Summary & Problem Understanding

Generic AI chat tutors fail at true education. When a student asks a question or selects an answer:
1. Generic tutors answer immediately without assessing the student's prerequisite gaps.
2. Generic tutors treat a lucky guess on a multiple-choice question as 100% mastery.
3. Generic tutors maintain no structured concept graph of what the student understands.
4. Generic tutors cannot diagnose the *underlying cognitive reasoning* behind an incorrect answer.
5. Teachers receive zero visibility into cohort-wide misconceptions.

**MASTERY** solves PS-2 by shifting from *conversational question answering* to **evidence-based learning intelligence**:
- It structures the domain into an authentic **Prerequisite Directed Acyclic Graph (DAG)** of 8 concepts.
- It captures and analyzes the student's **written reasoning** using server-side **Google Gemini 2.5 Flash** with strict JSON schema validation.
- It detects specific cognitive misconceptions (e.g. confusing current with voltage, neglecting volume conservation in stretched wires, or parallel resistance fallacies).
- It executes a **deterministic mastery engine** (0–100 scale with inertia and diminishing return mathematics) that prevents single lucky guesses or accidental slips from distorting learner state.
- It schedules **spaced revision** (1 / 2 / 4 / 7 days) calibrated to concept stability.
- It provides a dedicated **Teacher Analytics Dashboard** with cohort gap heatmaps and actionable lesson recommendations.

---

## 2. The 9 Core Capabilities Matrix

| # | Hackathon Capability | Implementation in MASTERY | Status |
|---|----------------------|---------------------------|--------|
| **1** | **Diagnose existing understanding** | 10-question diagnostic assessment across all 8 concepts capturing answers & step-by-step reasoning. | **PASS** |
| **2** | **Structured concept graph** | Prerequisite DAG (C01–C08) with SVG layout, mastery color telemetry, hover tooltips & modal dialogs. | **PASS** |
| **3** | **Independent concept mastery tracking** | Deterministic evidence-based algorithm (0–100 scale, 4 tiers: Needs Attention, Developing, Proficient, Strong). | **PASS** |
| **4** | **Analyze reasoning behind incorrect answers** | Server-side Gemini 2.5 Flash evaluates step-by-step reasoning with strict schema validation. | **PASS** |
| **5** | **Detect specific misconceptions** | Categorizes conceptual flaws, incorrect formula selection, calculation slips, and extracts verbatim quotes. | **PASS** |
| **6** | **Generate targeted questions** | Synthesizes fresh, mathematically verified questions targeting the student's weakest concept nodes. | **PASS** |
| **7** | **Calibrate question difficulty** | 3-tier difficulty calibration (Level 1 Foundational, Level 2 Application, Level 3 Challenging). | **PASS** |
| **8** | **Schedule spaced revision** | Evidence-based retention scheduler (1/2/4/7 day heuristics) tracking overdue review queues. | **PASS** |
| **9** | **Teacher cohort visibility** | Class-wide concept mastery bars, student × concept gap heatmap matrix, and misconception frequency tallies. | **PASS** |

---

## 3. Class 10 Physics: Electricity Concept Knowledge Graph

MASTERY models the complete NCERT/CBSE Class 10 Electricity syllabus across 8 interconnected concept nodes:

```
[C01: Electric Charge & Current] ----+
                                     |---> [C03: Circuits & Symbols] ---> [C04: Ohm's Law] ---> [C05: Resistance & Factors]
[C02: Potential Difference] ---------+                                         |                           |
                                                                               +-------------+-------------+
                                                                                             |
                                                                                             v
                                                                               [C06: Series & Parallel]
                                                                                             |
                                                                               +-------------+-------------+
                                                                               |                           |
                                                                               v                           v
                                                                  [C07: Joule's Heating]      [C08: Power & Energy]
```

- **C01:** Electric Charge & Electric Current ($I = Q/t$, $Q = ne$, Ampere, Coulomb, Ammeter in series)
- **C02:** Electric Potential Difference ($V = W/Q$, 1 Volt = 1 Joule / 1 Coulomb, Voltmeter in parallel)
- **C03:** Electric Circuits & Circuit Symbols (Closed vs open loops, switch, standard schematic symbols)
- **C04:** Ohm's Law ($V = IR$, constant temperature constraint, V-I slope = R)
- **C05:** Resistance & Factors Affecting Resistance ($R = \rho L / A$, volume conservation $V = AL$, resistivity)
- **C06:** Series & Parallel Combinations ($R_s = \sum R_i$, $1/R_p = \sum 1/R_i$, voltage & current division)
- **C07:** Heating Effect of Electric Current (Joule's law $H = I^2Rt$, electric fuse rating)
- **C08:** Electric Power & Electrical Energy ($P = VI = I^2R = V^2/R$, commercial billing in kWh: $1\text{ kWh} = 3.6 \times 10^6\text{ J}$)

---

## 4. Deterministic Mastery Calculation Engine

To prevent LLM hallucinations from arbitrarily assigning grades, mastery updates are governed by a **deterministic evidence-based mathematical engine**:

- **Mastery Scale:** 0 to 100
  - `0–39:` Needs Attention (Red)
  - `40–69:` Developing (Amber)
  - `70–84:` Proficient (Emerald)
  - `85–100:` Strong Mastery (Teal)

### Mathematical Rules:
1. **Diminishing Returns on Success:** Score gains scale with available headroom $(100 - S_{\text{current}})$. A student at 85% gains fewer points for a Level 1 question than a student at 40%. Single gain is strictly capped at +22 points.
2. **Inertia Damping on Mistakes:** High demonstrated evidence count $(N)$ dampens deduction: $\text{Inertia} = \min(0.7, N \times 0.1)$. A student with established mastery (e.g. 88%) who makes a calculation slip is deducted only 3–5 points rather than crashing to 20%.
3. **Reasoning Quality Weighting:**
   - Exceptional: $1.25\times$
   - Sound / Good: $1.10\times$
   - Partial / Fair: $0.90\times$
   - Flawed / Poor: $0.60\times$
   - Insufficient Evidence: $0.85\times$
4. **Misconception Penalty:** If the AI confirms a genuine conceptual misconception (e.g. `CURRENT_VOLTAGE_CONFUSION`), the deduction multiplier is increased by $1.2\times$ and targeted remediation is triggered.

---

## 5. Server-Side AI Misconception Diagnosis

MASTERY executes a server-side route (`/api/diagnose-reasoning`) calling Google Gemini 2.5 Flash using the exact system prompt and schema mandated by the hackathon specification.

### Runtime Schema:
```json
{
  "is_correct": false,
  "reasoning_quality": "poor",
  "misconception_detected": true,
  "misconception_code": "CURRENT_VOLTAGE_CONFUSION",
  "misconception_title": "Confusing current with voltage",
  "evidence": [
    "Current is the electrical push from the battery that gets used up"
  ],
  "explanation": "The student treats current as the push and presumes current is consumed by bulbs.",
  "recommended_concept_ids": ["C01", "C02"],
  "confidence": 0.94,
  "next_learning_action": "Practice distinguishing charge rate (current) from energy push (potential difference)."
}
```

### Free-Tier & Offline Demonstration Mode:
- If `GEMINI_API_KEY` is not present, MASTERY automatically switches to a **verified offline diagnostic heuristic engine**.
- It detects specific student reasoning patterns (including the central hackathon scenario) and tags responses with `is_offline_fallback: true`.
- The UI displays an explicit badge: *"Verified Diagnostic Heuristic (Demo Mode)"* — **never fabricating or falsely claiming offline results as live LLM calls.**

---

## 6. Spaced Repetition Scheduling Engine

Calibrated review intervals:
- **Needs Attention:** +1 day
- **Developing:** +2 days
- **Proficient:** +4 days
- **Strong Mastery:** +7 days
- **Expansion:** Multiplier of $1.5\times$ applied for repeated successful reviews.
- Overdue reviews are visually flagged in red and placed in the student's priority revision queue.

---

## 7. Teacher Analytics Dashboard

The Teacher Analytics view provides answers to all 6 key pedagogical questions:
1. **Weakest Concept Class-wide:** Calculated as the minimum mean score across students (e.g. C06 Series & Parallel at 38%).
2. **Highest Misconception Frequency:** Bar distribution tracking `CURRENT_VOLTAGE_CONFUSION` (4 of 8 students).
3. **Learners Needing Attention:** Real-time count of students with composite mastery $< 50\%$.
4. **Concepts Requiring Revision:** Real-time queue of class concepts with overdue review dates.
5. **Student × Concept Heatmap Matrix:** Complete 8-student cohort grid color-coded by mastery tier.
6. **Actionable Teacher Interventions:** Generates concrete physical lesson plans (e.g., *"Perform two-ammeter circuit demonstration to prove charge conservation"*).

*Note: Includes a clear toggle between simulated sample cohort data (Class 10-A, 8 students) and real-time active learner telemetry.*

---

## 8. Hackathon 60-Second Demonstration Script (Section 18)

MASTERY includes a built-in **1-Click Demo Walkthrough** in the top navigation bar (`Demo Walkthrough` button):

1. **Step 1 (Question):** Present Question DQ02 regarding current consumption through a bulb filament.
2. **Step 2 (Flawed Reasoning):** Student submits: *"Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return."*
3. **Step 3 (AI Diagnosis):** Gemini 2.5 Flash analyzes reasoning step-by-step, identifies `CURRENT_VOLTAGE_CONFUSION` (confidence: 94%), and extracts the exact evidence statement.
4. **Step 4 (Mastery Update):** Deterministic engine deducts 12 points from C01 and C02, demoting them to `needs_attention` (36% and 34%).
5. **Step 5 (Graph Telemetry):** Concept nodes C01 and C02 turn red with pulsing attention halos; downstream dependencies C03 & C04 indicate prerequisite vulnerability.
6. **Step 6 (Targeted Remediation):** Adaptive question generator synthesizes a follow-up question on charge conservation ($Q = I \times t$).
7. **Step 7 (Teacher Analytics):** The misconception is instantly aggregated into the Teacher Dashboard heatmap and class misconception tally.

---

## 9. Quality Gates Report

| Gate | Check Description | Result | Evidence |
|------|-------------------|--------|----------|
| **GATE 1** | Application starts successfully | **PASS** | Next.js 15 App Router starts cleanly without runtime errors. |
| **GATE 2** | Diagnostic assessment works | **PASS** | 10-question test captures answers, reasoning, and calculates baseline. |
| **GATE 3** | All 8 concepts are represented | **PASS** | C01 through C08 completely defined with objectives, formulas, and misconceptions. |
| **GATE 4** | Mastery changes based on actual attempts | **PASS** | Deterministic engine updates scores with inertia and diminishing return rules. |
| **GATE 5** | Reasoning-based misconception analysis works | **PASS** | Gemini 2.5 Flash structured JSON diagnosis + verified offline heuristic fallback. |
| **GATE 6** | Adaptive questions target weak concepts | **PASS** | `/api/generate-question` synthesizes questions calibrated to weak concept IDs. |
| **GATE 7** | Revision dates are calculated and persisted | **PASS** | Spaced repetition engine sets +1, +2, +4, +7 day timestamps in LocalStorage. |
| **GATE 8** | Teacher analytics reflect cohort data | **PASS** | Heatmap matrix and bar charts calculate averages across student records. |
| **GATE 9** | Production build succeeds | **PASS** | `next build` passes with zero type or lint errors. |
| **GATE 10** | Entire student journey works end-to-end | **PASS** | Landing → Diagnostic → Graph → Practice → Feedback → Revision → Teacher. |

---

## 10. Setup & Local Development Instructions

### Prerequisites:
- Node.js 18+ (tested on Node v24.19)
- npm 9+

### Installation:
```bash
git clone <repo-url>
cd MEDHA
npm install
```

### Environment Configuration:
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no key is provided, the application runs seamlessly in offline demonstration mode using verified deterministic heuristics).*

### Running Locally:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Automated Testing:
```bash
node scripts/test-engine.mjs
```

### Production Build:
```bash
npm run build
npm start
```

---

## 11. Vercel Deployment Instructions

MASTERY is built on standard Next.js App Router architecture and is 100% Vercel-ready:
1. Push repository to GitHub.
2. In the Vercel Dashboard, select **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = your Google Gemini API key.
4. Click **Deploy**.
