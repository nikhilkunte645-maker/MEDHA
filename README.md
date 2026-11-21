# MEDHA — Adaptive AI Learning Intelligence Platform
> *"Know what you know. Fix what you don't."*

**Hero Headline:** Meet Medha. The tutor that knows what you don't.  
**Academic Scope:** Class 10 Physics — *Electricity* (Concepts C01 to C09)  
**Architecture:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Google Gemini 2.5 Flash, Framer Motion  
**Design Theme:** Primary Neon-Glass Theme (`#131318` main surface, `#0e0e13` deep surface, controlled neon accents)

---

## 1. Executive Summary & Product Architecture

Unlike generic EdTech chatbots that merely answer questions or treat lucky multiple-choice guesses as mastery, **MEDHA** is an evidence-based learning intelligence platform that:
1. Maps conceptual knowledge across an authentic **Prerequisite Directed Acyclic Graph (DAG)** of **9 core Electricity concepts**.
2. Analyzes the student's **written reasoning** using server-side **Google Gemini 2.5 Flash** to identify the root cause of errors.
3. Detects specific cognitive misconceptions (e.g. *Current vs Voltage confusion*, *Resistivity dimensional fallacies*, *Series current decay*, and *Parallel resistance fallacies*).
4. Employs a **deterministic evidence-based mastery engine** (0–100 scale: Mastered $\ge 80\%$, Learning $50–79\%$, At Risk $<50\%$, and Unassessed) with inertia damping and diminishing returns.
5. Schedules **spaced repetition** (1 / 3 / 7 day intervals) calibrated to concept stability.
6. Gives teachers class-wide visibility through an interactive **Student × Concept Heatmap Matrix** and actionable lesson recommendations.

---

## 2. The 9 Core Physics Concepts (Class 10 Electricity)

| Concept Code | Concept Name | Formulas | Prerequisites | Difficulty |
|---|---|---|---|:---:|
| **C01** | Electric Charge and Current | $I = \frac{Q}{t}$, $Q = n \cdot e$ | None (Entry) | Level 1 |
| **C02** | Potential Difference | $V = \frac{W}{Q}$, $1\text{ V} = \frac{1\text{ J}}{1\text{ C}}$ | C01 | Level 2 |
| **C03** | Circuit Diagrams and Symbols | Standard NCERT schematics | C01, C02 | Level 1 |
| **C04** | Ohm's Law | $V = I \cdot R$ (at const. temp) | C01, C02, C03 | Level 2 |
| **C05** | Resistivity | $R = \rho \frac{L}{A}$, $V_{\text{vol}} = A \cdot L$ | C04 | Level 2 |
| **C06** | Resistors in Series | $R_s = R_1 + R_2 + \dots$ | C04, C05 | Level 2 |
| **C07** | Resistors in Parallel | $\frac{1}{R_p} = \frac{1}{R_1} + \frac{1}{R_2} + \dots$ | C04, C05 | Level 3 |
| **C08** | Heating Effect of Current | $H = I^2 R t$, Fuse rating | C04, C06, C07 | Level 2 |
| **C09** | Electric Power | $P = VI = I^2R = \frac{V^2}{R}$, kWh billing | C04, C06, C07, C08 | Level 3 |

---

## 3. The 7 Production-Grade Core Screens

### Screen 1 — Cognitive Overview & Hero Experience
- **Hero Headline:** *"Meet Medha. The tutor that knows what you don't."*
- **Tagline:** *"Know what you know. Fix what you don't."*
- Persistent navigation sidebar with brand identity, academic scope, and active tabs.
- Interactive Cognitive Node Network canvas representing all 9 concepts.
- Root-cause diagnosis telemetry preview.
- Three product capability cards: **Diagnose**, **Understand**, and **Master**.
- Before-and-after conceptual mastery comparison (supported by actual attempt history; honest empty state if not yet assessed).
- 9-Concept coverage grid with dual color + text + icon indicators.
- Mastery Health summary (Mastered, Learning, At Risk, Unassessed counts).

### Screen 2 — Diagnostic Test with Reasoning Capture
- Single-question focused layout with difficulty badges (Level 1, 2, or 3).
- Mandatory written reasoning input evaluated by the server-side AI engine.
- Instant baseline calculation across all 9 concepts via `calculateDiagnosticBaseline`.
- Comprehensive baseline calibration results summary.

### Screen 3 — Concept Graph and Learner Model
- Full-width interactive Electricity Knowledge Topology (9 nodes in a clean DAG).
- Prerequisite relationships with directional markers and highlight curves.
- Zoom in, zoom out, and reset fit controls.
- Filter by node status: All, Mastered ($\ge 80\%$), Learning ($50–79\%$), At Risk ($<50\%$).
- Concept detail drawer with formulas, prerequisite readiness, and historical mastery progression curve.

### Screen 4 — Misconception Insight and Remediation
- Shows student's submitted reasoning alongside extracted verbatim quotes.
- Identifies the misconception title, code, and status (`detected`, `suspected`, `unverified`).
- Contrasts why the reasoning was flawed against the **Correct Physics Principle**.
- Provides actionable remediation next steps and instant targeted practice question.

### Screen 5 — Adaptive Practice
- Synthesizes questions targeted to the student's weakest concept nodes.
- Multi-tier difficulty calibration (Level 1 Foundational, Level 2 Application, Level 3 Challenging).
- Explicit explanation of *"Why this question was selected"*.
- Interactive hint toggle revealing physical hints.
- Reasoning submission with real-time AI diagnosis and deterministic mastery score changes.

### Screen 6 — Spaced Repetition and Revision Schedule
- Retention intervals: At Risk ($<50\%$) = 1 day; Learning ($50–79\%$) = 3 days; Mastered ($\ge 80\%$) = 7 days.
- Due today queue, upcoming queue, and review streaks.
- *"Practice Revision"* action buttons.

### Screen 7 — Teacher Dashboard & Cohort Heatmap
- Toggle between **Class 10-A (Sample Data: 8 Students)** and **Active Learner (Live Telemetry)**.
- Class mastery benchmark bar chart across all 9 concepts.
- Cognitive misconception frequency distribution.
- **Student × Concept Heatmap Matrix** covering all 9 concepts.
- Actionable lesson plans and student drill-down inspection drawer.
- **Export Analytics** action to export JSON/CSV class telemetry.

---

## 4. Visual Design System Tokens

| Token | Hex Value | Application |
|---|---|---|
| **Main surface** | `#131318` | Primary card and container backgrounds |
| **Deep surface** | `#0e0e13` | App body background and nested wells |
| **Elevated surface** | `#1b1b20` | Elevated cards and inputs |
| **Higher surface** | `#2a292f` | Active navigation and popovers |
| **Primary text** | `#e4e1e9` | High-contrast headings and body |
| **Secondary text** | `#cbc3d7` | Metadata, subtitles, and captions |
| **Primary accent** | `#d0bcff` | Neon violet brand accents and highlights |
| **Primary container** | `#a078ff` | Primary action buttons and badges |
| **Secondary accent** | `#5de6ff` | Cyan telemetry highlights and links |
| **Mastered (>=80%)** | `#38D99A` | Strong conceptual understanding |
| **Learning (50–79%)** | `#F3B94F` | Developing understanding |
| **At Risk (<50%)** | `#FF657A` | Critical conceptual gap |
| **Unassessed** | `#565E71` | Unassessed concept (no fake %) |

---

## 5. Verification & Testing

### Run Automated Unit Tests:
```bash
node scripts/test-engine.mjs
```
*Output: All tests PASS (Spaced repetition intervals, Mastery scale thresholds, Flawed reasoning heuristics).*

### Run Production Build:
```bash
npm run build
```
*Output: Exit code 0, 7 static pages generated, zero type or lint errors.*

### Start Local Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
