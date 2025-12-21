"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useRef, useState } from "react";
import {
  contractKPIs,
  ingredientPriceTrend,
  insights,
  mealShare,
  productionPlan,
  procurementAlerts,
  recipes,
  stockLevels,
  weeklyCostTrend,
} from "@/data/mock-dashboard";
import { useDataContext } from "@/context/DataContext";

type ImportState = {
  status: "idle" | "success" | "error";
  message: string;
  rows: number;
  timestamp?: string;
  fileName?: string;
};

const initialImportState: ImportState = {
  status: "idle",
  message: "รอไฟล์ CSV",
  rows: 0,
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

const parseCsvLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length);

const managementLinks = [
  {
    href: "/recipes",
    title: "จัดการสูตร",
    desc: "ปรับสูตร ต้นทุน และ export",
  },
  {
    href: "/factories",
    title: "แดชบอร์ดโรงครัว",
    desc: "เช็กกำลังการผลิตและ SLA",
  },
  {
    href: "/pricing",
    title: "ราคา & ต้นทุนวัตถุดิบ",
    desc: "Price book และกราฟราคาวัตถุดิบ",
  },
  {
    href: "/quotes",
    title: "ใบเสนอราคา",
    desc: "ติดตามสถานะ + ออกใบใหม่",
  },
  {
    href: "/procurement",
    title: "การจัดซื้อ",
    desc: "PO, สถานะส่งมอบ และ supplier",
  },
  {
    href: "/stock",
    title: "สต็อก & ปรับยอด",
    desc: "ประวัติการปรับสต็อกต่อครัว",
  },
];

const procurementStatusClass = (status: string) => {
  if (status === "คงเหลือน้อย") {
    return "bg-ember/20 text-ember";
  }
  if (status === "ราคาพุ่ง") {
    return "bg-sand/50 text-pine";
  }
  return "bg-clay/30 text-ink";
};

const inventoryStatusClass = (status: string) => {
  if (status === "พร้อมใช้") return "bg-sage/30 text-pine";
  if (status === "เริ่มตึง") return "bg-sand/40 text-pine";
  return "bg-ember/10 text-ember";
};

export default function Home() {
  const recipeInputRef = useRef<HTMLInputElement>(null);
  const stockInputRef = useRef<HTMLInputElement>(null);
  const [recipeImport, setRecipeImport] = useState<ImportState>(
    initialImportState,
  );
  const [stockImport, setStockImport] = useState<ImportState>(
    initialImportState,
  );
  const { isMock, toggleMock } = useDataContext();

  const lowCoverageCount = useMemo(
    () => stockLevels.filter((stock) => stock.coverageDays < 3).length,
    [],
  );

  const handleExportProductionPlan = () => {
    const headers = ["day", "shift", "headcount", "menu"];
    const rows = [
      headers.join(","),
      ...productionPlan.map((plan) =>
        [
          plan.day,
          plan.shift,
          plan.headcount,
          plan.menu.join(" | "),
        ].join(","),
      ),
    ];
    downloadCsv(rows, `production-plan-${Date.now()}.csv`);
  };

  const importStatusClass = (state: ImportState) => {
    if (state.status === "success") return "text-pine";
    if (state.status === "error") return "text-ember";
    return "text-ink/60";
  };

  const handleExport = (type: "recipes" | "stock") => {
    if (type === "recipes") {
      const rows = [
        "name,category,factory,portions,cost_per_plate,margin",
        ...recipes.map(
          (recipe) =>
            `${recipe.name},${recipe.category},${recipe.factory},${recipe.portions},${recipe.costPerPlate},${recipe.margin}`,
        ),
      ];
      downloadCsv(rows, `recipes-mock-${Date.now()}.csv`);
    } else {
      const rows = [
        "ingredient,on_hand,uom,coverage_days,status",
        ...stockLevels.map(
          (stock) =>
            `${stock.ingredient},${stock.onHand},${stock.uom},${stock.coverageDays},${stock.status}`,
        ),
      ];
      downloadCsv(rows, `stock-mock-${Date.now()}.csv`);
    }
  };

  const handleImport = (
    type: "recipes" | "stock",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = parseCsvLines(text);
      const hasHeader =
        lines[0]?.toLowerCase().includes("name") ||
        lines[0]?.toLowerCase().includes("ingredient");
      const payload = hasHeader ? lines.slice(1) : lines;

      if (!payload.length) {
        const errorState: ImportState = {
          status: "error",
          message: "ไม่พบข้อมูลในไฟล์ที่อัปโหลด",
          rows: 0,
          fileName: file.name,
        };
        if (type === "recipes") {
          setRecipeImport(errorState);
        } else {
          setStockImport(errorState);
        }
        return;
      }

      const successState: ImportState = {
        status: "success",
        message: `Import สำเร็จ ${payload.length} แถว`,
        rows: payload.length,
        fileName: file.name,
        timestamp: new Date().toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      if (type === "recipes") {
        setRecipeImport(successState);
      } else {
        setStockImport(successState);
      }
    };

    reader.onerror = () => {
      const errorState: ImportState = {
        status: "error",
        message: "อ่านไฟล์ไม่สำเร็จ กรุณาลองใหม่",
        rows: 0,
        fileName: file.name,
      };
      if (type === "recipes") {
        setRecipeImport(errorState);
      } else {
        setStockImport(errorState);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay via-background to-sand text-ink">
      <div className="grain" />
      <div className="page-shell max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-6">
          <div className="flex flex-col gap-3">
            <span className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
              MOCK CONTROL · CATERING CONTRACTOR
            </span>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                  ศูนย์ควบคุมการผลิตอาหารโรงงาน
                </h1>
                <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                  มอนิเตอร์สูตร ต้นทุน การจัดซื้อ ใบเสนอราคา และสต็อก แบบ mock data
                  พร้อมต่อยอดเชื่อม Odoo ผ่าน XML-RPC/JSON-RPC
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/quotes/new"
                  className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
                >
                  + ออกใบเสนอราคา
                </Link>
                <button
                  className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
                  onClick={() => recipeInputRef.current?.click()}
                >
                  Import สูตร (CSV)
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-2xl bg-white/80 px-5 py-4 shadow-panel border border-white/60 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-ink/50">
                  {insight.title}
                  <span
                    className={`text-xs ${insight.trend === "up"
                        ? "text-pine"
                        : insight.trend === "down"
                          ? "text-ember"
                          : "text-ink/50"
                      }`}
                  >
                    {insight.delta}
                  </span>
                </div>
                <p className="text-3xl font-display text-ink mt-2">
                  {insight.value}
                </p>
                <p className="text-sm text-ink/60 mt-2">{insight.note}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="rounded-3xl bg-white/80 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  แนวโน้มต้นทุนรายสัปดาห์
                </p>
                <h2 className="font-display text-2xl text-ink mt-1">
                  Cost & Margin Simulator
                </h2>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    name="ต้นทุน/จาน"
                    stroke="#0F4C3A"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="margin"
                    name="Margin %"
                    stroke="#D75F4B"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-white/80 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
              สัดส่วนมื้ออาหาร
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mealShare}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {mealShare.map((slice) => (
                      <Cell key={slice.label} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2">
              {contractKPIs.map((kpi) => (
                <div
                  key={kpi.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink/60">{kpi.label}</span>
                  <span className="font-semibold">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/80 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                ราคาวัตถุดิบสำคัญ (บาท/กก.)
              </p>
              <h2 className="font-display text-2xl text-ink mt-1">
                Chicken · Holy Basil · Coconut milk
              </h2>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingredientPriceTrend}>
                <defs>
                  <linearGradient id="colorChicken" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C3A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0F4C3A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBasil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D75F4B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D75F4B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCoconut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94b49f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#94b49f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="chicken"
                  stroke="#0F4C3A"
                  fillOpacity={1}
                  fill="url(#colorChicken)"
                  name="ไก่"
                />
                <Area
                  type="monotone"
                  dataKey="basil"
                  stroke="#D75F4B"
                  fillOpacity={1}
                  fill="url(#colorBasil)"
                  name="กะเพรา"
                />
                <Area
                  type="monotone"
                  dataKey="coconut"
                  stroke="#94b49f"
                  fillOpacity={1}
                  fill="url(#colorCoconut)"
                  name="กะทิ"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl bg-white/80 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  สูตรยอดนิยม
                </p>
                <h2 className="font-display text-2xl text-ink mt-1">
                  High-volume menus
                </h2>
              </div>
              <Link
                href="/recipes"
                className="text-sm font-semibold text-pine hover:text-ink transition"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-ink/60">
                    <th className="pb-3 font-semibold">สูตรอาหาร</th>
                    <th className="pb-3 font-semibold">โรงครัว</th>
                    <th className="pb-3 font-semibold text-center">จาน/วัน</th>
                    <th className="pb-3 font-semibold text-center">ต้นทุน</th>
                    <th className="pb-3 font-semibold text-center">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((recipe) => (
                    <tr
                      key={recipe.name}
                      className="border-t border-ink/5 hover:bg-clay/30 transition"
                    >
                      <td className="py-3">
                        <p className="font-semibold text-ink">{recipe.name}</p>
                        <p className="text-xs text-ink/60">{recipe.category}</p>
                      </td>
                      <td className="py-3 text-ink/80">{recipe.factory}</td>
                      <td className="py-3 text-center text-ink font-semibold">
                        {recipe.portions.toLocaleString()}
                      </td>
                      <td className="py-3 text-center text-ink font-semibold">
                        ฿{recipe.costPerPlate.toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full ${recipe.margin >= 20
                              ? "bg-sage/30 text-pine"
                              : "bg-ember/10 text-ember"
                            }`}
                        >
                          {recipe.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-3xl bg-ink text-clay shadow-panel p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-clay/60 font-semibold">
                  สัญญาซื้อวัตถุดิบ
                </p>
                <h3 className="font-display text-2xl">สัญญาเตือนภัย</h3>
              </div>
            </div>
            <div className="space-y-4">
              {procurementAlerts.map((alert) => (
                <div
                  key={alert.ingredient}
                  className="p-4 rounded-2xl border border-clay/10 bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg">{alert.ingredient}</p>
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${procurementStatusClass(
                        alert.status,
                      )}`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-clay/80">
                    Supplier · {alert.supplier}
                  </p>
                  <p className="text-sm text-clay mt-3">
                    กำหนดส่ง {alert.nextDelivery}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  Stock snapshot
                </p>
                <h3 className="font-display text-2xl text-ink">
                  Coverage & readiness
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-ink/60">
                  {lowCoverageCount} รายการ &lt; 3 วัน
                </span>
                <Link
                  href="/stock"
                  className="inline-flex items-center rounded-full border border-ink/30 px-4 py-2 text-xs font-semibold tracking-wide text-ink hover:bg-ink/5 transition"
                >
                  ไปจัดการปัญหาสต็อก →
                </Link>
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
                  </tr>
                </thead>
                <tbody>
                  {stockLevels.map((stock) => (
                    <tr
                      key={stock.ingredient}
                      className="border-t border-ink/5 hover:bg-clay/30 transition"
                    >
                      <td className="py-3">
                        <p className="font-semibold text-ink">
                          {stock.ingredient}
                        </p>
                        <p className="text-xs text-ink/60">{stock.uom}</p>
                      </td>
                      <td className="py-3 text-center font-semibold text-ink">
                        {stock.onHand.toLocaleString()} {stock.uom}
                      </td>
                      <td className="py-3 text-center font-semibold text-ink">
                        {stock.coverageDays.toFixed(1)} วัน
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full ${inventoryStatusClass(
                            stock.status,
                          )}`}
                        >
                          {stock.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-ink to-pine text-clay shadow-panel p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-clay/60 font-semibold">
                  Import / Export
                </p>
                <h3 className="font-display text-2xl">
                  Recipes & stock files
                </h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/20 bg-black/20 p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay/70">
                    Recipes
                  </p>
                  <p className={`text-sm ${importStatusClass(recipeImport)}`}>
                    {recipeImport.message}
                    {recipeImport.fileName && (
                      <span className="block text-xs text-clay/60">
                        {recipeImport.fileName} · {recipeImport.timestamp}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-clay/30 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-white/10 transition"
                    onClick={() => recipeInputRef.current?.click()}
                  >
                    Import CSV
                  </button>
                  <button
                    className="rounded-full bg-clay/20 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-clay/30 transition"
                    onClick={() => handleExport("recipes")}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/20 p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay/70">
                    Stock levels
                  </p>
                  <p className={`text-sm ${importStatusClass(stockImport)}`}>
                    {stockImport.message}
                    {stockImport.fileName && (
                      <span className="block text-xs text-clay/60">
                        {stockImport.fileName} · {stockImport.timestamp}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-clay/30 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-white/10 transition"
                    onClick={() => stockInputRef.current?.click()}
                  >
                    Import CSV
                  </button>
                  <button
                    className="rounded-full bg-clay/20 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-clay/30 transition"
                    onClick={() => handleExport("stock")}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <p className="text-xs text-clay/70">
                * เครื่องมือนี้เป็น mock UI ยังไม่เชื่อมต่อ Odoo จริง
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                  Production plan
                </p>
                <h3 className="font-display text-2xl text-ink">
                  Daily playbook (mock)
                </h3>
              </div>
              <button
                onClick={handleExportProductionPlan}
                className="text-sm font-semibold text-pine hover:text-ink transition rounded-full border border-pine/30 px-4 py-2"
              >
                Export CSV
              </button>
            </div>
            <div className="space-y-4">
              {productionPlan.map((plan) => (
                <div
                  key={`${plan.day}-${plan.shift}`}
                  className="rounded-2xl border border-ink/10 p-4 bg-clay/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
                        {plan.day}
                      </p>
                      <p className="font-display text-xl text-ink">
                        {plan.shift}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
                        Headcount
                      </p>
                      <p className="text-2xl font-semibold text-ink">
                        {plan.headcount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.menu.map((dish) => (
                      <span
                        key={dish}
                        className="text-xs font-semibold tracking-wide uppercase bg-white/80 text-ink px-3 py-1 rounded-full shadow-sm"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/85 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
              หน้าจอจัดการอื่น ๆ
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {managementLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-ink/10 bg-white/70 p-4 hover:border-ink/40 hover:-translate-y-1 transition flex flex-col gap-2"
                >
                  <span className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                    {link.desc}
                  </span>
                  <p className="text-lg font-semibold text-ink">{link.title}</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleMock}
                className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5 transition"
              >
                {isMock ? 'Mock Mode' : 'Real API Mode'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <input
        ref={recipeInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => handleImport("recipes", event)}
      />
      <input
        ref={stockInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => handleImport("stock", event)}
      />
    </div>
  );
}
