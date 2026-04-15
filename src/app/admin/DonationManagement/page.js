"use client";

import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function StatsCard({ label, value, icon, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-stone-950 p-5 flex items-center gap-4 ${accent}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent.replace("border-", "bg-").replace("/30", "/20")}`}>
        {icon}
      </div>
      <div>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">{label}</p>
        <p className="text-white text-2xl font-black mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donation/all`);
        if (!res.ok) throw new Error("Failed to fetch donations");
        const data = await res.json();
        setDonations(data.donations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────
  const totalAmount = donations.reduce((s, d) => s + d.amount, 0);
  const today = new Date().toDateString();
  const todayDonations = donations.filter(d => new Date(d.createdAt).toDateString() === today);
  const todayAmount = todayDonations.reduce((s, d) => s + d.amount, 0);

  // ── Filter + Sort ─────────────────────────────────────────────────
  const filtered = donations
    .filter((d) => {
      const q = search.toLowerCase();
      return (
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.contact?.includes(q) ||
        d.razorpayPaymentId?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "amount") { va = Number(va); vb = Number(vb); }
      if (sortField === "createdAt") { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-stone-600">↕</span>;
    return <span className="ml-1 text-orange-400">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-stone-400 text-sm font-semibold tracking-widest uppercase">Loading Donations…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="bg-red-950 border border-red-700 rounded-2xl px-8 py-10 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-red-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-red-300 font-bold text-lg mb-1">Failed to load donations</p>
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-stone-500 text-xs mt-3">Make sure <code className="text-orange-400">/api/donation/all</code> exists on your backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">

      {/* Top accent strip */}
      <div className="flex h-1">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white opacity-60" />
        <div className="flex-1 bg-green-700" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-orange-500 text-xs font-bold tracking-[0.25em] uppercase mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Donation <span className="text-orange-400">Management</span>
            </h1>
           
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-stone-300">{donations.length}</span> total records
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Collected"
            value={formatINR(totalAmount)}
            accent="border-orange-500/30"
            icon={<svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"/></svg>}
          />
          <StatsCard
            label="Total Donors"
            value={donations.length}
            accent="border-blue-500/30"
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"/></svg>}
          />
          <StatsCard
            label="Today's Donations"
            value={todayDonations.length}
            accent="border-green-500/30"
            icon={<svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
          />
          <StatsCard
            label="Today's Amount"
            value={formatINR(todayAmount)}
            accent="border-yellow-500/30"
            icon={<svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone, payment ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest">#</th>
                  <th
                    className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:text-orange-300 transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort("name")}
                  >
                    Donor Name <SortIcon field="name" />
                  </th>
                  <th className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest">Email</th>
                  <th className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest">Contact</th>
                  <th
                    className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:text-orange-300 transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort("amount")}
                  >
                    Amount <SortIcon field="amount" />
                  </th>
                  <th className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest">Payment ID</th>
                  <th
                    className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:text-orange-300 transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort("createdAt")}
                  >
                    Date & Time <SortIcon field="createdAt" />
                  </th>
                  <th className="text-left px-5 py-4 text-stone-400 font-bold text-xs uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-stone-500">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p className="font-semibold">{search ? "No results match your search" : "No donations yet"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((d, i) => {
                    const rowNum = (page - 1) * ITEMS_PER_PAGE + i + 1;
                    return (
                      <tr
                        key={d._id}
                        className="border-b border-stone-800/60 hover:bg-stone-800/40 transition-colors duration-150"
                      >
                        <td className="px-5 py-4 text-stone-500 font-mono text-xs">{rowNum}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {d.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="font-semibold text-white">{d.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-stone-300">{d.email}</td>
                        <td className="px-5 py-4 text-stone-300 font-mono text-xs">+91 {d.contact}</td>
                        <td className="px-5 py-4">
                          <span className="text-orange-400 font-black text-base">{formatINR(d.amount)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-stone-400 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700 select-all">
                            {d.razorpayPaymentId || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-white font-semibold text-xs">{formatDate(d.createdAt)}</p>
                            <p className="text-stone-500 text-xs">{formatTime(d.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-900/40 border border-green-700/40 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Success
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-stone-800">
              <p className="text-stone-500 text-xs">
                Showing <span className="text-white font-semibold">{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of <span className="text-white font-semibold">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 border border-stone-700 text-stone-300 hover:border-orange-500 hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-stone-600 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          page === p
                            ? "bg-orange-500 text-white border border-orange-400"
                            : "bg-stone-800 border border-stone-700 text-stone-300 hover:border-orange-500 hover:text-orange-300"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 border border-stone-700 text-stone-300 hover:border-orange-500 hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}