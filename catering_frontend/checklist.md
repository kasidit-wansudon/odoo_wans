# 📋 Checklist สำหรับ Catering Frontend - Edit/Export/Import

## ✅ **Core Functionality Checks**

- [x] **Dashboard** - CSV import/export พร้อม BOM prefix สำหรับภาษาไทย
- [x] **Recipes** - Inline edit (costPerPlate, margin) + CSV import/export พร้อม BOM
- [x] **Factories** - Inline edit (capacityPerDay, activeContracts) + CSV import/export พร้อม BOM
- [x] **Pricing** - Inline edit (recommendedPrice) + CSV import/export พร้อม BOM
- [x] **Quotes** - Inline edit (pricePerHead) + CSV import/export พร้อม BOM
- [x] **Procurement** - CSV import/export พร้อม BOM + Edit button ลิงก์ไป create page
- [x] **Kitchens** - CRUD เต็มรูปแบบ + CSV import/export พร้อม BOM

## 🔧 **Technical Checks**

- [x] **ProcurementForm Component** - Shared form ทำงานได้ทั้ง create/edit ด้วย query param
- [ ] **BOM Fix** - ทุก CSV export มี BOM prefix (﻿) เพื่อรักษาภาษาไทย
- [x] **TypeScript Build** - Compile ได้โดยไม่มี error
- [x] **Lint Errors** - แก้ไขให้เหลือน้อยที่สุด

## 🧪 **Testing Checks**

- [x] **Inline Editing** - ทดสอบการแก้ไข inline บนทุกหน้า
- [x] **CSV Import** - ทดสอบ import พร้อม preview modal บนทุกหน้า
- [x] **CSV Export** - ทดสอบ export รักษาภาษาไทยได้ถูกต้อง

---

*สร้างเมื่อ:* Dec 21, 2025
*สถานะ:* เริ่มการตรวจสอบ
