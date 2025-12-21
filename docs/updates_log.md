# Update Log

## 2025-12-20
- Added Next.js frontend mock cockpit (`catering_frontend/`) with Recipe & Costing, Procurement alerts, Stock snapshot, Production plan, and Mock→Odoo roadmap sections.
- Implemented mock CSV import/export workflow for recipes and stock levels (status indicators + download templates) per user request.

## 2025-12-21
- Frontend build-out progress ≈65%: dedicated pages (Recipes/Factories/Pricing/Quotes/Procurement/Stock) now wired with KPI cards, graphs, and Thai UI copy.
- Recipes page: KPI cards + factory capacity chart + menu proportion bars + risk list + mock form `/recipes/new` (≈90%).
- Factories page: capacity vs contracts chart, quote timeline, factory roster table, procurement snapshot cards (≈75%).
- Pricing page: ingredient trend area chart, price book table w/ variance chips, low-cost recipe list, risky items panel (≈70%).
- Quotes page: pipeline table (status chips), detail preview, `/quotes/new` form with revenue simulation (≈60%).
- Procurement page: KPI cards, supplier spend chart, PO table with detail panel + Print mock (preview → window.print), `/procurement/new` form (≈70%).
- Stock page: coverage snapshot, risk list, stock adjustment logs (≈60%).
- Created `docs/todo_overview.md` with detailed per-module checklist (status %, frontend/backend tasks) to guide next iterations.
- Recipes module now maps each recipe to ingredient BOM + interactive detail panel, and adds mock calendar (`recipeSchedules`) for planning PO/stock requirements (frontend mock only).
- Added navigation "← หน้าแรก" in header of Recipes and Factories pages for better UX.
- Created SVG logo (spoon and fork) and set as favicon in public/favicon.svg, updated layout.tsx metadata.
- Improved UI layout in dashboard Import/Export section: changed to responsive grid, adjusted buttons to justify-between.

## Run Instructions
- Navigate to `catering_frontend/` directory.
- Run `npm install` to install dependencies.
- Run `npm run dev` to start development server (Next.js App Router).
- Open browser at `http://localhost:3000` to view the mock cockpit.
- Note: All data is mock, no real Odoo integration yet.
