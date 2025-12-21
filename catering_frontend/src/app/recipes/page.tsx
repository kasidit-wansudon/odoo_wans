"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  mealShare,
  recipes,
  stockLevels,
  recipeSchedules,
} from "@/data/mock-dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SortableTable, Column } from "@/components/ui/SortableTable";
import { DetailDrawer } from "@/components/ui/DetailDrawer";

const factorySummary = recipes.reduce<Record<string, number>>((acc, recipe) => {
  acc[recipe.factory] = (acc[recipe.factory] || 0) + recipe.portions;
  return acc;
}, {});
const stockRisk = stockLevels.filter((item) => item.coverageDays < 3);
const categoryOptions = [
  "ทั้งหมด",
  ...Array.from(new Set(recipes.map((recipe) => recipe.category))),
];
const factoryOptions = [
  "ทั้งหมด",
  ...Array.from(new Set(recipes.map((recipe) => recipe.factory))),
];
type RecipeRow = (typeof recipes)[number];
type ScheduleRow = (typeof recipeSchedules)[number];

export default function RecipesPage() {
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [factoryFilter, setFactoryFilter] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, Partial<RecipeRow>>>({});

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const categoryOk =
        categoryFilter === "ทั้งหมด" || recipe.category === categoryFilter;
      const factoryOk =
        factoryFilter === "ทั้งหมด" || recipe.factory === factoryFilter;
      const searchOk =
        searchTerm === "" || recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryOk && factoryOk && searchOk;
    });
  }, [categoryFilter, factoryFilter, searchTerm, editingId, editedData]);

  const handleEdit = (row: RecipeRow) => {
    setEditingId(row.name);
    setEditedData(prev => ({ ...prev, [row.name]: { ...row } }));
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/recipe/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData[id]),
      });
      if (response.ok) {
        setEditingId(null);
        // Optionally refresh data or update local state
      } else {
        console.error('Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe', error);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setCsvPreviewData(data);
      setShowPreview(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmUpload = async () => {
    for (const row of csvPreviewData) {
      const recipeData = {
        name: row.name,
        product_tmpl_id: parseInt(row.product_tmpl_id),
        portions: parseInt(row.portions),
        ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
      };
      try {
        await fetch('http://localhost:3000/recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        });
      } catch (e) {
        console.error('Error uploading recipe', e);
      }
    }
    setShowPreview(false);
  };

  const handleExportRecipes = () => {
    const csvContent = [
      'name,category,factory,portions,costPerPlate,margin',
      ...recipes.map(recipe => 
        `${recipe.name},${recipe.category},${recipe.factory},${recipe.portions},${recipe.costPerPlate},${recipe.margin}`
      )
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const recipeColumns = useMemo<Column<RecipeRow>[]>(
    () => [
      {
        key: "name",
        label: "สูตรอาหาร",
        render: (row) => (
          <div>
            <p className="font-semibold text-ink">{row.name}</p>
            <p className="text-xs text-ink/60">{row.category}</p>
          </div>
        ),
      },
      {
        key: "factory",
        label: "โรงครัว",
        sortable: true,
      },
      {
        key: "portions",
        label: "จาน/วัน",
        align: "center",
        sortable: true,
        render: (row) => row.portions.toLocaleString(),
      },
      {
        key: "costPerPlate",
        label: "ต้นทุน/จาน",
        align: "center",
        sortable: true,
        render: (row) => {
          if (editingId === row.name) {
            return <input type="number" value={editedData[row.name]?.costPerPlate ?? row.costPerPlate} onChange={(e) => setEditedData(prev => ({ ...prev, [row.name]: { ...prev[row.name], costPerPlate: +e.target.value } }))} className="rounded border px-2 py-1 w-20" />;
          } else {
            return `฿${row.costPerPlate.toFixed(2)}`;
          }
        },
      },
      {
        key: "margin",
        label: "Margin",
        align: "center",
        sortable: true,
        render: (row) => {
          if (editingId === row.name) {
            return <input type="number" value={editedData[row.name]?.margin ?? row.margin} onChange={(e) => setEditedData(prev => ({ ...prev, [row.name]: { ...prev[row.name], margin: +e.target.value } }))} className="rounded border px-2 py-1 w-16" />;
          } else {
            return (
              <span
                className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full ${
                  row.margin >= 20 ? "bg-sage/30 text-pine" : "bg-ember/10 text-ember"
                }`}
              >
                {row.margin}%
              </span>
            );
          }
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (row) => {
          if (editingId === row.name) {
            return (
              <div className="flex gap-2 justify-center">
                <button onClick={() => handleSave(row.name)} className="px-3 py-1 rounded-full bg-pine text-clay">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-full border border-ink/20">
                  Cancel
                </button>
              </div>
            );
          } else {
            return (
              <div className="flex gap-2 justify-center">
                <button onClick={() => handleEdit(row)} className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5">
                  Edit
                </button>
                <button className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5">
                  Export
                </button>
              </div>
            );
          }
        },
      },
    ],
    [],
  );
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRow | null>(
    filteredRecipes[0] ?? null,
  );
  useEffect(() => {
    setSelectedRecipe((prev) => {
      if (prev && filteredRecipes.some((r) => r.name === prev.name)) {
        return prev;
      }
      return filteredRecipes[0] ?? null;
    });
  }, [filteredRecipes]);

  const [scheduleFactory, setScheduleFactory] = useState("ทั้งหมด");
  const filteredSchedule = useMemo(() => {
    return recipeSchedules.filter((entry) => {
      return scheduleFactory === "ทั้งหมด" || entry.factory === scheduleFactory;
    });
  }, [scheduleFactory]);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<Record<string, string>[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const scheduleColumns = useMemo<Column<ScheduleRow>[]>(
    () => [
      {
        key: "date",
        label: "วันที่",
        sortable: true,
      },
      {
        key: "factory",
        label: "โรงครัว",
        sortable: true,
      },
      {
        key: "client",
        label: "ลูกค้า",
      },
      {
        key: "meal",
        label: "มื้อ",
        align: "center",
      },
      {
        key: "recipe",
        label: "สูตร",
      },
      {
        key: "portions",
        label: "จำนวนหัว",
        align: "center",
        sortable: true,
        render: (row) => row.portions.toLocaleString(),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/60 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Recipe console
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                จัดการสูตรอาหาร
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                ปรับสูตร/สูตรย่อย คุมต้นทุนต่อจาน พร้อมข้อมูลคงเหลือวัตถุดิบเสี่ยง
                ก่อนส่งแผนผลิตจริง
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="text-sm rounded-full border border-ink/20 px-4 py-2 hover:bg-ink/5">
                ← หน้าแรก
              </Link>
              <Link
                href="/recipes/new"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                + เพิ่มสูตรใหม่
              </Link>
              <button onClick={handleExportRecipes} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export สูตร (.csv)
              </button>
              <button onClick={() => csvInputRef.current?.click()} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Upload CSV
              </button>
            </div>
          </div>
        </header>

        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">สูตรที่ดูแล</p>
            <p className="text-3xl font-display">{recipes.length}</p>
            <p className="text-sm text-ink/60 mt-1">แสดงข้อมูล mock</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">portion รวม</p>
            <p className="text-3xl font-display">
              {recipes.reduce((sum, item) => sum + item.portions, 0).toLocaleString()} จาน/วัน
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Margin เฉลี่ย</p>
            <p className="text-3xl font-display">
              {(
                recipes.reduce((sum, item) => sum + item.margin, 0) / recipes.length
              ).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">วัตถุดิบเสี่ยง</p>
            <p className="text-3xl font-display">{stockRisk.length}</p>
            <p className="text-sm text-ink/60 mt-1">คงเหลือน้อยกว่า 3 วัน</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                สรุป portion ต่อโรงครัว
              </p>
              <h2 className="font-display text-2xl text-ink">Factory load overview</h2>
            </div>
            <span className="text-xs text-ink/60">mock data</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(factorySummary).map(([factory, portions]) => ({
                  factory,
                  portions,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                <XAxis dataKey="factory" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="portions" fill="#0F4C3A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                รายการสูตร
              </p>
              <h2 className="font-display text-2xl text-ink">Recipe list</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-ink/60">ค้นหา</span>
                <input
                  type="text"
                  placeholder="ชื่อสูตร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-full border border-ink/20 px-3 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-ink/60">หมวดอาหาร</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-full border border-ink/20 px-3 py-1"
                >
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-ink/60">โรงครัว</span>
                <select
                  value={factoryFilter}
                  onChange={(e) => setFactoryFilter(e.target.value)}
                  className="rounded-full border border-ink/20 px-3 py-1"
                >
                  {factoryOptions.map((factory) => (
                    <option key={factory}>{factory}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {(searchTerm !== "" || categoryFilter !== "ทั้งหมด" || factoryFilter !== "ทั้งหมด") && (
            <p className="text-xs text-ink/60">
              กำลังกรอง: ค้นหา = {searchTerm || "*"} · หมวด = {categoryFilter} · โรงครัว = {factoryFilter}
            </p>
          )}
          <div className="overflow-x-auto">
            <SortableTable
              columns={recipeColumns}
              data={filteredRecipes}
              rowKey={(row) => row.name}
              defaultSort={{ key: "portions", direction: "desc" }}
              onRowClick={(row) => setSelectedRecipe(row)}
            />
          </div>
        </section>

        {selectedRecipe && (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <DetailDrawer
              title="วัตถุดิบสำหรับสูตร"
              subtitle={selectedRecipe.name}
              actions={<Link href="/procurement" className="text-sm text-pine font-semibold">สร้าง PO →</Link>}
            >
              <ul className="space-y-3">
                {selectedRecipe.ingredients.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-ink/10 bg-clay/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-ink/60">{selectedRecipe.factory}</p>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {item.quantity} {item.uom}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink/60">
                ข้อมูลนี้ช่วยให้คำนวณความต้องการวัตถุดิบต่อสูตรก่อนสร้าง PO หรือวางแผน stock
              </p>
            </DetailDrawer>
            <div className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                ปฏิทินเมนู (mock)
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink/60">โรงครัว</span>
                <select
                  value={scheduleFactory}
                  onChange={(e) => setScheduleFactory(e.target.value)}
                  className="rounded-full border border-ink/20 px-3 py-1"
                >
                  {factoryOptions.map((factory) => (
                    <option key={factory}>{factory}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <SortableTable
                  columns={scheduleColumns}
                  data={filteredSchedule}
                  rowKey={(row) => `${row.date}-${row.factory}-${row.recipe}-${row.meal}`}
                  defaultSort={{ key: "date", direction: "asc" }}
                />
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">สรุปวัตถุดิบเสี่ยง</h2>
              <Link href="/procurement" className="text-sm text-pine font-semibold">
                ดูจัดซื้อ →
              </Link>
            </div>
            <ul className="space-y-3">
              {stockRisk.map((item) => (
                <li
                  key={item.ingredient}
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-clay/40 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{item.ingredient}</p>
                    <p className="text-xs text-ink/60">คงเหลือ {item.onHand} {item.uom}</p>
                  </div>
                  <span className="text-sm font-semibold text-ember">
                    {item.coverageDays.toFixed(1)} วัน
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-4">
            <h2 className="font-display text-2xl">โครงสร้างเมนู mock</h2>
            <p className="text-clay/80 text-sm">
              ข้อมูลเมนูแบ่งสัดส่วนตามมื้ออาหาร เพื่อเตรียมส่งต่อไปยังระบบแผนผลิต
              สามารถปรับเปอร์เซ็นต์ในโหมด mock เพื่อ simulate ต้นทุนรวม
            </p>
            <div className="grid gap-3">
              {mealShare.map((slice) => (
                <div key={slice.label} className="space-y-1">
                  <div className="flex justify-between text-xs uppercase tracking-[0.3em]">
                    <span>{slice.label}</span>
                    <span>{slice.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${slice.value}%`,
                        background: slice.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">Preview CSV Upload</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {Object.keys(csvPreviewData[0] || {}).map(key => <th key={key} className="pb-2 text-left font-semibold">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-ink/10">
                      {Object.values(row).map((val, j) => <td key={j} className="py-2 px-1">{String(val)}</td>)}
                    </tr>
                  ))}
                  {csvPreviewData.length > 10 && <tr><td colSpan={Object.keys(csvPreviewData[0] || {}).length} className="py-2 text-center text-ink/60">... and {csvPreviewData.length - 10} more rows</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={() => setShowPreview(false)} className="px-6 py-2 border border-ink/20 rounded-full hover:bg-ink/5 transition">
                Cancel
              </button>
              <button onClick={handleConfirmUpload} className="px-6 py-2 bg-pine text-clay rounded-full hover:bg-pine/90 transition">
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
