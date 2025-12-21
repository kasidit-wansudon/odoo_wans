"use client";

import Link from "next/link";
import { quotes } from "@/data/mock-dashboard";
import { useMemo, useRef, useState } from "react";
import { SortableTable, Column } from "@/components/ui/SortableTable";
import { DetailDrawer } from "@/components/ui/DetailDrawer";

const statusClass = (status: string) => {
  if (status === "อนุมัติ") return "bg-sage/30 text-pine";
  if (status === "ส่งแล้ว") return "bg-sand/40 text-pine";
  return "bg-ink/10 text-ink";
};

const statusOptions = ["ทั้งหมด", "ร่าง", "ส่งแล้ว", "อนุมัติ"];
const plantOptions = ["ทั้งหมด", ...quotes.map((quote) => quote.plant)];

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

export default function QuotesPage() {
  const handleExportQuotes = () => {
    const headers = ["id", "client", "plant", "mealCount", "pricePerHead", "status", "effectiveDate", "note"];
    const rows = [
      headers.join(","),
      ...quotes.map(quote => [
        quote.id,
        quote.client,
        quote.plant,
        quote.mealCount,
        quote.pricePerHead,
        quote.status,
        quote.effectiveDate,
        quote.note || '',
      ].join(",")),
    ];
    downloadCsv(rows, "quotes.csv");
  };

  const quotesInputRef = useRef<HTMLInputElement>(null);
  const [quotesCsvPreview, setQuotesCsvPreview] = useState<Record<string, string>[]>([]);
  const [showQuotesPreview, setShowQuotesPreview] = useState(false);

  const handleQuotesCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setQuotesCsvPreview(data);
      setShowQuotesPreview(true);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmQuotesUpload = async () => {
    // Mock save
    console.log('Uploading quotes', quotesCsvPreview);
    setShowQuotesPreview(false);
  };

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editedQuoteData, setEditedQuoteData] = useState<Record<string, Partial<typeof quotes[number]>>>({});

  const handleEditQuote = (quote: typeof quotes[number]) => {
    setEditingQuoteId(quote.id);
    setEditedQuoteData(prev => ({ ...prev, [quote.id]: { ...quote } }));
  };

  const handleSaveQuote = (id: string) => {
    console.log('Save quote', editedQuoteData[id]);
    setEditingQuoteId(null);
  };
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [plantFilter, setPlantFilter] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<typeof quotes[number] | null>(null);

  const columns = useMemo<Column<typeof quotes[number]>[]>(
    () => [
      {
        key: "id",
        label: "รหัส",
        sortable: true,
      },
      {
        key: "client",
        label: "ลูกค้า",
        render: (row) => (
          <div>
            <p className="font-semibold text-ink">{row.client}</p>
            <p className="text-xs text-ink/60">{row.note}</p>
          </div>
        ),
      },
      {
        key: "plant",
        label: "โรงครัว",
        sortable: true,
      },
      {
        key: "mealCount",
        label: "จำนวนหัว",
        align: "center",
        sortable: true,
        render: (row) => row.mealCount.toLocaleString(),
      },
      {
        key: "pricePerHead",
        label: "ราคา/หัว",
        align: "center",
        sortable: true,
        render: (row) => {
          if (editingQuoteId === row.id) {
            return <input type="number" value={editedQuoteData[row.id]?.pricePerHead ?? row.pricePerHead} onChange={(e) => setEditedQuoteData(prev => ({ ...prev, [row.id]: { ...prev[row.id], pricePerHead: +e.target.value } }))} className="rounded border px-2 py-1 w-20 text-center" />;
          } else {
            return `฿${row.pricePerHead}`;
          }
        },
      },
      {
        key: "status",
        label: "สถานะ",
        align: "center",
        render: (row) => (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(row.status)}`}>
            {row.status}
          </span>
        ),
      },
      {
        key: "effectiveDate",
        label: "Effective date",
        sortable: true,
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (row) => (
          editingQuoteId === row.id ? (
            <div className="flex gap-2 justify-center">
              <button onClick={() => handleSaveQuote(row.id)} className="px-3 py-1 rounded bg-pine text-white text-xs">Save</button>
              <button onClick={() => setEditingQuoteId(null)} className="px-3 py-1 rounded border text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => handleEditQuote(row)} className="px-3 py-1 rounded border text-xs hover:bg-gray-100">Edit</button>
          )
        ),
      },
    ],
    [editingQuoteId, editedQuoteData, handleSaveQuote],
  );

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const statusOk =
        statusFilter === "ทั้งหมด" || quote.status === statusFilter;
      const plantOk = plantFilter === "ทั้งหมด" || quote.plant === plantFilter;
      const searchOk =
        searchTerm === "" || quote.client.toLowerCase().includes(searchTerm.toLowerCase());
      return statusOk && plantOk && searchOk;
    });
  }, [statusFilter, plantFilter, searchTerm]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-clay/40 via-background to-white text-ink">
      <div className="grain" />
      <div className="page-shell max-w-5xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-[0.4em] text-xs text-ink/60 font-code">
            Quote pipeline
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
                ใบเสนอราคาลูกค้าโรงงาน
              </h1>
              <p className="text-ink/70 max-w-3xl mt-2 text-base sm:text-lg">
                ติดตามสถานะใบเสนอราคา ราคา/หัว จำนวนหัว และ plant ที่รองรับ (mock data)
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quotes/new"
                className="rounded-full bg-ink text-clay px-5 py-3 text-sm font-semibold tracking-wide shadow-panel hover:-translate-y-0.5 transition"
              >
                + สร้างใบเสนอราคา
              </Link>
              <button className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-ink/5 transition">
                Export pipeline
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white/95 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
                รายการใบเสนอราคา
              </p>
              <h2 className="font-display text-2xl text-ink">Quote pipeline (mock)</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportQuotes} className="text-sm font-semibold text-pine hover:text-ink transition">Export CSV</button>
              <button 
                className="text-sm font-semibold text-pine hover:text-ink transition"
                onClick={() => quotesInputRef.current?.click()}
              >
                Import CSV
              </button>
              <input
                ref={quotesInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleQuotesCsvUpload}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-ink/60">ค้นหา</span>
              <input
                type="text"
                placeholder="รหัส / ลูกค้า"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full border border-ink/20 px-3 py-1"
              />
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
            <label className="flex items-center gap-2">
              <span className="text-ink/60">โรงครัว</span>
              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="rounded-full border border-ink/20 px-3 py-1"
              >
                {plantOptions.map((plant) => (
                  <option key={plant}>{plant}</option>
                ))}
              </select>
            </label>
          </div>
          {searchTerm !== "" || statusFilter !== "ทั้งหมด" || plantFilter !== "ทั้งหมด" ? (
            <p className="text-xs text-ink/60">
              กำลังกรอง: ค้นหา = {searchTerm || "*"} · สถานะ = {statusFilter} · โรงครัว = {plantFilter}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <SortableTable
              columns={columns}
              data={filteredQuotes}
              rowKey={(row) => row.id}
              defaultSort={{ key: "effectiveDate", direction: "asc" }}
              onRowClick={(row) => setSelectedQuote(row)}
            />
          </div>
        </section>

        {selectedQuote && (
          <DetailDrawer
            title="รายละเอียดใบเสนอราคา"
            subtitle={selectedQuote.id}
            actions={
              <button className="rounded-full bg-ink text-clay px-4 py-2 text-sm font-semibold shadow-panel">
                สร้าง PO จากใบนี้
              </button>
            }
          >
            <div className="space-y-4 text-sm text-ink/80">
              <p>
                <span className="font-semibold">ลูกค้า:</span> {selectedQuote.client}
              </p>
              <p>
                <span className="font-semibold">โรงครัว:</span> {selectedQuote.plant}
              </p>
              <p>
                <span className="font-semibold">จำนวนหัว:</span> {selectedQuote.mealCount.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">ราคา/หัว:</span> ฿{selectedQuote.pricePerHead.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">ยอดรวมโดยประมาณ:</span> ฿
                {(selectedQuote.mealCount * selectedQuote.pricePerHead).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">หมายเหตุ:</span> {selectedQuote.note}
              </p>
            </div>
          </DetailDrawer>
        )}
        <div className="rounded-3xl bg-white/90 border border-white/60 shadow-panel backdrop-blur-sm p-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-ink/40 font-semibold">
            ไฟล์แนบ mock
          </p>
          <ul className="space-y-2 text-sm text-ink/70">
            <li>proposal.pdf</li>
            <li>contract.docx</li>
            <li>menu-samples.xlsx</li>
          </ul>
        </div>
      </div>
    </div>
    {showQuotesPreview && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-5xl max-h-[80vh] w-full overflow-auto">
          <h2 className="font-display text-2xl mb-4">Preview Quotes CSV Upload</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  {Object.keys(quotesCsvPreview[0] || {}).map((key) => (
                    <th key={key} className="pb-2 text-left font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotesCsvPreview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="py-2 px-1">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
                {quotesCsvPreview.length > 10 && (
                  <tr>
                    <td
                      colSpan={Object.keys(quotesCsvPreview[0] || {}).length}
                      className="py-2 text-center text-gray-500"
                    >
                      ... and {quotesCsvPreview.length - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex gap-4 justify-end">
            <button
              onClick={() => setShowQuotesPreview(false)}
              className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmQuotesUpload}
              className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              Confirm Upload
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
