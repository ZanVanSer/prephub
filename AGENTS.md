# ToolHub Agent Instructions

## Project Goal
Build a modular SaaS dashboard application (ToolHub) using Next.js that integrates multiple existing tools into a single unified interface.

---

## Core Principles

- Do NOT rewrite existing tools (e.g., imprep, mj-tool)
- Focus on integration, not rebuilding
- Preserve core logic of all existing tools
- Ensure UI consistency across all modules
- Maintain modular and scalable architecture

---

## Tech Stack

- Next.js (required)
- React
- Supabase (authentication)
- Optimized for Vercel deployment

---

## Architecture Guidelines

### App Structure
- Core app = dashboard + layout + navigation
- Modules = isolated tools integrated into the app

### Module Rules
- Each module must be independent
- Modules must not depend on each other
- Modules must not break the global app if they fail
- Modules should be easily removable or disable-able

---

## UI / UX Rules

- Follow UX.md as source of truth
- Sidebar is primary navigation (persistent)
- Dashboard is landing page after login
- Sidebar must support:
  - Expanded (icons + labels)
  - Collapsed (icons only with tooltips)

### Design Principles
- Consistency over creativity
- Minimal and clean UI
- One unified product feel (not separate apps)

---

## Integration Rules

- Existing tools must be adapted, not rebuilt
- Only adjust:
  - spacing
  - typography
  - layout alignment
  - shared components

- Avoid changing:
  - business logic
  - core functionality

---

## Development Approach

- Start with app shell (layout, sidebar, dashboard)
- Then integrate modules one by one
- Validate each module independently
- Keep changes incremental and testable

---

## Constraints

- Do not introduce unnecessary complexity
- Do not over-engineer architecture
- Do not tightly couple modules
- Keep code maintainable and simple

---

## Definition of Done

- User can log in
- Dashboard loads correctly
- Sidebar navigation works (expanded + collapsed)
- Modules are accessible and functional
- UI is consistent across modules
- Errors in one module do not affect others

---

## Notes

ToolHub is intended to evolve into a scalable modular SaaS platform.

Future features (not in scope now):
- Admin panel
- Subscription system
- User settings
- Additional modules

Focus on building a clean, extensible foundation.
