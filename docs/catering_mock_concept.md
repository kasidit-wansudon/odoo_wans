# Catering Contractor System (Mock Integration Concept)

## 1. วัตถุประสงค์
- สร้างระบบต้นแบบสำหรับบริษัทรับเหมาทำอาหารให้โรงงาน โดยยังไม่เชื่อมต่อ Odoo จริง (ใช้ mock data แทน)
- ครอบคลุมการจัดการสูตรอาหาร ต้นทุน การซื้อขาย การผลิตต่อจาน และเอกสารธุรกิจ เช่น ใบเสนอราคา
- ออกแบบสถาปัตยกรรมให้พร้อมเสียบ API key ของ Odoo เมื่อพร้อมจ่ายบริการ SaaS หรือย้ายไป On-Prem

## 2. เทคโนโลยีหลัก (ตาม Global Rules)
1. **Integration Service**: Go หรือ NestJS (Node.js 18) สำหรับสื่อสารกับ Odoo XML-RPC/JSON-RPC ในอนาคต
2. **Frontend**: Next.js (App Router) สำหรับหน้าเว็บหลัก / dashboard และ Vue 2 + Vant สำหรับโมดูลที่ต้อง reuse UI เดิม (ถ้ามี)
3. **Mock Data Layer**: JSON files หรือ SQLite ชั่วคราว พร้อม service wrapper เพื่อเปลี่ยนไปใช้ API จริงภายหลัง
4. **Tooling**: Node.js 18 สำหรับ build scripts/test และ Laravel (PHP 7.4) หากต้อง interop กับระบบ legacy ภายใน

## 3. โมดูลหลัก
### 3.1 Recipe & BOM Management
- นิยามสูตรอาหาร (Recipe) พร้อมส่วนประกอบ (BOM) โดยกำหนดปริมาณ, หน่วย, Yield ต่อ batch
- รองรับหมวดหมู่อาหาร (เช้า/กลางวัน/เย็น) และ tag สำหรับโรงงานแต่ละแห่ง
- คำนวณต้นทุนวัตถุดิบอัตโนมัติจาก mock procurement price list

### 3.2 Costing & Portion Control
- คำนวณต้นทุนต่อจาน (Cost per Plate) จากสูตร + ค่าแรง + ค่า overhead
- จำลอง margin และราคาขายตาม tier ลูกค้า/สัญญา
- Simulation "what-if" หากราคาวัตถุดิบเปลี่ยน

### 3.3 Procurement & Inventory Snapshot
- บันทึก mock PO / GRN สำหรับวัตถุดิบหลัก (เชื่อมกับ Excel import/export)
- แสดงสต็อกคงเหลือแบบง่ายเพื่อประเมินวัตถุดิบต่อ batch
- Mapping กับโมเดล `product.product` / `stock.move` ของ Odoo เพื่อเตรียมเชื่อมต่อจริง

### 3.4 Sales & Contract Management
- จัดการ quotation, contract สำหรับโรงงานลูกค้า: ค่าอาหารต่อหัว, SLA, ตารางส่งมอบ
- mock workflow: Draft → Sent → Approved → Active Contract
- สร้างเอกสารใบเสนอราคา (PDF) และบันทึกเงื่อนไขสำคัญ

### 3.5 Production & Daily Menu Planning
- กำหนดเมนูรายวัน/รายสัปดาห์ต่อโรงงาน พร้อมจำนวนพนักงานต่อมื้อ
- แตกสูตรเป็นปริมาณผลิตจริง และสร้าง work order mock เพื่อคำนวณต้นทุนรวมต่อวัน

### 3.6 Reporting & Export/Import
- Export Excel: Recipe list, Cost sheet, Daily production plan, Contract summary
- Import Excel: Raw material price list, Supplier catalog, Daily headcount
- Dashboard KPIs: ต้นทุนเฉลี่ยต่อหัว, Margin ตามโรงงาน, Top 5 วัตถุดิบสิ้นเปลือง

## 4. โครงสร้างข้อมูล (Mock)
| Entity | รายละเอียดหลัก | Mapping Odoo (อนาคต) |
| --- | --- | --- |
| `FactoryClient` | โรงงานลูกค้า, คนกินต่อมื้อ, SLA | `res.partner` + custom fields |
| `Recipe` | สูตร, yield, หมวดหมู่ | `mrp.bom` + `product.template` |
| `Ingredient` | วัตถุดิบ, หน่วย, ราคา | `product.product` |
| `CostSheet` | ต้นทุนต่อ batch/จาน, margin | custom model / `sale.order` line |
| `Contract` | ราคาต่อหัว, ระยะเวลา, สถานะ | `sale.subscription` หรือ custom contract |
| `PurchaseOrderMock` | PO, supplier, ราคา | `purchase.order` |
| `ProductionPlan` | เมนูรายวัน, จำนวน portion | `mrp.production` / `stock.move` |
| `ExportJob` | job บันทึกไฟล์ Excel | helper table / queue |

## 5. การจัดการ Mock Data
- เก็บไฟล์ JSON ในโฟลเดอร์ `mock_data/` หรือใช้ SQLite พร้อม seed script
- Service layer (Go/Nest) มี interface เดียวกับ client → เมื่อสลับเป็น Odoo API ให้ implement provider ใหม่
- เพิ่ม flag `data_source` (`mock` | `odoo`) ใน env เพื่อกำหนด provider อัตโนมัติ

## 6. ขั้นตอนต่อไป (หลังคุย concept)
1. ยืนยันโมดูล/ฟีเจอร์ที่จำเป็นใน MVP
2. ออกแบบ schema mock + API contract (REST/GraphQL) สำหรับ frontend
3. เตรียมชุด mock data เริ่มต้น (สูตร, วัตถุดิบ, ลูกค้า, PO)
4. สร้าง UI mock (Next.js dashboard + Vue module) เพื่อทดสอบ flow หลัก
5. วางแผน integration กับ Odoo: auth, model mapping, migration จาก mock ไปจริง

---
เอกสารนี้ใช้เป็นฐานพูดคุย concept และ scope ก่อนพัฒนาระบบจริงครับ
