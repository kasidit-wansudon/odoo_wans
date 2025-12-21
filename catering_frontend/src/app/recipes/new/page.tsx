"use client";

import Link from "next/link";
import { factories, stockLevels } from "@/data/mock-dashboard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type IngredientDraft = {
  id: string;
  name: string;
  quantity: number;
  uom: string;
};

export default function NewRecipePage() {
  const [form, setForm] = useState({
    name: "",
    category: "อาหารกลางวัน",
    factory: factories[0]?.name ?? "",
    portions: 500,
    costPerPlate: 38.5,
    margin: 20,
    description: "",
  });
  const ingredientIdRef = useRef(0);
  const createIngredientDraft = (
    overrides?: Partial<Omit<IngredientDraft, "id">>,
  ): IngredientDraft => ({
    id: `ingredient-${ingredientIdRef.current++}`,
    name: "",
    quantity: 0,
    uom: "กก.",
    ...overrides,
  });
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => [
    createIngredientDraft({ name: "เนื้ออกไก่", quantity: 20 }),
    createIngredientDraft({ name: "ใบกะเพรา", quantity: 5 }),
  ]);
  const ingredientOptions = useMemo(
    () => Array.from(new Set(stockLevels.map((item) => item.ingredient))),
    [],
  );
  const ingredientRefs = useRef<HTMLInputElement[]>([]);
  const [openSuggestionIndex, setOpenSuggestionIndex] = useState<number | null>(null);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  const estimatedRevenue = useMemo(() => {
    const sellingPrice = form.costPerPlate * (1 + form.margin / 100);
    return sellingPrice * form.portions;
  }, [form.costPerPlate, form.margin, form.portions]);

  const totalIngredients = useMemo(
    () => ingredients.reduce((sum, item) => sum + item.quantity, 0),
    [ingredients],
  );

  const handleChange = (
    field: keyof typeof form,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientDraft,
    value: string | number,
  ) => {
    setIngredients((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, createIngredientDraft()]);
  };

  const removeIngredient = (index: number) => {
    ingredientRefs.current.splice(index, 1);
    setIngredients((prev) => prev.filter((_, i) => i !== index));
    setOpenSuggestionIndex((prev) => (prev === index ? null : prev));
  };

  const getSuggestions = useCallback(
    (value: string) => {
      if (!value) return ingredientOptions.slice(0, 6);
      const key = value.toLowerCase();
      return ingredientOptions
        .filter((option) => option.toLowerCase().includes(key))
        .slice(0, 6);
    },
    [ingredientOptions],
  );

  const handleIngredientFocus = (index: number) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpenSuggestionIndex(index);
  };

  const handleIngredientBlur = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    blurTimeout.current = setTimeout(() => setOpenSuggestionIndex(null), 120);
  };

  const handleSuggestionSelect = (index: number, option: string) => {
    const matchedStock = stockLevels.find((item) => item.ingredient === option);
    setIngredients((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              name: option,
              uom: matchedStock ? matchedStock.uom : item.uom,
            }
          : item,
      ),
    );
    requestAnimationFrame(() => ingredientRefs.current[index]?.focus());
    setOpenSuggestionIndex(null);
  };

  useEffect(() => {
    return () => {
      if (blurTimeout.current) {
        clearTimeout(blurTimeout.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/50 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-5xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Create recipe (mock)
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl text-ink tracking-tight">
                เพิ่มสูตรอาหารใหม่
              </h1>
              <p className="text-ink/70 mt-2 max-w-2xl">
                ฟอร์มนี้เป็น mock ไม่ได้บันทึกจริง แต่ออกแบบให้เห็น field ครบทั้งข้อมูลทั่วไป
                ต้นทุน และสรุปผลประกอบการ
              </p>
            </div>
            <Link
              href="/recipes"
              className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5"
            >
              ← กลับไปหน้าจัดการสูตร
            </Link>
          </div>
        </header>

        <div className="grid gap-6 ">
          <form className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="font-display text-xl">รายละเอียดสูตร</h2>
              <div className="grid gap-4">
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  ชื่อสูตร
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="เช่น ข้าวอบเผือกอกไก่"
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  หมวดหมู่ / มื้ออาหาร
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    <option value="อาหารเช้า">อาหารเช้า</option>
                    <option value="อาหารกลางวัน">อาหารกลางวัน</option>
                    <option value="อาหารเย็น">อาหารเย็น</option>
                    <option value="ของว่าง">ของว่าง</option>
                  </select>
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  โรงครัวที่ผลิต
                  <select
                    value={form.factory}
                    onChange={(e) => handleChange("factory", e.target.value)}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  >
                    {factories.map((factory) => (
                      <option key={factory.name} value={factory.name}>
                        {factory.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  รายละเอียดเพิ่มเติม
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    placeholder="บันทึกวัตถุดิบหลัก เทคนิคการปรุง หรือตัวเลือกแพ้อาหาร"
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl">ตัวเลขการผลิต</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  Portion ต่อวัน
                  <input
                    type="number"
                    value={form.portions}
                    onChange={(e) => handleChange("portions", Number(e.target.value))}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  ต้นทุนต่อจาน (บาท)
                  <input
                    type="number"
                    value={form.costPerPlate}
                    onChange={(e) => handleChange("costPerPlate", Number(e.target.value))}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
                <label className="text-sm text-ink/70 flex flex-col gap-1">
                  Margin (%)
                  <input
                    type="number"
                    value={form.margin}
                    onChange={(e) => handleChange("margin", Number(e.target.value))}
                    className="rounded-2xl border border-ink/10 px-4 py-3"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">วัตถุดิบ (BOM)</h2>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-pine font-semibold"
                >
                  + เพิ่มวัตถุดิบ
                </button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id}
                    className="grid gap-3 sm:grid-cols-[2fr_0.8fr_0.8fr_auto] items-center"
                  >
                    <div className="relative">
                      <input
                        ref={(el) => {
                          if (el) ingredientRefs.current[index] = el;
                        }}
                        type="text"
                        value={ingredient.name}
                        onFocus={() => handleIngredientFocus(index)}
                        onBlur={handleIngredientBlur}
                        onChange={(e) => {
                          handleIngredientFocus(index);
                          updateIngredient(index, "name", e.target.value);
                        }}
                        placeholder="ชื่อวัตถุดิบ"
                    className="rounded-2xl border border-ink/10 px-4 py-3 w-full"
                      />
                      {openSuggestionIndex === index && (
                        <ul className="absolute z-10 mt-1 w-full rounded-xl border border-ink/10 bg-white shadow-panel max-h-44 overflow-auto">
                          {getSuggestions(ingredient.name).map((option) => (
                            <li
                              key={option}
                              className="px-3 py-3 text-sm text-ink hover:bg-clay/40 cursor-pointer"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSuggestionSelect(index, option)}
                            >
                              {option}
                            </li>
                          ))}
                          {getSuggestions(ingredient.name).length === 0 && (
                            <li className="px-3 py-3 text-xs text-ink/60">
                              ไม่พบวัตถุดิบ ใช้ชื่อใหม่ได้เลย
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(index, "quantity", Number(e.target.value))
                      }
                      placeholder="ปริมาณ"
                      className="rounded-2xl border border-ink/10 px-4 py-3"
                    />
                    <input
                      type="text"
                      value={ingredient.uom}
                      onChange={(e) => updateIngredient(index, "uom", e.target.value)}
                      placeholder="หน่วย"
                      className="rounded-2xl border border-ink/10 px-4 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
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
                type="button"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel"
              >
                บันทึก (mock)
              </button>
              <button className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export เป็น PDF
              </button>
            </div>
          </form>

          <aside className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-clay/60 font-semibold">
                สรุปผลการจำลอง
              </p>
              <h2 className="font-display text-2xl">Simulation summary</h2>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-clay/70">คาดการณ์รายได้/วัน</p>
                <p className="text-3xl font-display">
                  ฿{estimatedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-clay/70">ราคาขายต่อจาน (mock)</p>
                <p className="text-xl font-semibold">
                  ฿{(form.costPerPlate * (1 + form.margin / 100)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-clay/70">โรงครัว</p>
                <p className="text-lg font-semibold">{form.factory}</p>
              </div>
              <div>
                <p className="text-clay/70">วัตถุดิบทั้งหมด</p>
                <p className="text-lg font-semibold">
                  {totalIngredients.toLocaleString()} หน่วยรวม
                </p>
              </div>
              <div>
                <p className="text-clay/70">รายการวัตถุดิบ</p>
                <ul className="text-xs space-y-1 text-clay/80">
                  {ingredients.map((item) => (
                    <li key={`${item.name}-${item.uom}-${item.quantity}`}>
                      - {item.name || "ไม่ระบุ"} ({item.quantity} {item.uom})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-clay/70">
              หมายเหตุ: ฟอร์มนี้ไม่เชื่อมต่อ backend จริง ใช้สำหรับสาธิต UX และ flow การเพิ่มสูตร
              ก่อนเชื่อม Odoo เท่านั้น
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
