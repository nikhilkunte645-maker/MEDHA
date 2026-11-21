<div align="center">

<img src="public/brand/medha-banner-final.png" alt="MEDHA - Adaptive AI Learning Intelligence Platform" width="100%">

# MEDHA
### Adaptive AI Learning Intelligence Platform

**Learn Smarter. Understand Deeper. Grow Beyond Limits.**

An AI-powered learning intelligence platform designed to understand how students learn, identify knowledge gaps, and enable personalized academic improvement.

</div>

---

## About MEDHA

Traditional learning systems often measure what students get right or wrong without sufficiently understanding why they struggle.

MEDHA aims to address this problem through adaptive learning intelligence.

It combines assessment, concept mastery tracking, reasoning analysis, misconception detection, and personalized practice to help students understand their learning progress and identify what they should improve next.

MEDHA is designed around one central idea:

> Every student learns differently. Learning systems should adapt accordingly.

## The Problem

Conventional academic platforms frequently focus on:
- Marks and scores rather than conceptual understanding.
- Static assessments rather than adaptive practice.
- Generic feedback rather than personalized diagnosis.
- Performance reporting rather than actionable learning recommendations.

This can make it difficult for students and teachers to identify the actual reasons behind learning difficulties.

## Our Solution

MEDHA aims to provide a more intelligent learning experience through:

- Assessment-driven learning insights.
- Concept-level mastery tracking.
- Reasoning and misconception analysis.
- Adaptive practice recommendations.
- Structured revision support.
- Teacher-facing academic intelligence.
- Administrative management and governance.

## Key Features

### Student Portal

- Personalized learning dashboard.
- Cognitive baseline assessment.
- Concept mastery tracking.
- Learning progress visualization.
- Adaptive practice activities.
- Reasoning analysis.
- Misconception identification.
- Personalized learning recommendations.
- Spaced revision support.
- Assessment results and learning history.

### AI-Powered Learning Intelligence

- AI-assisted question generation where configured.
- Assessment evaluation.
- Concept-level learning analysis.
- Reasoning and misconception insights.
- Adaptive learning recommendations.
- Bayesian mastery updates where implemented.
- Gemini integration.
- Deterministic offline fallback for supported workflows.

### Teacher Portal

- Class and cohort analytics.
- Student performance overview.
- Individual student drilldowns.
- Concept-level learning insights.
- Misconception and learning-gap visibility.
- Assessment-related insights.
- Data export where supported.

### Admin Portal

- User management.
- Class management.
- Administrative governance.
- Audit-log visibility.
- Role-based access.

*Feature availability depends on the implemented application workflows and configured services.*

---

## How MEDHA Works

```text
Student
   |
   v
Assessment / Practice
   |
   v
Question Generation
   |
   v
Student Response
   |
   v
Answer Evaluation
   |
   v
Learning Diagnosis
   |
   v
Concept Mastery Analysis
   |
   v
Personalized Learning Insights
   |
   v
Adaptive Practice & Revision
```

The intended workflow connects student responses with learning analysis and actionable improvement.

## Platform Architecture

MEDHA is built as a web-based application with separate experiences for students, teachers, and administrators.

Its architecture includes:

- Frontend application and role-based interfaces.
- Server-side API routes and business logic.
- Assessment and learning-analysis modules.
- Database persistence.
- AI integration and supported offline fallback mechanisms.

## Technology Stack

| Layer | Technology |
|---|---|
| Application Framework | Next.js |
| Frontend | React |
| Language | TypeScript |
| Runtime | Node.js |
| AI Integration | Google Gemini (configured workflows) |
| Data Storage | Existing server-side JSON database implementation |
| Architecture | Next.js App Router |

The exact dependencies and configuration are defined in `package.json` and the project source code.

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nikhilkunte645-maker/MEDHA.git
cd MEDHA
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Inspect the provided `.env.example` file.

Create your local environment file:

```bash
Copy-Item .env.example .env.local
```

Configure the required values using your own credentials.

Never commit `.env.local` or expose API keys.

### 4. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

### 5. Production build

```bash
npm run build
npm run start
```

## Project Structure

```text
MEDHA/
├── public/
│   └── brand/
│       └── medha-banner-final.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   └── ...
│   └── lib/
│       └── server/
├── data/
│   └── medha_seed.json
├── scripts/
├── package.json
├── .env.example
└── README.md
```

*This is a high-level representation. Refer to the repository for the complete and current structure.*

## Project Objectives

MEDHA aims to:

1. Make learning more personalized.
2. Help students identify conceptual weaknesses.
3. Make learning progress easier to understand.
4. Provide teachers with actionable academic insights.
5. Support continuous improvement through adaptive practice and revision.

## Future Scope

Potential areas of further development include:

- More advanced learner modeling.
- Richer concept dependency mapping.
- Expanded adaptive assessment capabilities.
- Deeper learning analytics.
- Improved accessibility and multilingual learning.
- Additional integrations with educational platforms.

These are future directions, not claims of already completed functionality.

## Security and Data

- Keep API keys and credentials in environment variables.
- Do not publish private student information.
- Follow role-based access restrictions.
- Use demo accounts and synthetic data for public demonstrations.
- Review database and deployment configuration before production use.

## Hackathon Project

MEDHA is developed as an AI-powered educational technology project exploring how adaptive intelligence can improve the learning experience.

The goal is not simply to measure student performance, but to make learning gaps more understandable and improvement more actionable.

---

<div align="center">

### MEDHA
**Learn Smarter. Understand Deeper. Grow Beyond Limits.**

Built with a vision to make learning more intelligent and personalized.

</div>
