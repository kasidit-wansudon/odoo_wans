"use client";

import Link from "next/link";
import { procurementOrders, stockAdjustments } from "@/data/mock-dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCallback, useMemo, useRef, useState } from "react";
import { SortableTable, Column } from "@/components/ui/SortableTable";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import React from "react";

const statusChip = (status: string) => {
  if (status === "รับเข้าแล้ว") return "bg-sage/30 text-pine";
  if (status === "สั่งซื้อแล้ว") return "bg-sand/40 text-pine";
  return "bg-ember/10 text-ember";
};

const totalValue = procurementOrders.reduce((sum, po) => sum + po.total, 0);
const statusSummary = procurementOrders.reduce<Record<string, number>>(
  (acc, po) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    return acc;
  },
  {},
);
const supplierTotals = Object.entries(
  procurementOrders.reduce<Record<string, number>>((acc, po) => {
    acc[po.supplier] = (acc[po.supplier] || 0) + po.total;
    return acc;

  }, {}),
).map(([supplier, total]) => ({ supplier, total }));

const supplierOptions = ["ทั้งหมด", ...procurementOrders.map((po) => po.supplier)];
const statusOptions = ["ทั้งหมด", "รออนุมัติ", "สั่งซื้อแล้ว", "รับเข้าแล้ว"];

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

export default function ProcurementPage() {
  const handleExportProcurement = () => {
    const headers = ["poNumber", "supplier", "itemSummary", "eta", "status", "total"];
    const rows = [
      headers.join(","),
      ...procurementOrders.map(po => [
        po.poNumber,
        po.supplier,
        po.itemSummary,
        po.eta,
        po.status,
        po.total,
      ].join(",")),
    ];
    downloadCsv(rows, "procurement_orders.csv");
  };
  const [selectedPo, setSelectedPo] = useState<
    (typeof procurementOrders)[number] | null
  >(procurementOrders[0] ?? null);
  const [supplierFilter, setSupplierFilter] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");

  const procurementInputRef = useRef<HTMLInputElement>(null);
  const [procurementCsvPreview, setProcurementCsvPreview] = useState<Record<string, string>[]>([]);
  const [showProcurementPreview, setShowProcurementPreview] = useState(false);

  const handleProcurementCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setProcurementCsvPreview(data);
      setShowProcurementPreview(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmProcurementUpload = async () => {
    console.log('Uploading procurement', procurementCsvPreview);
    setShowProcurementPreview(false);
  };

  const handlePrint = useCallback((po: (typeof procurementOrders)[number]) => {
    if (typeof window === "undefined") return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    const doc = printWindow.document;
    doc.write(`
      <html>
        <head>
          <title>PO ${po.poNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #142022; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .section { margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .meta { font-size: 14px; color: #444; }
          </style>
        </head>
        <body>
          <h1>Purchase Order ${po.poNumber}</h1>
          <div class="meta">Supplier: ${po.supplier}</div>
          <div class="meta">ETA: ${po.eta}</div>
          <div class="meta">Status: ${po.status}</div>
          <div class="section">
            <strong>Summary</strong>
            <p>${po.itemSummary}</p>
            <p>Total: ฿${po.total.toLocaleString()}</p>
          </div>
          <footer class="section meta">
            Mock document for demo purposes only.
          </footer>
        </body>
      </html>
    `);
    doc.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 300);
  }, []);

  const filteredOrders = useMemo(() => {
    return procurementOrders.filter((po) => {
      const supplierOk =
        supplierFilter === "ทั้งหมด" || po.supplier === supplierFilter;
      const statusOk =
        statusFilter === "ทั้งหมด" || po.status === statusFilter;
      const searchOk =
        searchTerm === "" ||
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return supplierOk && statusOk && searchOk;
    });
  }, [supplierFilter, statusFilter, searchTerm]);

  const procurementColumns: Column<typeof procurementOrders[number]>[] = [
    {
      key: "poNumber",
      label: "PO Number",
      sortable: true,
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
    },
    {
      key: "itemSummary",
      label: "Items",
    },
    {
      key: "eta",
      label: "ETA",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "center",
      sortable: true,
      render: (row) => `฿${row.total.toLocaleString()}`,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <Link
            href={`/procurement/new?po=${row.poNumber}`}
            className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <button
            type="button"
            className="px-3 py-1 rounded-full border border-ink/20 hover:bg-ink/5 text-xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handlePrint(row);
            }}
          >
            Export
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-clay/40 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-5xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Procurement control
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                การจัดซื้อและรับเข้าวัตถุดิบ
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                ดูสถานะ PO สรุปค่าใช้จ่าย และ log การปรับ stock ในฝั่งโรงครัว (mock data)
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/procurement/new"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                + สร้าง PO ใหม่
              </Link>
              <button className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export รายงาน
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">จำนวน PO</p>
            <p className="text-3xl font-display">{procurementOrders.length}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">ยอดรวม</p>
            <p className="text-3xl font-display">
              ฿{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">PO รออนุมัติ</p>
            <p className="text-3xl font-display">
              {statusSummary["รออนุมัติ"] ?? 0}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-panel p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">PO รับเข้าแล้ว</p>
            <p className="text-3xl font-display">
              {statusSummary["รับเข้าแล้ว"] ?? 0}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                Supplier spend
              </p>
              <h2 className="font-display text-2xl text-ink">Mock spend by supplier</h2>
            </div>
            <span className="text-xs text-ink/60">mock data</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6D0B180" />
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    `฿${Number(value ?? 0).toLocaleString()}`
                  }
                />
                <Bar dataKey="total" fill="#0F4C3A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                รายการ PO
              </p>
              <h2 className="font-display text-2xl text-ink">Purchase orders (mock)</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportProcurement}
                className="text-sm font-semibold text-pine hover:text-ink transition"
              >
                Export CSV
              </button>
              <button
                onClick={() => procurementInputRef.current?.click()}
                className="text-sm font-semibold text-pine hover:text-ink transition"
              >
                Import CSV
              </button>
            </div>
            <input
              ref={procurementInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleProcurementCsvUpload}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-ink/60">ค้นหา PO</span>
              <input
                type="text"
                placeholder="PO No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full border border-ink/20 px-3 py-1"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-ink/60">Supplier</span>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="rounded-full border border-ink/20 px-3 py-1"
              >
                {supplierOptions.map((supplier) => (
                  <option key={supplier}>{supplier}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-ink/60">สถานะ</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-ink/20 px-3 py-1"
              >
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          {searchTerm !== "" ||
          supplierFilter !== "ทั้งหมด" ||
          statusFilter !== "ทั้งหมด" ? (
            <p className="text-xs text-ink/60">
              กำลังกรอง: ค้นหา = {searchTerm || "*"} · Supplier ={" "}
              {supplierFilter !== "ทั้งหมด" ? supplierFilter : "*"} · สถานะ ={" "}
              {statusFilter !== "ทั้งหมด" ? statusFilter : "*"}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <SortableTable
              columns={procurementColumns}
              data={filteredOrders}
              rowKey={(row) => row.poNumber}
              defaultSort={{ key: "poNumber", direction: "asc" }}
              onRowClick={(row) => setSelectedPo(row)}
            />
          </div>
        </section>

        {selectedPo && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <DetailDrawer
              title="รายละเอียด PO"
              subtitle={selectedPo!.poNumber}
              actions={
                <button
                  className="rounded-full bg-ink text-clay px-4 py-2 text-sm font-semibold shadow-panel"
                  onClick={() => handlePrint(selectedPo!)}
                >
                  Print PDF
                </button>
              }
            >
              <div className="grid gap-3 text-sm text-ink/80">
                <p>
                  <span className="font-semibold">Supplier:</span> {selectedPo!.supplier}
                </p>
                <p>
                  <span className="font-semibold">สถานะ:</span> {selectedPo!.status}
                </p>
                <p>
                  <span className="font-semibold">ETA:</span> {selectedPo!.eta}
                </p>
                <p>
                  <span className="font-semibold">สรุปรายการ:</span> {selectedPo!.itemSummary}
                </p>
                <p>
                  <span className="font-semibold">ยอดรวม:</span>{" "}
                  ฿{selectedPo!.total.toLocaleString()}
                </p>
              </div>
            </DetailDrawer>
            <div className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                Steps (mock)
              </p>
              <ol className="mt-4 space-y-3 text-sm text-ink/70">
                <li>1. ตรวจสอบข้อมูล supplier</li>
                <li>2. ตรวจสอบกำหนดส่งและความพร้อมคลัง</li>
                <li>3. ส่งเอกสารให้ฝ่ายจัดซื้ออนุมัติ</li>
                <li>4. กด Print PDF เพื่อออกเอกสาร</li>
              </ol>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Log ปรับ stock ล่าสุด</h2>
            <Link href="/stock" className="text-sm text-pine font-semibold">
              ไปหน้าสต็อก →
            </Link>
          </div>
          <ul className="space-y-3 text-sm">
            {stockAdjustments.map((log, index) => (
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

      {showProcurementPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">Preview Procurement CSV Upload</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {Object.keys(procurementCsvPreview[0] || {}).map(key => <th key={key} className="pb-2 text-left font-semibold">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {procurementCsvPreview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      {Object.values(row).map((val, j) => <td key={j} className="py-2 px-1">{String(val)}</td>)}
                    </tr>
                  ))}
                  {procurementCsvPreview.length > 10 && <tr><td colSpan={Object.keys(procurementCsvPreview[0] || {}).length} className="py-2 text-center text-gray-500">... and {procurementCsvPreview.length - 10} more rows</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-4 justify-end">
              <button onClick={() => setShowProcurementPreview(false)} className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirmProcurementUpload} className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
