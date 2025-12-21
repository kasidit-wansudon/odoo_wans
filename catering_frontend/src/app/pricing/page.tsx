"use client";

import {
  ingredientPriceTrend,
  priceBook,
  recipes,
  stockLevels,
  type PriceBookEntry,
} from "@/data/mock-dashboard";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRef, useState } from "react";

const costLeaders = [...recipes]
  .sort((a, b) => a.costPerPlate - b.costPerPlate)
  .slice(0, 3);

const riskyItems = stockLevels.filter((item) => item.coverageDays < 3);

const downloadCsv = (rows: string[], fileName: string) => {
  const csvContent = "\uFEFF" + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function PricingPage() {
  const handleExportPriceBook = () => {
    const headers = ["ingredient", "category", "avgCost", "lastWeekCost", "recommendedPrice", "variance"];
    const rows = [
      headers.join(","),
      ...priceBook.map(item => [
        item.ingredient,
        item.category,
        item.avgCost,
        item.lastWeekCost,
        item.recommendedPrice,
        item.variance,
      ].join(",")),
    ];
    downloadCsv(rows, "price_book.csv");
  };

  const pricingInputRef = useRef<HTMLInputElement>(null);
  const [pricingCsvPreview, setPricingCsvPreview] = useState<Record<string, string>[]>([]);
  const [showPricingPreview, setShowPricingPreview] = useState(false);

  const handlePricingCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
      });
      setPricingCsvPreview(data);
      setShowPricingPreview(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmPricingUpload = async () => {
    // Mock save
    console.log('Uploading pricing', pricingCsvPreview);
    setShowPricingPreview(false);
  };

  const [editingPricing, setEditingPricing] = useState<string | null>(null);
  const [editedPricingData, setEditedPricingData] = useState<Record<string, Partial<PriceBookEntry>>>({});

  const handleEditPricing = (item: PriceBookEntry) => {
    setEditingPricing(item.ingredient);
    setEditedPricingData(prev => ({ ...prev, [item.ingredient]: { ...item } }));
  };

  const handleSavePricing = (ingredient: string) => {
    console.log('Save pricing', editedPricingData[ingredient]);
    setEditingPricing(null);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/50 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-5xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Pricing intelligence
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                ราคาและต้นทุนวัตถุดิบ
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                Monitor price book, ต้นทุนเฉลี่ย, ความผันผวนวัตถุดิบ เพื่อตั้งราคาต่อหัว
                และพยากรณ์ margin (mock data)
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition">
                + ปรับราคาแนะนำ
              </button>
              <button onClick={handleExportPriceBook} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export price book
              </button>
              <button onClick={() => pricingInputRef.current?.click()} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Import CSV
              </button>
            </div>
          </div>
        </header>

        <input ref={pricingInputRef} type="file" accept=".csv" className="hidden" onChange={handlePricingCsvUpload} />

        <section className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                กราฟต้นทุนวัตถุดิบหลัก
              </p>
              <h2 className="font-display text-2xl text-ink">Chicken · Holy Basil · Coconut</h2>
            </div>
            <span className="text-xs text-ink/60">mock trend</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingredientPriceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="chicken" stroke="#0F4C3A" fill="#0F4C3A40" />
                <Area type="monotone" dataKey="basil" stroke="#D75F4B" fill="#D75F4B30" />
                <Area type="monotone" dataKey="coconut" stroke="#94b49f" fill="#94b49f30" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                Price book
              </p>
              <h2 className="font-display text-2xl text-ink">รายการราคาวัตถุดิบตัวอย่าง</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-ink/60">
                  <th className="pb-3 font-semibold">วัตถุดิบ</th>
                  <th className="pb-3 font-semibold">หมวด</th>
                  <th className="pb-3 font-semibold text-center">ราคาเฉลี่ย</th>
                  <th className="pb-3 font-semibold text-center">สัปดาห์ก่อน</th>
                  <th className="pb-3 font-semibold text-center">ราคาขายแนะนำ</th>
                  <th className="pb-3 font-semibold text-center">Δ</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {priceBook.map((item) => (
                  <tr key={item.ingredient} className="border-t border-ink/5 hover:bg-clay/30 transition">
                    <td className="py-3 font-semibold text-ink">{item.ingredient}</td>
                    <td className="py-3 text-ink/70">{item.category}</td>
                    <td className="py-3 text-center text-ink font-semibold">฿{item.avgCost}</td>
                    <td className="py-3 text-center text-ink/70">฿{item.lastWeekCost}</td>
                    <td className="py-3 text-center text-ink font-semibold">
                      {editingPricing === item.ingredient ? (
                        <input type="number" value={editedPricingData[item.ingredient]?.recommendedPrice ?? item.recommendedPrice} onChange={(e) => setEditedPricingData(prev => ({ ...prev, [item.ingredient]: { ...prev[item.ingredient], recommendedPrice: +e.target.value } }))} className="rounded border px-2 py-1 w-20 text-center" />
                      ) : (
                        `฿${item.recommendedPrice}`
                      )}
                    </td>
                    <td className="py-3 text-center text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          item.variance < 0 ? "bg-sage/30 text-pine" : "bg-ember/10 text-ember"
                        }`}
                      >
                        {item.variance > 0 ? "+" : ""}
                        {item.variance}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {editingPricing === item.ingredient ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleSavePricing(item.ingredient)} className="px-3 py-1 rounded bg-pine text-white text-xs">Save</button>
                          <button onClick={() => setEditingPricing(null)} className="px-3 py-1 rounded border text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditPricing(item)} className="px-3 py-1 rounded border text-xs hover:bg-gray-100">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">สูตรต้นทุนต่ำสุด</h2>
              <span className="text-xs text-ink/60">mock insight</span>
            </div>
            <ul className="space-y-3 text-sm">
              {costLeaders.map((recipe) => (
                <li key={recipe.name} className="rounded-2xl border border-ink/10 bg-clay/40 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{recipe.name}</p>
                      <p className="text-xs text-ink/60">{recipe.factory}</p>
                    </div>
                    <span className="text-sm font-semibold">฿{recipe.costPerPlate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-ink/60">{recipe.category}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-4">
            <h2 className="font-display text-2xl">วัตถุดิบเสี่ยงต่ำกว่า 3 วัน</h2>
            <ul className="space-y-3 text-sm">
              {riskyItems.map((item) => (
                <li key={item.ingredient} className="border border-white/15 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.ingredient}</p>
                    <span className="text-xs text-clay/70">{item.coverageDays.toFixed(1)} วัน</span>
                  </div>
                  <p className="text-xs text-clay/70">คงเหลือ {item.onHand} {item.uom}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {showPricingPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">Preview Pricing CSV Upload</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {Object.keys(pricingCsvPreview[0] || {}).map(key => <th key={key} className="pb-2 text-left font-semibold">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {pricingCsvPreview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      {Object.values(row).map((val, j) => <td key={j} className="py-2 px-1">{String(val)}</td>)}
                    </tr>
                  ))}
                  {pricingCsvPreview.length > 10 && <tr><td colSpan={Object.keys(pricingCsvPreview[0] || {}).length} className="py-2 text-center text-gray-500">... and {pricingCsvPreview.length - 10} more rows</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={() => setShowPricingPreview(false)} className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirmPricingUpload} className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
