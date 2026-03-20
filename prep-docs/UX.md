# 🧩 ToolHub — UX Wireframe (MVP)

---

## 1. Overall Layout (App Shell)

```
+--------------------------------------------------+
| Header                                           |
|--------------------------------------------------|
| Sidebar        | Main Content                    |
|                |                                |
|                |                                |
|                |                                |
+--------------------------------------------------+
```

---

## 2. Header

Purpose: Global navigation and user control

```
[ Logo ]                         [ User Avatar ▾ ]
                                 └ Profile
                                 └ Logout
```

---

## 3. Sidebar (Navigation)

Purpose: Primary navigation between modules (always visible)

### Expanded State (default)

```
[ Logo ]

[ Dashboard ]

--- Tools ---
[ 🖼 ImPrep ]
[ ⚙️ MJ Tool  ]
```

### Collapsed State

```
[ ☰ ]

[ 🏠 ]
[ 🖼 ]
[ ⚙️ ]
```

### Behavior
- User can toggle sidebar (expand / collapse)
- Collapsed state shows icons only
- Tooltips appear on hover (e.g., "Image Prep")
- Sidebar is used for navigation at all times

---

## 4. Dashboard Page

Purpose: Landing page after login

```
Welcome back, [User]

[ Tool Card ]   [ Tool Card ]
[ Image Prep ]  [ MJ Tool  ]
```

### Behavior
- Click card → opens module
- Only enabled modules shown
- Dashboard is not required for navigation, but serves as entry point

---

## 5. Module Page Layout

```
[ Module Title ]            [ Optional Actions ]

----------------------------------------------

[ Module Content Area ]
```

---

## 6. Module Integration Rules

- Modules render inside main layout
- Modules are isolated from each other
- Core logic remains unchanged
- Modules should not break global UI

---

## 7. Image Prep Module (Imprep)

- Keep existing layout and structure
- Do NOT redesign logic or flow
- Only adjust UI for consistency (spacing, typography, buttons)

---

## 8. MJ Tool Module

- Keep existing functionality and structure
- Adapt UI only for consistency

---

## 9. Error State

```
⚠️ Something went wrong in this module

[ Reload Module ]
```

- Other modules must continue working

---

## 10. Empty State

```
No tools available
```

---

## 11. Loading States

```
Loading dashboard...
Loading module...
```

---

## 12. Mobile Behavior

- Sidebar becomes hamburger menu
- Content stacks vertically

---

## 13. Design Principles

- Consistency
- Simplicity
- Unified experience

---

## 14. MVP Scope

### Included
- Authentication
- App shell (header + sidebar)
- Dashboard (tool cards)
- Module system
- Integration of existing tools
- Collapsible sidebar

### Not Included
- Subscriptions
- Admin panel
- Advanced settings

---

## Notes

- Dashboard is entry page only
- Sidebar is primary navigation
- Tools are integrated, not rebuilt
- System must remain modular and scalable
