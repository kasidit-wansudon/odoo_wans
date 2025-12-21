"use client";

import Link from "next/link";
import { factories, quotes } from "@/data/mock-dashboard";
import { useMemo, useState } from "react";

const mockClients = [
  "Alpha Robotics",
  "Eastern Tech Park",
  "LogiPort DC",
  "Mega Electronics",
];

export default function NewQuotePage() {
  const [form, setForm] = useState({
    client: mockClients[0],
    plant: factories[0]?.name ?? "",
    mealCount: 600,
    pricePerHead: 75,
    note: "",
    includeSnacks: false,
    effectiveDate: "2026-01-15",
    status: "ร่าง" as "ร่าง" | "ส่งแล้ว" | "อนุมัติ",
  });

  const estimatedRevenue = useMemo(
    () => form.mealCount * form.pricePerHead,
    [form.mealCount, form.pricePerHead],
  );

  const handleChange = (
    field: keyof typeof form,
    value: string | number | boolean,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/60 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-4xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Quote composer (mock)
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-ink tracking-tight">
                สร้างใบเสนอราคาใหม่
              </h1>
              <p className="text-ink/70 mt-2 max-w-2xl">
                ฟอร์มตัวอย่างสำหรับทดลองกรอกข้อมูลลูกค้า ปริมาณมื้อ ราคาต่อหัว และ option
                เพิ่มเติม ก่อนส่งเข้าระบบจริง
              </p>
            </div>
            <Link
              href="/quotes"
              className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5"
            >
              ← กลับไปหน้าใบเสนอราคา
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="font-display text-xl">ข้อมูลลูกค้า</h2>
              <div className="grid gap-4">
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  ลูกค้า
                  <select
                    value={form.client}
                    onChange={(e) => handleChange("client", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    {mockClients.map((client) => (
                      <option key={client}>{client}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  โรงครัวที่ให้บริการ
                  <select
                    value={form.plant}
                    onChange={(e) => handleChange("plant", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    {factories.map((factory) => (
                      <option key={factory.name}>{factory.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  โน้ตเพิ่มเติม
                  <textarea
                    value={form.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    rows={3}
                    placeholder="เช่น ต้องการเมนูสุขภาพ 70% หรือมีรายการแพ้อาหาร"
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl">ตัวเลขใบเสนอราคา</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  จำนวนหัว/มื้อ
                  <input
                    type="number"
                    value={form.mealCount}
                    onChange={(e) => handleChange("mealCount", Number(e.target.value))}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  ราคาต่อหัว (บาท)
                  <input
                    type="number"
                    value={form.pricePerHead}
                    onChange={(e) => handleChange("pricePerHead", Number(e.target.value))}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
              </div>
              <label className="text-sm text-ink/70 flex flex-col gap-1">
                วันที่มีผล (Effective date)
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => handleChange("effectiveDate", e.target.value)}
                  className="rounded-2xl border border-ink/10 px-4 py-3"
                />
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="snacks"
                  type="checkbox"
                  checked={form.includeSnacks}
                  onChange={(e) => handleChange("includeSnacks", e.target.checked)}
                  className="size-4"
                />
                <label htmlFor="snacks" className="text-sm text-ink/80">
                  รวมชุดของว่าง/กาแฟ ในใบเสนอราคานี้
                </label>
              </div>
              <label className="text-sm text-ink/70 flex flex-col gap-1">
                สถานะ (mock)
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value as typeof form.status)}
                  className="rounded-2xl border border-ink/10 px-4 py-3"
                >
                  <option value="ร่าง">ร่าง</option>
                  <option value="ส่งแล้ว">ส่งแล้ว</option>
                  <option value="อนุมัติ">อนุมัติ</option>
                </select>
              </label>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel"
              >
                บันทึก (mock)
              </button>
              <button className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export PDF
              </button>
            </div>
          </form>

          <aside className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clay/60 font-semibold">
                Summary
              </p>
              <h2 className="font-display text-2xl">Quick preview</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-clay/70">ลูกค้า</p>
                <p className="text-xl font-semibold">{form.client}</p>
              </div>
              <div>
                <p className="text-clay/70">โรงครัว</p>
                <p className="text-lg font-semibold">{form.plant}</p>
              </div>
              <div>
                <p className="text-clay/70">จำนวนหัว</p>
                <p className="text-2xl font-display">
                  {form.mealCount.toLocaleString()} หัว/มื้อ
                </p>
              </div>
              <div>
                <p className="text-clay/70">ราคาต่อหัว</p>
                <p className="text-2xl font-display">฿{form.pricePerHead.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-clay/70">รายได้คาดการณ์ (ต่อวัน)</p>
                <p className="text-3xl font-display">
                  ฿{estimatedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-clay/70">สถานะ</p>
                <p className="text-lg font-semibold">{form.status}</p>
              </div>
              <p className="text-xs text-clay/70">
                ข้อมูลนี้เป็น mock ยังไม่บันทึกหรือส่งออกไป Odoo จริง ใช้เพื่อสาธิต UX เท่านั้น
              </p>
            </div>
          </aside>
        </div>

        <section className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">ใบเสนอราคาที่เคยทำ</h2>
            <span className="text-xs text-ink/60">mock data</span>
          </div>
          <div className="grid gap-3 text-sm">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="rounded-2xl border border-ink/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{quote.id}</p>
                  <p className="text-xs text-ink/60">{quote.client}</p>
                </div>
                <p className="text-ink/70">{quote.plant}</p>
                <p className="font-semibold">฿{quote.pricePerHead}</p>
                <span className="text-xs text-ink/60">{quote.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
