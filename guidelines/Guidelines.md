# System Guidelines

These guidelines define how the AI should generate layouts, components and structures
for a Swiss digital financial planning web application.

The goal is clarity, trust, consistency and decision support.
Avoid visual noise and unnecessary creativity.

--------------------------------------------------
# General guidelines

* Design Desktop-first, but ensure layouts are responsive and structured
* Prefer grid-based layouts with clear vertical and horizontal rhythm
* Use Cards as the primary layout container
* Group related information visually and semantically
* Avoid decorative elements that do not add meaning
* Prioritize readability and data clarity over visual flair
* Do not overload screens — prefer progressive disclosure
* All monetary values are in CHF
* Use Swiss financial terminology (BVG, Säule 3a, Kanton)
* Labels and UI text should be concise and neutral
* Avoid marketing language inside the UI

--------------------------------------------------
# Information architecture

* The product revolves around four core objects:
  - User
  - Personal Profile
  - Variant (financial plan scenario)
  - Task / Action

* Variants are first-class objects and must be clearly distinguishable
* Every dashboard or chart must clearly reference the active variant
* Inputs affect projections immediately (real-time feedback)
* Outputs must always be clearly separated from inputs

--------------------------------------------------
# Design system guidelines

## Typography

* Use a modern, neutral sans-serif font
* Clear hierarchy:
  - Page title
  - Section title
  - Card title
  - Body text
  - Helper / meta text
* Numbers (CHF, percentages, years) must be highly legible
* Avoid overly large headings; data density is important

--------------------------------------------------
## Color usage

* Primary color: dark blue or petrol (trust, stability)
* Secondary color: green (positive outcome, growth)
* Warning / optimization color: orange
* Neutral greys for backgrounds, dividers and secondary text
* Never rely on color alone to convey meaning
* Charts must be readable in grayscale

--------------------------------------------------
## Layout & spacing

* Use consistent spacing tokens throughout the app
* Align elements cleanly to the grid
* Avoid center-aligned long text
* Dashboards should feel modular and scannable
* Do not mix too many layout styles on one page

--------------------------------------------------
# Components

## Cards

* Cards are the main structural unit
* Each card should have a clear purpose
* One primary idea per card
* Cards may contain:
  - Inputs
  - KPIs
  - Charts
  - Text explanations
* Avoid overly tall cards

--------------------------------------------------
## Sliders & Inputs

* Sliders are preferred for numeric financial inputs
* Always show the numeric value next to the slider
* Allow direct numeric input in addition to sliders
* Clearly label units (CHF, %, years)
* Inputs should immediately affect charts and KPIs

--------------------------------------------------
## Charts

* Charts are used to explain outcomes, not to decorate
* Always label axes clearly
* Show time progression clearly (e.g. today → pension)
* Prefer line charts for projections
* Avoid stacked charts unless comparison is explicit
* Use subtle gridlines
* Highlight the active variant visually
* If assumptions are simplified, show a small disclaimer

--------------------------------------------------
## Buttons

Buttons trigger actions or navigation and should be used intentionally.

### Primary Button
* Purpose: Main action on a page or section
* Visual style: Filled, primary color
* Usage:
  - One primary button per section
  - Examples: “Save variant”, “Create profile”

### Secondary Button
* Purpose: Supporting or alternative actions
* Visual style: Outlined or subtle fill
* Usage:
  - Can appear next to a primary button
  - Examples: “Duplicate variant”, “Edit”

### Tertiary Button
* Purpose: Low-emphasis actions
* Visual style: Text-only
* Usage:
  - Examples: “Learn more”, “View details”

--------------------------------------------------
## Dropdowns

* Use dropdowns only if there are more than 2 options
* Clearly label the selected value
* Common use cases:
  - Variant selection
  - Canton selection
  - Investment strategy selection

--------------------------------------------------
# Dashboards

* Dashboards should give instant orientation
* Show:
  - Active variant
  - Key KPIs
  - Current status (e.g. optimized / actionable)
* Avoid long explanatory text on dashboards
* Use visual hierarchy to guide attention

--------------------------------------------------
# Tasks & actions

* Tasks must be concrete and actionable
* Tasks should feel achievable and specific
* Show task status (open / done)
* Tasks should clearly connect to the selected variant
* Avoid generic tasks without context

--------------------------------------------------
# Optimization & insights

* Optimization suggestions should be:
  - Specific
  - Explainable
  - Quantified where possible (CHF impact)
* Each optimization may link to:
  - Knowledge articles
  - Insights
* Avoid overwhelming the user with too many suggestions at once

--------------------------------------------------
# Tone & UX principles

* Calm, professional, empowering
* Never alarming or sales-driven
* The UI should make the user feel:
  - In control
  - Informed
  - Supported
* The system explains complexity through structure, not text
