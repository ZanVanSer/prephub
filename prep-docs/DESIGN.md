# Design System Strategy: The Fluid Architect

## 1. Overview & Creative North Star
The "Fluid Architect" is the creative North Star for this design system. It moves beyond the rigid, boxy constraints of traditional SaaS dashboards to create an environment that feels more like a high-end physical workspace than a digital interface. 

By leveraging **intentional asymmetry**, **tonal depth**, and **editorial-grade typography**, we transform a standard utility into a premium experience. The goal is "Effortless Efficiency"—a layout that breathes through expansive white space (`spacing.16` and `spacing.20`) and replaces harsh structural lines with soft, organic transitions. We aren't just building a dashboard; we are curating a digital sanctum where data feels light, modular, and manageable.

---

## 2. Colors: The "No-Line" Philosophy
In this system, we prohibit the use of 1px solid borders for sectioning. Structural integrity is achieved through **Surface Hierarchy** rather than outlines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium paper stocks. Use the `surface-container` tiers to define depth:
- **Base Layer:** Use `surface` (#f7f9fb) for the primary application backdrop.
- **Sectioning:** Use `surface-container-low` (#f0f4f7) to define large functional areas like the sidebar or secondary panels.
- **Content Blocks:** Use `surface-container-lowest` (#ffffff) for primary cards or data tables to create a "natural lift."

### The "Glass & Gradient" Rule
To inject "soul" into the minimal palette:
- **Glassmorphism:** For floating elements (modals, dropdowns, or the collapsible sidebar in its expanded state), use `surface-container-lowest` at 80% opacity with a `backdrop-blur` of 20px.
- **Signature Gradients:** For primary CTAs and progress indicators, use a subtle linear gradient transitioning from `primary` (#494bd6) to `primary_dim` (#3c3dca) at a 135-degree angle. This prevents the purple accent from feeling "flat."

---

## 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for high-level headers with the utilitarian clarity of **Inter** for data and UI controls.

- **Display & Headline (Manrope):** Use `display-lg` to `headline-sm` for page titles and hero metrics. These should be set with tight letter-spacing (-0.02em) to feel authoritative and bespoke.
- **Body & Labels (Inter):** Use `body-md` for standard text and `label-sm` for micro-copy. 
- **The Hierarchy Rule:** Never use bold weights for body text; instead, use color shifts (transitioning from `on_surface` to `on_surface_variant`) to create emphasis. This maintains the "Minimal" aesthetic without adding visual "weight."

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a fallback, not a standard. We achieve dimension through **Ambient Light Physics**.

- **The Layering Principle:** A `surface-container-lowest` card sitting on a `surface-container-low` background provides enough contrast to be perceived as a separate "object" without a single pixel of stroke or shadow.
- **Ambient Shadows:** When an element must float (e.g., a triggered Popover), use a shadow with a blur radius of `xl` (approx 40px-60px) at 6% opacity. Use a tint of the brand color: `rgba(73, 75, 214, 0.06)` instead of pure black.
- **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline_variant` (#a9b4b9) token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Modular Primitives

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_dim`), `on_primary` text, `rounded-md` (1.5rem).
- **Secondary:** `surface-container-high` background with `on_secondary_container` text. No border.
- **Tertiary:** Ghost style. `on_surface_variant` text, shifting to a `surface-container-low` background on hover.

### Input Fields & Controls
- **Text Inputs:** Use `surface-container-highest` with a `rounded-sm` (0.5rem) corner. The label should use `label-md` and sit outside the container to maintain a clean internal field.
- **Checkboxes/Radios:** Use `primary` for active states. Use `rounded-sm` for checkboxes to mirror the system’s overall "softness."

### Cards & Lists
- **The Divider Ban:** Strictly forbid `hr` tags or 1px dividers. Separate list items using `spacing.3` (1rem) of vertical white space or alternating backgrounds between `surface` and `surface-container-low`.
- **Large Border Radius:** All primary containers must use `rounded-lg` (2rem) to reinforce the friendly, modular personality.

### The "Global Command" Header
- **Layout:** A `surface-container-lowest` bar at the top with a subtle `surface-tint` glow at the bottom edge (2px blur). Use `spacing.4` internal padding.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** Use a wider right margin than left to create an editorial, "curated" feel in the dashboard.
- **Layer with Purpose:** Always ask "can I define this section with a background color shift before I reach for a border?"
- **Use Large Radii:** Stick to `rounded-lg` (2rem) for all main dashboard widgets to maintain the brand’s "Soft Minimal" DNA.

### Don’t:
- **Don't use 100% Black:** Never use #000000. Use `on_background` (#2a3439) for maximum readability and a premium feel.
- **Don't Crowd the Sidebar:** The collapsible sidebar should feel like a "floating spine." Ensure a minimum of `spacing.6` (2rem) between icons and the edge of the container.
- **Don't Over-shadow:** If every card has a shadow, the interface becomes heavy. Reserve shadows only for elements that literally "sit on top" of others (Modals, Tooltips).

---

## 7. Design Tokens (Strict Values)

### Colors

primary: #494bd6  
primary_dim: #3c3dca  

surface: #f7f9fb  
surface_container_low: #f0f4f7  
surface_container_lowest: #ffffff  

text_primary: #2a3439  
text_secondary: #6b7a80  

outline_variant: #a9b4b9  

---

### Radius

small: 8px  
medium: 16px  
large: 32px  

---

### Spacing

xs: 4px  
sm: 8px  
md: 16px  
lg: 24px  
xl: 32px  

---

### Shadows

ambient:
- blur: 40px
- opacity: 0.06
- color: rgba(73, 75, 214, 0.06)

---

## 8. Implementation Rules (For Development)

- Do NOT use borders for layout (no 1px lines)
- Use background color differences for separation
- Use spacing instead of dividers
- Use large border radius for main containers
- Use gradients only for primary actions
- Avoid heavy shadows
- Avoid pure black (#000000)

Important:
- Follow PRD.md for features
- Follow UX.md for layout
- Use DESIGN.md only for visual styling

Do NOT implement any demo elements from design mockups that are not defined in PRD.

---

## 9. Component Mapping

### Button

Primary:
- gradient background (primary → primary_dim)
- white text
- rounded (16px)

Secondary:
- light background (surface_container_low)
- dark text

---

### Card

- background: white
- radius: 32px
- no border
- no shadow (default)

---

### Sidebar

- background: surface_container_low
- active item: highlighted with subtle background
- collapsible (icons only)

---

### Header

- background: surface_container_lowest
- minimal
- no borders

---

## 10. Scope Clarification

Some visual elements in design mockups are for demonstration only.

Do NOT implement:
- extra dashboard widgets
- placeholder features
- any UI not defined in PRD.md

PRD.md is the source of truth for functionality.


---

## 11. Design vs Implementation

Screenshots and visual mockups represent **visual style and layout inspiration only**.

Do NOT implement:
- extra modules not defined in PRD.md
- promotional or marketing blocks (e.g., feature banners)
- placeholder or demo features (e.g., analytics, asset manager, etc.)

Use screenshots ONLY for:
- spacing and layout proportions
- color usage and hierarchy
- component styling (cards, buttons, sidebar, etc.)

PRD.md remains the **source of truth for functionality**.
