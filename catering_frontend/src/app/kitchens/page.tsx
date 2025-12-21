"use client";

import Link from "next/link";
import { factories } from "@/data/mock-dashboard";
import type { FactoryProfile } from "@/data/mock-dashboard";
import { useMemo, useRef, useState } from "react";

type DraftKitchen = Omit<FactoryProfile, "capacityPerDay" | "activeContracts"> & {
  capacityPerDay: number | string;
  activeContracts: number | string;
};

const statusOptions: FactoryProfile["status"][] = ["พร้อมใช้งาน", "ระหว่างซ่อมบำรุง", "กำลังขยาย"];

export default function KitchensPage() {
  const [kitchenData, setKitchenData] = useState<FactoryProfile[]>([...factories]);
  const [editingKitchen, setEditingKitchen] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, Partial<FactoryProfile>>>({});

  const [newKitchen, setNewKitchen] = useState<DraftKitchen>({
    name: "",
    location: "",
    capacityPerDay: "",
    activeContracts: "",
    kitchenLead: "",
    status: "พร้อมใช้งาน",
  });

  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overallCapacity = useMemo(
    () => kitchenData.reduce((sum, k) => sum + k.capacityPerDay, 0),
    [kitchenData],
  );

  const availableKitchens = kitchenData.filter((k) => k.status === "พร้อมใช้งาน").length;

  const downloadCsv = () => {
    const headers = ["name", "location", "capacityPerDay", "activeContracts", "kitchenLead", "status"];
    const rows = [
      headers.join(","),
      ...kitchenData.map((k) =>
        [
          k.name,
          k.location,
          k.capacityPerDay,
          k.activeContracts,
          k.kitchenLead,
          k.status,
        ].join(","),
      ),
    ];
    const csvContent = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "destination-kitchens.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? "";
        });
        return obj;
      });
      setCsvPreview(data);
      setShowCsvPreview(true);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const confirmCsvUpload = () => {
    const mapped: FactoryProfile[] = csvPreview
      .map((row) => ({
        name: row["name"] || "-",
        location: row["location"] || "-",
        capacityPerDay: Number(row["capacityPerDay"]) || 0,
        activeContracts: Number(row["activeContracts"]) || 0,
        kitchenLead: row["kitchenLead"] || "-",
        status: (statusOptions.includes(row["status"] as FactoryProfile["status"])
          ? row["status"]
          : "พร้อมใช้งาน") as FactoryProfile["status"],
      }))
      .filter((row) => row.name !== "-");
    if (mapped.length > 0) {
      setKitchenData(mapped);
    }
    setShowCsvPreview(false);
  };

  const handleEdit = (kitchen: FactoryProfile) => {
    setEditingKitchen(kitchen.name);
    setEditedData((prev) => ({ ...prev, [kitchen.name]: { ...kitchen } }));
  };

  const handleSave = (name: string) => {
    setKitchenData((prev) =>
      prev.map((k) =>
        k.name === name
          ? {
              ...k,
              ...editedData[name],
              capacityPerDay: Number(editedData[name]?.capacityPerDay ?? k.capacityPerDay),
              activeContracts: Number(editedData[name]?.activeContracts ?? k.activeContracts),
            }
          : k,
      ),
    );
    setEditingKitchen(null);
  };

  const handleDelete = (name: string) => {
    if (confirm(`ต้องการลบครัว "${name}" ใช่หรือไม่?`)) {
      setKitchenData((prev) => prev.filter((k) => k.name !== name));
    }
  };

  const handleAddKitchen = () => {
    if (!newKitchen.name || !newKitchen.location) return;
    const kitchen: FactoryProfile = {
      name: newKitchen.name,
      location: newKitchen.location,
      capacityPerDay: Number(newKitchen.capacityPerDay) || 0,
      activeContracts: Number(newKitchen.activeContracts) || 0,
      kitchenLead: newKitchen.kitchenLead || "-",
      status: newKitchen.status as FactoryProfile["status"],
    };
    setKitchenData((prev) => [kitchen, ...prev]);
    setNewKitchen({
      name: "",
      location: "",
      capacityPerDay: "",
      activeContracts: "",
      kitchenLead: "",
      status: "พร้อมใช้งาน",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/60 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Destination kitchens
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                จัดการครัวปลายทางและ plant mock
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2">
                เพิ่ม/แก้ไขครัวปลายทางที่ใช้ในการจัดซื้อ พร้อมดูภาพรวมกำลังการผลิต
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/procurement" className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5">
                ← กลับหน้าจัดซื้อ
              </Link>
              <button
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
                onClick={downloadCsv}
              >
                Export รายชื่อ
              </button>
              <button
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleCsvUpload} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">จำนวนครัว</p>
            <p className="text-3xl font-display">{kitchenData.length} แห่ง</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">พร้อมใช้งาน</p>
            <p className="text-3xl font-display">{availableKitchens}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Capacity รวม</p>
            <p className="text-3xl font-display">
              {overallCapacity.toLocaleString()} จาน/วัน
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Active contracts</p>
            <p className="text-3xl font-display">
              {kitchenData.reduce((sum, item) => sum + item.activeContracts, 0)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  รายชื่อครัวปลายทาง
                </p>
                <h2 className="font-display text-2xl text-ink">Destination roster</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-ink/60">
                    <th className="pb-3 font-semibold">ครัว</th>
                    <th className="pb-3 font-semibold">สถานที่</th>
                    <th className="pb-3 font-semibold text-center">Capacity</th>
                    <th className="pb-3 font-semibold text-center">Active contracts</th>
                    <th className="pb-3 font-semibold">Kitchen lead</th>
                    <th className="pb-3 font-semibold text-center">สถานะ</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchenData.map((kitchen) => (
                    <tr key={kitchen.name} className="border-t border-ink/5 hover:bg-clay/30 transition">
                      <td className="py-3 font-semibold">{kitchen.name}</td>
                      <td className="py-3 text-ink/70">{kitchen.location}</td>
                      <td className="py-3 text-center text-ink font-semibold">
                        {editingKitchen === kitchen.name ? (
                          <input
                            type="number"
                            value={editedData[kitchen.name]?.capacityPerDay ?? kitchen.capacityPerDay}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                [kitchen.name]: {
                                  ...prev[kitchen.name],
                                  capacityPerDay: Number(e.target.value),
                                },
                              }))
                            }
                            className="rounded border px-2 py-1 w-24 text-center"
                          />
                        ) : (
                          kitchen.capacityPerDay.toLocaleString()
                        )}
                      </td>
                      <td className="py-3 text-center text-ink font-semibold">
                        {editingKitchen === kitchen.name ? (
                          <input
                            type="number"
                            value={editedData[kitchen.name]?.activeContracts ?? kitchen.activeContracts}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                [kitchen.name]: {
                                  ...prev[kitchen.name],
                                  activeContracts: Number(e.target.value),
                                },
                              }))
                            }
                            className="rounded border px-2 py-1 w-16 text-center"
                          />
                        ) : (
                          kitchen.activeContracts
                        )}
                      </td>
                      <td className="py-3 text-ink/70">
                        {editingKitchen === kitchen.name ? (
                          <input
                            type="text"
                            value={editedData[kitchen.name]?.kitchenLead ?? kitchen.kitchenLead}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                [kitchen.name]: {
                                  ...prev[kitchen.name],
                                  kitchenLead: e.target.value,
                                },
                              }))
                            }
                            className="rounded border px-2 py-1 w-full"
                          />
                        ) : (
                          kitchen.kitchenLead
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {editingKitchen === kitchen.name ? (
                          <select
                            value={editedData[kitchen.name]?.status ?? kitchen.status}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                [kitchen.name]: {
                                  ...prev[kitchen.name],
                                  status: e.target.value as FactoryProfile["status"],
                                },
                              }))
                            }
                            className="rounded border px-3 py-1 text-sm"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full ${
                              kitchen.status === "พร้อมใช้งาน"
                                ? "bg-sage/30 text-pine"
                                : kitchen.status === "กำลังขยาย"
                                ? "bg-sand/40 text-pine"
                                : "bg-ember/10 text-ember"
                            }`}
                          >
                            {kitchen.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {editingKitchen === kitchen.name ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleSave(kitchen.name)}
                              className="px-3 py-1 rounded bg-pine text-white text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingKitchen(null)}
                              className="px-3 py-1 rounded border text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(kitchen)}
                              className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(kitchen.name)}
                              className="px-3 py-1 rounded-full border border-ember/20 text-ember hover:bg-ember/5 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
            <h2 className="font-display text-xl">เพิ่มครัวปลายทาง</h2>
            <div className="grid gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-ink/70">ชื่อครัว</span>
                <input
                  type="text"
                  value={newKitchen.name}
                  onChange={(e) => setNewKitchen((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  placeholder="เช่น ครัวอีสเทิร์นซีบอร์ด"
                />
              </label>
              <label className="space-y-1">
                <span className="text-ink/70">สถานที่</span>
                <input
                  type="text"
                  value={newKitchen.location}
                  onChange={(e) => setNewKitchen((prev) => ({ ...prev, location: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  placeholder="นิคมฯ ..."
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-ink/70">Capacity/วัน</span>
                  <input
                    type="number"
                    value={newKitchen.capacityPerDay}
                    onChange={(e) => setNewKitchen((prev) => ({ ...prev, capacityPerDay: e.target.value }))}
                    className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-ink/70">Active contracts</span>
                  <input
                    type="number"
                    value={newKitchen.activeContracts}
                    onChange={(e) =>
                      setNewKitchen((prev) => ({ ...prev, activeContracts: e.target.value }))
                    }
                    className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                  />
                </label>
              </div>
              <label className="space-y-1">
                <span className="text-ink/70">Kitchen lead</span>
                <input
                  type="text"
                  value={newKitchen.kitchenLead}
                  onChange={(e) => setNewKitchen((prev) => ({ ...prev, kitchenLead: e.target.value }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                />
              </label>
              <label className="space-y-1">
                <span className="text-ink/70">สถานะ</span>
                <select
                  value={newKitchen.status}
                  onChange={(e) => setNewKitchen((prev) => ({ ...prev, status: e.target.value as FactoryProfile["status"] }))}
                  className="rounded-2xl border border-ink/10 px-4 py-2 w-full"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={handleAddKitchen}
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                + เพิ่มครัวเข้ารายการ
              </button>
              <p className="text-xs text-ink/60">* ข้อมูล mock ยังไม่บันทึกลงระบบจริง</p>
            </div>
          </aside>
        </section>
      </div>

      {showCsvPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">Preview Kitchen CSV Upload</h2>
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
            <div className="mt-6 flex gap-4 justify-end">
              <button
                onClick={() => setShowCsvPreview(false)}
                className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmCsvUpload}
                className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
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
