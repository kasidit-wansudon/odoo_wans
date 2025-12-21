"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ProcurementItemRow = {
  name: string;
  qty: number;
  uom: string;
  price: number;
};

export type ProcurementStatus = "รออนุมัติ" | "สั่งซื้อแล้ว" | "รับเข้าแล้ว";

export interface ProcurementFormValues {
  supplier: string;
  kitchen: string;
  eta: string;
  status: ProcurementStatus;
  notes: string;
  includeQA: boolean;
}

interface ProcurementFormProps {
  title: string;
  description?: string;
  suppliers: string[];
  kitchens: string[];
  initialValues?: Partial<ProcurementFormValues>;
  initialItems?: ProcurementItemRow[];
  submitLabel?: string;
  cancelHref: string;
  onSubmit?: (payload: {
    values: ProcurementFormValues;
    items: ProcurementItemRow[];
    totalAmount: number;
  }) => Promise<void> | void;
}

const defaultItem: ProcurementItemRow = { name: "", qty: 0, uom: "กก.", price: 0 };

export default function ProcurementForm({
  title,
  description,
  suppliers,
  kitchens,
  initialValues,
  initialItems,
  submitLabel = "บันทึก",
  cancelHref,
  onSubmit,
}: ProcurementFormProps) {
  const [values, setValues] = useState<ProcurementFormValues>({
    supplier: initialValues?.supplier || suppliers[0] || "",
    kitchen: initialValues?.kitchen || kitchens[0] || "",
    eta: initialValues?.eta || new Date().toISOString().slice(0, 16),
    status: initialValues?.status || "รออนุมัติ",
    notes: initialValues?.notes || "",
    includeQA: initialValues?.includeQA ?? true,
  });

  const [items, setItems] = useState<ProcurementItemRow[]>(
    initialItems && initialItems.length > 0 ? initialItems : [defaultItem],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, row) => sum + row.qty * row.price, 0),
    [items],
  );

  const handleValueChange = (field: keyof ProcurementFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ProcurementItemRow, value: string | number) => {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, defaultItem]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit?.({ values, items, totalAmount });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/60 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-5xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Purchase order (mock)
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-ink tracking-tight">{title}</h1>
              {description && (
                <p className="text-ink/70 mt-2 max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            <Link
              href={cancelHref}
              className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5"
            >
              ← กลับไปหน้าจัดซื้อ
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-6"
            onSubmit={handleSubmit}
          >
            <section className="space-y-4">
              <h2 className="font-display text-xl">ข้อมูลหลัก</h2>
              <div className="grid gap-4">
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  Supplier
                  <select
                    value={values.supplier}
                    onChange={(e) => handleValueChange("supplier", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier}>{supplier}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  โรงครัวปลายทาง
                  <select
                    value={values.kitchen}
                    onChange={(e) => handleValueChange("kitchen", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    {kitchens.map((kitchen) => (
                      <option key={kitchen}>{kitchen}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  กำหนดส่ง (ETA)
                  <input
                    type="datetime-local"
                    value={values.eta}
                    onChange={(e) => handleValueChange("eta", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>

                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  สถานะ (mock)
                  <select
                    value={values.status}
                    onChange={(e) =>
                      handleValueChange("status", e.target.value as ProcurementStatus)
                    }
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    <option value="รออนุมัติ">รออนุมัติ</option>
                    <option value="สั่งซื้อแล้ว">สั่งซื้อแล้ว</option>
                    <option value="รับเข้าแล้ว">รับเข้าแล้ว</option>
                  </select>
                </label>

                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  โน้ตหรือเงื่อนไขเพิ่มเติม
                  <textarea
                    value={values.notes}
                    onChange={(e) => handleValueChange("notes", e.target.value)}
                    rows={3}
                    placeholder="เช่น ขอใบ COA ทุก lot หรือให้แช่เย็น 0-4°C"
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-ink/80">
                  <input
                    type="checkbox"
                    checked={values.includeQA}
                    onChange={(e) => handleValueChange("includeQA", e.target.checked)}
                    className="size-4"
                  />
                  แนบใบตรวจสอบคุณภาพ (QA checklist)
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">รายการวัตถุดิบ</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-pine font-semibold"
                >
                  + เพิ่มรายการ
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="grid gap-3 sm:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_auto] items-center"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      placeholder="ชื่อวัตถุดิบ"
                      className="rounded-2xl border border-ink/10 px-4 py-2"
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", Number(e.target.value))
                      }
                      className="rounded-2xl border border-ink/10 px-4 py-2"
                      placeholder="ปริมาณ"
                    />
                    <input
                      type="text"
                      value={item.uom}
                      onChange={(e) => handleItemChange(index, "uom", e.target.value)}
                      className="rounded-2xl border border-ink/10 px-4 py-2"
                      placeholder="หน่วย"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", Number(e.target.value))
                      }
                      className="rounded-2xl border border-ink/10 px-4 py-2"
                      placeholder="ราคา/หน่วย"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-ember hover:underline"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel"
              >
                {submitLabel}
              </button>
              <button
                type="button"
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
              >
                Export PDF
              </button>
            </div>
          </form>

          <aside className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clay/60 font-semibold">
                Summary
              </p>
              <h2 className="font-display text-2xl">ภาพรวมใบสั่งซื้อ</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-clay/70">Supplier</p>
                <p className="text-xl font-semibold">{values.supplier}</p>
              </div>
              <div>
                <p className="text-clay/70">โรงครัวปลายทาง</p>
                <p className="text-lg font-semibold">{values.kitchen}</p>
              </div>
              <div>
                <p className="text-clay/70">กำหนดส่ง</p>
                <p className="text-lg font-semibold">
                  {new Date(values.eta).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-clay/70">ยอดรวมโดยประมาณ</p>
                <p className="text-3xl font-display">
                  ฿{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-clay/70">แนบ QA checklist</p>
                <p className="text-lg font-semibold">
                  {values.includeQA ? "ต้องการ" : "ไม่ต้องการ"}
                </p>
              </div>
              <p className="text-xs text-clay/70">
                ฟอร์มนี้ใช้เพื่อสาธิต UX เท่านั้น ยังไม่ได้บันทึกจริงหรือคุม stock จริง
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
