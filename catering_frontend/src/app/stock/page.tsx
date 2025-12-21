"use client";

import { useMemo, useRef, useState } from "react";
import {
  stockAdjustments as mockAdjustments,
  stockLevels as mockStockLevels,
} from "@/data/mock-dashboard";

type StockRow = (typeof mockStockLevels)[number];

const statusBadge = (status: string) => {
  if (status === "พร้อมใช้") return "bg-sage/30 text-pine";
  if (status === "เริ่มตึง") return "bg-sand/40 text-pine";
  return "bg-ember/10 text-ember";
};

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

export default function StockPage() {
  const [stockData, setStockData] = useState<StockRow[]>(mockStockLevels);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedRows, setEditedRows] = useState<Record<string, Partial<StockRow>>>({});
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [adjustments, setAdjustments] = useState(mockAdjustments);
  const [newAdjustment, setNewAdjustment] = useState({
    kitchen: "",
    item: "",
    change: "",
    reason: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowCoverage = useMemo(
    () => stockData.filter((item) => item.coverageDays < 3),
    [stockData],
  );

  const handleEdit = (row: StockRow) => {
    setEditingItem(row.ingredient);
    setEditedRows((prev) => ({ ...prev, [row.ingredient]: { ...row } }));
  };

  const handleSave = (ingredient: string) => {
    const next = editedRows[ingredient];
    if (!next) return;
    setStockData((prev) =>
      prev.map((row) =>
        row.ingredient === ingredient
          ? {
              ...row,
              ...next,
              onHand: Number(next.onHand ?? row.onHand),
              coverageDays: Number(next.coverageDays ?? row.coverageDays),
              status: (next.status as StockRow["status"]) ?? row.status,
            }
          : row,
      ),
    );
    setEditingItem(null);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, index) => {
          obj[h] = values[index] ?? "";
        });
        return obj;
      });
      setCsvPreview(data);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleConfirmCsv = () => {
    const mapped: StockRow[] = csvPreview
      .map((row) => ({
        ingredient: row["ingredient"] || "-",
        onHand: Number(row["onHand"]) || 0,
        uom: row["uom"] || "หน่วย",
        coverageDays: Number(row["coverageDays"]) || 0,
        status: (["พร้อมใช้", "เริ่มตึง", "วิกฤต"].includes(row["status"])
          ? row["status"]
          : "พร้อมใช้") as StockRow["status"],
      }))
      .filter((row) => row.ingredient !== "-");
    if (mapped.length > 0) {
      setStockData(mapped);
      setShowCsvPreview(false);
    }
  };

  const handleExportStock = () => {
    const headers = ["ingredient", "onHand", "uom", "coverageDays", "status"];
    const rows = [
      headers.join(","),
      ...stockData.map((row) =>
        [
          row.ingredient,
          row.onHand,
          row.uom,
          row.coverageDays,
          row.status,
        ].join(","),
      ),
    ];
    downloadCsv(rows, `stock-levels-${Date.now()}.csv`);
  };

  const handleAddAdjustment = () => {
    if (!newAdjustment.kitchen || !newAdjustment.item || !newAdjustment.change) {
      return;
    }
    const changeValue = Number(newAdjustment.change);
    if (Number.isNaN(changeValue)) return;

    setAdjustments((prev) => [
      {
        kitchen: newAdjustment.kitchen,
        item: newAdjustment.item,
        change: changeValue,
        reason: newAdjustment.reason || "ปรับ stock (mock)",
        timestamp: new Date().toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      },
      ...prev,
    ]);

    setStockData((prev) =>
      prev.map((row) =>
        row.ingredient === newAdjustment.item
          ? {
              ...row,
              onHand: Math.max(row.onHand + changeValue, 0),
              coverageDays: Math.max(row.coverageDays + changeValue / 100, 0),
            }
          : row,
      ),
    );

    setNewAdjustment({
      kitchen: "",
      item: "",
      change: "",
      reason: "",
    });
  };

  const handleExportAdjustments = () => {
    const headers = ["kitchen", "item", "change", "reason", "timestamp"];
    const rows = [
      headers.join(","),
      ...adjustments.map((log) =>
        [log.kitchen, log.item, log.change, log.reason, log.timestamp].join(","),
      ),
    ];
    downloadCsv(rows, `stock-adjustments-${Date.now()}.csv`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/40 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Stock control
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                สต็อกวัตถุดิบ & การปรับยอด
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                ดูสถานะคงเหลือ คาดการณ์ coverage และประวัติการปรับยอด (mock data)
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
                onClick={() => document.getElementById("new-adjustment")?.scrollIntoView({ behavior: "smooth" })}
              >
                + บันทึกการปรับ stock
              </button>
              <button
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
                onClick={handleExportStock}
              >
                Export สต็อก
              </button>
              <button
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">จำนวนวัตถุดิบ</p>
            <p className="text-3xl font-display">{stockData.length}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">วัตถุดิบเสี่ยง</p>
            <p className="text-3xl font-display">{lowCoverage.length}</p>
            <p className="text-sm text-ink/60 mt-1">coverage &lt; 3 วัน</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">log ปรับล่าสุด</p>
            <p className="text-3xl font-display">{adjustments.length}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Mock data</p>
            <p className="text-3xl font-display">100%</p>
            <p className="text-sm text-ink/60 mt-1">ยังไม่เชื่อม Odoo</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]" id="new-adjustment">
          <div className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  รายการสต็อก
                </p>
                <h2 className="font-display text-2xl text-ink">Stock overview</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-ink/60">
                    <th className="pb-3 font-semibold">วัตถุดิบ</th>
                    <th className="pb-3 font-semibold text-center">คงเหลือ</th>
                    <th className="pb-3 font-semibold text-center">Coverage</th>
                    <th className="pb-3 font-semibold text-center">สถานะ</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((item) => (
                    <tr key={item.ingredient} className="border-t border-ink/5 hover:bg-clay/30 transition">
                      <td className="py-3">
                        <p className="font-semibold text-ink">{item.ingredient}</p>
                        <p className="text-xs text-ink/60">{item.uom}</p>
                      </td>
                      <td className="py-3 text-center text-ink font-semibold">
                        {editingItem === item.ingredient ? (
                          <input
                            type="number"
                            value={editedRows[item.ingredient]?.onHand ?? item.onHand}
                            onChange={(e) =>
                              setEditedRows((prev) => ({
                                ...prev,
                                [item.ingredient]: {
                                  ...prev[item.ingredient],
                                  onHand: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-24 rounded border px-2 py-1 text-center"
                          />
                        ) : (
                          <>
                            {item.onHand.toLocaleString()} {item.uom}
                          </>
                        )}
                      </td>
                      <td className="py-3 text-center text-ink font-semibold">
                        {editingItem === item.ingredient ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editedRows[item.ingredient]?.coverageDays ?? item.coverageDays}
                            onChange={(e) =>
                              setEditedRows((prev) => ({
                                ...prev,
                                [item.ingredient]: {
                                  ...prev[item.ingredient],
                                  coverageDays: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-20 rounded border px-2 py-1 text-center"
                          />
                        ) : (
                          `${item.coverageDays.toFixed(1)} วัน`
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {editingItem === item.ingredient ? (
                          <select
                            value={editedRows[item.ingredient]?.status ?? item.status}
                            onChange={(e) =>
                              setEditedRows((prev) => ({
                                ...prev,
                                [item.ingredient]: {
                                  ...prev[item.ingredient],
                                  status: e.target.value as StockRow["status"],
                                },
                              }))
                            }
                            className="rounded border px-3 py-1 text-sm"
                          >
                            <option value="พร้อมใช้">พร้อมใช้</option>
                            <option value="เริ่มตึง">เริ่มตึง</option>
                            <option value="วิกฤต">วิกฤต</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {editingItem === item.ingredient ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSave(item.ingredient)}
                              className="px-3 py-1 rounded bg-pine text-white text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-1 rounded border text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5 text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl bg-white/95 border border-white/60 shadow-panel p-6 space-y-4">
            <h2 className="font-display text-xl">บันทึกการปรับ stock</h2>
            <div className="grid gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-ink/70">ครัว</span>
                <input
                  type="text"
                  value={newAdjustment.kitchen}
                  onChange={(e) => setNewAdjustment((prev) => ({ ...prev, kitchen: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  placeholder="ชื่อครัว"
                />
              </label>
              <label className="space-y-1">
                <span className="text-ink/70">วัตถุดิบ</span>
                <input
                  type="text"
                  value={newAdjustment.item}
                  onChange={(e) => setNewAdjustment((prev) => ({ ...prev, item: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  placeholder="เช่น เนื้ออกไก่"
                />
              </label>
              <label className="space-y-1">
                <span className="text-ink/70">จำนวนที่ปรับ</span>
                <input
                  type="number"
                  value={newAdjustment.change}
                  onChange={(e) => setNewAdjustment((prev) => ({ ...prev, change: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  placeholder="+/-"
                />
              </label>
              <label className="space-y-1">
                <span className="text-ink/70">เหตุผล</span>
                <textarea
                  value={newAdjustment.reason}
                  onChange={(e) => setNewAdjustment((prev) => ({ ...prev, reason: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  rows={3}
                  placeholder="เช่น ปรับตามใบรับเข้า mock"
                />
              </label>
              <button
                type="button"
                onClick={handleAddAdjustment}
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                บันทึกการปรับ (mock)
              </button>
              <button
                type="button"
                onClick={handleExportAdjustments}
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
              >
                Export log
              </button>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">ประวัติการปรับ stock</h2>
          </div>
          <ul className="space-y-3 text-sm">
            {adjustments.map((log, index) => (
              <li key={`${log.item}-${index}`} className="rounded-2xl border border-ink/10 bg-clay/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{log.kitchen}</p>
                  <span className="text-xs text-ink/60">{log.timestamp}</span>
                </div>
                <p className="text-sm text-ink mt-1">
                  {log.item} ({log.change > 0 ? "+" : ""}
                  {log.change})
                </p>
                <p className="text-xs text-ink/60">{log.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {showCsvPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto w-full space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Preview Stock CSV Upload</h2>
              <button
                onClick={() => setShowCsvPreview(false)}
                className="rounded-full border border-ink/20 px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {Object.keys(csvPreview[0] || {}).map((key) => (
                      <th key={key} className="pb-2 text-left font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-2 px-1">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {csvPreview.length > 10 && (
                    <tr>
                      <td
                        colSpan={Object.keys(csvPreview[0] || {}).length}
                        className="py-2 text-center text-gray-500"
                      >
                        ... and {csvPreview.length - 10} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCsvPreview(false)}
                className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCsv}
                className="px-6 py-2 bg-pine text-white rounded-full hover:bg-pine/80 transition"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
