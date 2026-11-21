# MEDHA — DESIGN SYSTEM SPECIFICATION
## "The Intelligent Learning Studio"
**Autonomous Product Design Architecture · Class 10 Physics (Electricity)**  
**Version:** 2.0.0-STUDIO  
**Date:** November 21, 2026

---

## 1. DESIGN PHILOSOPHY & IDENTITY

MEDHA is an adaptive learning intelligence platform, not a gaming dashboard or a generic school form. Its visual direction blends:
- **Editorial Dignity:** High legibility, intentional whitespace, thoughtful typographic scale.
- **Scientific Visualization:** Precision graphs, crisp circuit schematics, clear mathematical notation.
- **Calm, High-Agency Engagement:** Feedback that clarifies rather than penalizes; progress metrics grounded in real evidence.

---

## 2. COLOR ARCHITECTURE (LIGHT-FIRST STUDIO PALETTE)

### Core Canvas & Surfaces
| Token | Hex | Role |
| :--- | :--- | :--- |
| `canvas` / `surface-deep` | `#F7F7F4` | Warm, architectural paper foundation. Avoids harsh stark white glare. |
| `surface` | `#FFFFFF` | Primary content surface. Crisp, immaculate card and panel canvas. |
| `surface-secondary` | `#F0F1F4` | Soft neutral wash for secondary containers, chips, and table headers. |
| `surface-higher` | `#F8F9FD` | Subtle cobalt-tinted highlight surface for active states. |
| `border` / `outline-variant` | `#E8E9ED` | Delicate 1px structural boundary. Eliminates heavy borders. |
| `border-strong` | `#D1D5DB` | Focus and active boundary contrast. |

### Ink & Typography
| Token | Hex | Role |
| :--- | :--- | :--- |
| `text-primary` | `#171923` | Deep warm charcoal ink. High contrast (14:1) on white. |
| `text-secondary` | `#697080` | Refined editorial slate for supporting narratives, captions, metadata. |
| `text-muted` | `#9CA3AF` | Subtle secondary indicators and placeholders. |
| `text-inverse` | `#FFFFFF` | Text on saturated accent buttons. |

### Brand Accents & Cognitive State
| Token | Hex | Role |
| :--- | :--- | :--- |
| `accent-primary` / `cobalt` | `#435FE8` | Primary intellect accent: active actions, interactive nodes, primary CTAs. |
| `accent-primary-light` | `#EEF2FF` | 10% cobalt wash for active badges and subtle background highlights. |
| `accent-secondary` / `teal` | `#168F83` | Scientific inquiry accent: prerequisite pathways, formula cards, telemetry. |
| `accent-warm` | `#E9A63A` | Warm cognitive alert: revision reminders, attention required, notes. |

### Mastery Status Tokens (Pedagogical Evidence)
| Status | Accent | Light Surface Wash | Meaning |
| :--- | :--- | :--- | :--- |
| **Mastered** | `#10B981` (Emerald) | `#ECFDF5` | Evidence score $\ge 80\%$, sound reasoning demonstrated. |
| **Learning** | `#F59E0B` (Amber) | `#FFFBEB` | Evidence score $40\%\text{--}79\%$, developing conceptual understanding. |
| **At Risk** | `#EF4444` (Coral Red) | `#FEF2F2` | Latent misconception detected or evidence score $<40\%$. Non-punitive. |
| **Unassessed** | `#94A3B8` (Slate) | `#F1F5F9` | No diagnostic or practice evidence yet collected. Zero fabricated score. |

---

## 3. TYPOGRAPHY & HIERARCHY

- **Primary Heading Font:** `Plus Jakarta Sans`, `system-ui`, `-apple-system`, `sans-serif`
  - Weights: `600 (SemiBold)`, `700 (Bold)`, `800 (ExtraBold)`
  - Tracking: `-0.02em` (Crisp editorial tension)
- **Body & Interface Font:** `Inter`, `sans-serif`
  - Weights: `400 (Regular)`, `500 (Medium)`, `600 (SemiBold)`
  - Line height: `1.5` to `1.6` for long-form explanations
- **Mathematical & Telemetry Font:** `JetBrains Mono`, `monospace`
  - For formula variables, concept IDs (`C01`–`C09`), timestamps, and percentages.

---

## 4. SHADOWS & ELEVATION

Heavy neon blurs and glowing borders have been replaced with natural architectural diffusion:
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Subtle separation)
- `shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)` (Default component card)
- `shadow-elevated`: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)` (Hover & interactive states)
- `shadow-float`: `0 12px 24px -4px rgba(0, 0, 0, 0.08)` (Modals, drawers, floating toolbars)
- `shadow-cobalt`: `0 4px 14px 0 rgba(67, 95, 232, 0.20)` (Primary action CTA button)

---

## 5. INTERACTION PATTERNS & COMPONENT GUIDELINES

1. **Editorial Hero:** Avoids giant marketing banners; features a personalized, data-derived progress narrative.
2. **Next-Best-Action Canvas:** Single prominent recommendation directly derived from lowest mastery or detected misconception.
3. **Reasoning Canvas:** A welcoming, focused workspace inviting students to type out their physical intuition.
4. **Comparative Misconception Card:** Clear visual split: *"What you thought"* (student reasoning) vs. *"What actually happens in physics"* (scientific principle + circuit schematic).
5. **Interactive Concept Graph:** Crisp SVG topological layout with hover effects, dependency line illumination, and detailed concept inspection drawer.
6. **Teacher Heatmap Matrix:** Clean high-density matrix with clear status pill cells and instant student drill-down drawer.
