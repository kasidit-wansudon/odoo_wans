# Project TODO Overview (Mock Integration)

> สถานะทั้งหมดเป็น mock ยังไม่เชื่อม Odoo production

## High-Level Modules

| Module / Page | Status | Frontend Progress | Backend / Integration | Notes |
| --- | --- | --- | --- | --- |
| **Dashboard / Control Tower** | 60% | ✅ Insight cards, cost/margin chart, recipe table<br>⏳ Data-source toggle UI | ⏳ Aggregation endpoints to pull Odoo KPIs<br>⏳ Auth/config manager | รอ service layer mock→real |
| **Recipes (`/recipes`, `/recipes/new`)** | 95% | ✅ KPI, table, factory chart, create-form mock, search/filter<br>⏳ Inline edit | ⏳ `RecipeService` (CRUD sync Odoo)<br>⏳ Import/export actual Excel | พร้อมเชื่อม API |
| **Factories (`/factories`)** | 75% | ✅ Capacity & contract charts, PO snapshot<br>⏳ Filter per plant, SLA cards | ⏳ Factory sync job + SLA data | ต้องเสริม interaction |
| **Pricing (`/pricing`)** | 70% | ✅ Trend chart, price book table, risk lists<br>⏳ Edit modal, compare view | ⏳ PriceBook provider (ERP)<br>⏳ Cost baseline service | |
| **Quotes (`/quotes`, `/quotes/new`)** | 70% | ✅ Pipeline table, mock form w/ preview, search/filter<br>⏳ Detail drawer | ⏳ Quote API + PDF exporter<br>⏳ Client directory sync | |
| **Procurement (`/procurement`, `/procurement/new`)** | 80% | ✅ KPI cards, supplier spend chart, detail panel + Print mock, form mock, table filters<br>⏳ Multi-item preview | ⏳ PO sync (create/update)<br>⏳ Stock impact hook | Print mock already available |
| **Stock (`/stock`)** | 60% | ✅ Coverage table, risk cards, log list<br>⏳ Search + plant filter | ⏳ StockService w/ threshold alerts | |
| **Docs / Ops** | 70% | ✅ Concept doc & TODO overview, updates log, service interfaces<br>⏳ Runbook, environment instructions | ⏳ Deployment checklist, secrets handling | |

## Detailed Task List

### Module Drill-down

#### Dashboard / Control Tower
- **UI Done:** Insight cards (ต้นทุน/กำไร/production/spoilage), recipe table, production plan module, import/export mock buttons.
- **UI Pending:** Global filter (โรงครัว/ช่วงเวลา), quick action shortcuts, status badges for data source (mock/real).
- **Backend Pending:** Aggregated KPI endpoint (recipes + procurement), caching strategy, config toggle for different Odoo env.

#### Recipes Module
- **Pages:** `/recipes` (list + charts), `/recipes/new` (form mock).
- **Frontend Done:** KPI cards, factory capacity bar chart, risk panel, menu structure bars, mock form with revenue simulation, search/filter, shared detail drawer.
- **Frontend Pending:** Inline edit (cost/margin), CSV upload preview, table pagination.
- **Backend Pending:** `RecipeService` (CRUD + BOM retrieval), Excel import/export wired to storage, connection to Odoo `mrp.bom`.

#### Factories Module
- **Frontend Done:** Capacity vs contracts chart, quote timeline graph, factory roster table, PO snapshot list.
- **Frontend Pending:** SLA compliance widgets, filter by region, ability to drill into plant detail.
- **Backend Pending:** Factory status sync, SLA metrics ingestion, mapping to Odoo `stock.warehouse` / custom fields.

#### Pricing Module
- **Frontend Done:** Ingredient price trend (AreaChart), price book table, cost-leader list, risk items highlight.
- **Frontend Pending:** Modal for editing price book, compare view (current vs proposed), alerts for variance threshold.
- **Backend Pending:** PriceBook provider (pull from ERP/Odoo), cost baseline calculations, storing historical pricing.

#### Quotes Module
- **Frontend Done:** Pipeline table with status chips, mock quote form (`/quotes/new`) incl. preview panel, search/filter.
- **Frontend Pending:** Detail drawer for existing quotes, attach files (mock).
- **Backend Pending:** Quote API integration, PDF generation, client directory sync from CRM/Odoo `sale.order`.

#### Procurement Module
- **Frontend Done:** KPI cards, supplier spend chart, table with inline print buttons, detail panel + Print PDF mock, `/procurement/new` form, table filters, shared detail drawer.
- **Frontend Pending:** Multi-item preview, upload supporting docs (mock).
- **Backend Pending:** PO sync (create/update) with Odoo `purchase.order`, warehouse receipt hook, linkage to stock impact.

#### Stock Module
- **Frontend Done:** Coverage snapshot table, risk list, stock adjustment logs.
- **Frontend Pending:** Filters by kitchen, chart for trend, alert threshold configuration UI.
- **Backend Pending:** StockService pulling from Odoo `stock.quant`, alerting when coverage < X days, integration with procurement adjustments.

#### Docs / Ops
- **Done:** Concept doc, TODO overview, detailed updates log, service interfaces design.
- **Pending:** Runbook, environment toggle instructions, deployment checklist, secrets handling (API keys).

### Frontend (Next.js + Tailwind)
#### Completed
- [x] Setup Next.js (App Router) + Tailwind + custom fonts/theme
- [x] Main dashboard UI + initial charts
- [x] Route scaffolding: `/recipes`, `/factories`, `/pricing`, `/quotes`, `/procurement`, `/stock`
- [x] Mock forms: `/recipes/new`, `/quotes/new`, `/procurement/new`
- [x] Procurement: summary cards + supplier spend chart + detail panel + Print mock
- [x] Search/filter components (table-level) across recipes, procurement, quotes modules
- [x] Shared layout for detail drawers (recipes, PO, quotes)
- [x] UI fixes in recipes/new (layout adjustments, input sizes)

#### In Progress / Remaining
- [ ] Search / filter components (table-level) across modules
- [ ] Shared layout for detail drawers (quotes, PO, recipes)
- [ ] Environment toggle (mock vs real API) + placeholder states
- [ ] Error/empty states for each module

### Backend / Integration Prep
- [x] Define service interfaces (`RecipeService`, `POService`, `QuoteService`, `StockService`)
- [x] Choose stack (NestJS/Go) for Odoo XML-RPC/JSON-RPC bridge
- [ ] Auth/config management (API key, DB name, endpoints)
- [ ] Data mapping (Odoo models ↔ internal schema)
- [ ] Queue/caching strategy for high-volume modules (recipes/PO)

### Ops / Documentation
- [x] `docs/catering_mock_concept.md` (concept scope)
- [x] `docs/todo_overview.md` (this file, detailed)
- [x] `docs/updates_log.md` (detailed progress log)
- [x] `docs/service-interfaces.md` (service design)
- [ ] Runbook + deployment instructions
- [ ] Data-source toggle guide (mock → real)

## Next Suggested Steps
1. Implement RecipeService backend (NestJS) for Odoo integration
2. Add detail drawer for quotes page
3. Add inline edit functionality in recipes table
4. Implement auth/config management for Odoo connection
5. Add environment toggle (mock vs real API)
