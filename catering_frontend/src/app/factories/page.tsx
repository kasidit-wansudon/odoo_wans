"use client";

import Link from "next/link";
import {
  factories,
  procurementOrders,
  quotes,
  stockAdjustments,
} from "@/data/mock-dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRef, useState } from "react";
import type { FactoryProfile } from "@/data/mock-dashboard";

const capacityData = factories.map((factory) => ({
  name: factory.name,
  capacity: factory.capacityPerDay,
  contracts: factory.activeContracts * 500,
}));

const quoteTimeline = quotes.map((quote) => ({
  name: quote.client,
  price: quote.pricePerHead,
  meals: quote.mealCount,
}));

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

export default function FactoriesPage() {
  const handleExportFactories = () => {
    const headers = ["name", "location", "capacityPerDay", "activeContracts", "kitchenLead", "status"];
    const rows = [
      headers.join(","),
      ...factories.map(factory => [
        factory.name,
        factory.location,
        factory.capacityPerDay,
        factory.activeContracts,
        factory.kitchenLead,
        factory.status,
      ].join(",")),
    ];
    downloadCsv(rows, "factories.csv");
  };

  const factoryInputRef = useRef<HTMLInputElement>(null);
  const [factoryCsvPreview, setFactoryCsvPreview] = useState<Record<string, string>[]>([]);
  const [showFactoryPreview, setShowFactoryPreview] = useState(false);

  const handleFactoryCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setFactoryCsvPreview(data);
      setShowFactoryPreview(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmFactoryUpload = async () => {
    // Mock save
    console.log('Uploading factories', factoryCsvPreview);
    setShowFactoryPreview(false);
  };

  const [editingFactory, setEditingFactory] = useState<string | null>(null);
  const [editedFactoryData, setEditedFactoryData] = useState<Record<string, Partial<FactoryProfile>>>({});

  const handleEditFactory = (factory: FactoryProfile) => {
    setEditingFactory(factory.name);
    setEditedFactoryData(prev => ({ ...prev, [factory.name]: { ...factory } }));
  };

  const handleSaveFactory = (name: string) => {
    console.log('Save factory', editedFactoryData[name]);
    setEditingFactory(null);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/60 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Factory control room
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                แดชบอร์ดโรงครัวทั้งหมด
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                ตรวจสอบกำลังการผลิต สถานะครัว กำหนดการจัดซื้อ และใบเสนอราคาของแต่ละ plant
                (mock data)
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5">
                ← หน้าแรก
              </Link>
              <Link
                href="/procurement"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                เปิด PO ใหม่
              </Link>
              <Link
                href="/quotes/new"
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
              >
                สร้างใบเสนอราคา
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">จำนวนครัว</p>
            <p className="text-3xl font-display">{factories.length} แห่ง</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Capacity รวม</p>
            <p className="text-3xl font-display">
              {factories
                .reduce((sum, item) => sum + item.capacityPerDay, 0)
                .toLocaleString()} จาน/วัน
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Active contract</p>
            <p className="text-3xl font-display">
              {factories.reduce((sum, item) => sum + item.activeContracts, 0)} สัญญา
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">แจ้งเตือน stock</p>
            <p className="text-3xl font-display">{stockAdjustments.length}</p>
            <p className="text-sm text-ink/60 mt-1">mock logs ล่าสุด</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  กำลังการผลิตต่อวัน
                </p>
                <h2 className="font-display text-2xl text-ink">Production capacity (mock)</h2>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="capacity" fill="#0F4C3A" radius={[8, 8, 0, 0]} name="จาน/วัน" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
              Pipeline ใบเสนอราคา
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quoteTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#D75F4B"
                    strokeWidth={3}
                    name="ราคา/หัว"
                  />
                  <Line
                    type="monotone"
                    dataKey="meals"
                    stroke="#0F4C3A"
                    strokeWidth={3}
                    name="จำนวนหัว"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                รายการโรงครัว
              </p>
              <h2 className="font-display text-2xl text-ink">Factory roster</h2>
            </div>
            <button onClick={handleExportFactories} className="text-sm font-semibold text-pine hover:text-ink transition">
              Export รายชื่อ
            </button>
            <button onClick={() => factoryInputRef.current?.click()} className="text-sm font-semibold text-pine hover:text-ink transition">
              Import CSV
            </button>
          </div>
          <input ref={factoryInputRef} type="file" accept=".csv" className="hidden" onChange={handleFactoryCsvUpload} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-ink/60">
                  <th className="pb-3 font-semibold">โรงครัว</th>
                  <th className="pb-3 font-semibold">สถานที่</th>
                  <th className="pb-3 font-semibold text-center">Capacity</th>
                  <th className="pb-3 font-semibold text-center">Active contract</th>
                  <th className="pb-3 font-semibold">Kitchen lead</th>
                  <th className="pb-3 font-semibold text-center">สถานะ</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {factories.map((factory) => (
                  <tr
                    key={factory.name}
                    className="border-t border-ink/5 hover:bg-clay/30 transition"
                  >
                    <td className="py-3 font-semibold">{factory.name}</td>
                    <td className="py-3 text-ink/70">{factory.location}</td>
                    <td className="py-3 text-center text-ink font-semibold">
                      {editingFactory === factory.name ? (
                        <input type="number" value={editedFactoryData[factory.name]?.capacityPerDay ?? factory.capacityPerDay} onChange={(e) => setEditedFactoryData(prev => ({ ...prev, [factory.name]: { ...prev[factory.name], capacityPerDay: +e.target.value } }))} className="rounded border px-2 py-1 w-20 text-center" />
                      ) : (
                        factory.capacityPerDay.toLocaleString()
                      )}
                    </td>
                    <td className="py-3 text-center text-ink font-semibold">
                      {editingFactory === factory.name ? (
                        <input type="number" value={editedFactoryData[factory.name]?.activeContracts ?? factory.activeContracts} onChange={(e) => setEditedFactoryData(prev => ({ ...prev, [factory.name]: { ...prev[factory.name], activeContracts: +e.target.value } }))} className="rounded border px-2 py-1 w-16 text-center" />
                      ) : (
                        factory.activeContracts
                      )}
                    </td>
                    <td className="py-3 text-ink/70">{factory.kitchenLead}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full ${
                          factory.status === "พร้อมใช้งาน"
                            ? "bg-sage/30 text-pine"
                            : factory.status === "กำลังขยาย"
                            ? "bg-sand/40 text-pine"
                            : "bg-ember/10 text-ember"
                        }`}
                      >
                        {factory.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {editingFactory === factory.name ? (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleSaveFactory(factory.name)} className="px-3 py-1 rounded bg-pine text-white text-xs">Save</button>
                          <button onClick={() => setEditingFactory(null)} className="px-3 py-1 rounded border text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditFactory(factory)} className="px-3 py-1 rounded border text-xs hover:bg-gray-100">Edit</button>
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
              <h2 className="font-display text-2xl text-ink">PO ล่าสุด</h2>
              <Link href="/procurement" className="text-sm text-pine font-semibold">
                ไปหน้าจัดซื้อ →
              </Link>
            </div>
            <ul className="space-y-3">
              {procurementOrders.map((po) => (
                <li
                  key={po.poNumber}
                  className="rounded-2xl border border-ink/10 bg-clay/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{po.poNumber}</p>
                      <p className="text-xs text-ink/60">{po.itemSummary}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      ฿{po.total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-ink/60 mt-1">Supplier: {po.supplier}</p>
                  <p className="text-sm text-ink mt-1">ETA {po.eta} · {po.status}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-4">
            <h2 className="font-display text-2xl">Log ปรับ stock (mock)</h2>
            <ul className="space-y-3 text-sm">
              {stockAdjustments.map((log, index) => (
                <li key={`${log.item}-${index}`} className="border border-white/15 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{log.kitchen}</p>
                    <span className="text-xs text-clay/70">{log.timestamp}</span>
                  </div>
                  <p className="mt-1">
                    {log.item} {log.change > 0 ? "+" : ""}
                    {log.change}
                  </p>
                  <p className="text-xs text-clay/70">{log.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {showFactoryPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">Preview Factory CSV Upload</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {Object.keys(factoryCsvPreview[0] || {}).map(key => <th key={key} className="pb-2 text-left font-semibold">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {factoryCsvPreview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      {Object.values(row).map((val, j) => <td key={j} className="py-2 px-1">{String(val)}</td>)}
                    </tr>
                  ))}
                  {factoryCsvPreview.length > 10 && <tr><td colSpan={Object.keys(factoryCsvPreview[0] || {}).length} className="py-2 text-center text-gray-500">... and {factoryCsvPreview.length - 10} more rows</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={() => setShowFactoryPreview(false)} className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirmFactoryUpload} className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
