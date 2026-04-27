"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white " +
  "focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400 min-h-[44px]";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconSpinner = ({ cls = "w-4 h-4" }) => (
  <svg className={`${cls} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconChevron = ({ dir = "left" }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
  </svg>
);

// ── Shared Primitives ─────────────────────────────────────────────────────────
function Field({ label, required, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] select-none">
        {label}
        {required && <span className="text-[#FF671F] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ number, children }) {
  return (
    <div className="flex items-center gap-2 mt-7 mb-4 first:mt-0">
      <span className="block w-1 h-5 rounded-full bg-[#FF671F] shrink-0" />
      <h4 className="text-[10px] font-black tracking-widest uppercase text-[#1a2744]">
        {number && <span className="text-[#FF671F] mr-1">{number} —</span>}
        {children}
      </h4>
      <span className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Image Upload Box ──────────────────────────────────────────────────────────
function ImageUploadBox({ label, required, preview, inputRef, onChange, onClear, isChanged }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 w-full justify-center flex-wrap">
        <span className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] text-center leading-tight">{label}</span>
        {required && !preview && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-[#FF671F] px-1.5 py-0.5 rounded-full shrink-0">Required</span>
        )}
        {isChanged && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-[#FF671F] px-1.5 py-0.5 rounded-full shrink-0">New</span>
        )}
        {!isChanged && preview && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-green-500 px-1.5 py-0.5 rounded-full shrink-0">✓</span>
        )}
      </div>
      <div
        className="relative w-full rounded-2xl overflow-hidden transition group"
        style={{
          height: "clamp(80px, 20vw, 128px)",
          border: `2px dashed ${isChanged ? "#FF671F" : preview ? "#22c55e" : "#e5e7eb"}`,
          cursor: preview ? "default" : "pointer",
          background: preview ? "transparent" : "#fafafa",
        }}
        onClick={!preview ? () => inputRef.current?.click() : undefined}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#293C86] transition">
            <IconUpload />
            <span className="text-[10px] font-semibold hidden sm:block">Click to Upload</span>
            <span className="text-[10px] font-semibold sm:hidden">Tap</span>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="flex flex-col items-center gap-1 text-white hover:text-blue-300 transition">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <IconEdit />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-1.5 w-full">
        <button type="button" onClick={() => inputRef.current?.click()} className="flex-1 text-[10px] font-bold px-2 py-2 rounded-xl border border-[#293C86] text-[#293C86] hover:bg-[#293C86] hover:text-white transition min-h-[36px]">
          {preview ? "Change" : "Upload"}
        </button>
        {isChanged && (
          <button type="button" onClick={onClear} className="text-[10px] font-bold px-2 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition min-h-[36px]">Reset</button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} className="hidden" />
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ martyr, onClose }) {
  if (!martyr) return null;
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const Row = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black tracking-widest uppercase text-[#FF671F]">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F] rounded-t-2xl z-10">
          <div>
            <h3 className="text-white font-bold text-base">{martyr.fullName}</h3>
            <p className="text-white/60 text-xs mt-0.5">{martyr.unit}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            <IconClose />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photos */}
          {(martyr.photo?.url || martyr.certificate?.url) && (
            <div className="flex gap-4 flex-wrap">
              {martyr.photo?.url && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#FF671F]">Photo</span>
                  <img src={martyr.photo.url} alt="Photo" className="w-28 h-28 object-cover rounded-xl border border-gray-200" />
                </div>
              )}
              {martyr.certificate?.url && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#FF671F]">Certificate</span>
                  <img src={martyr.certificate.url} alt="Certificate" className="w-28 h-28 object-cover rounded-xl border border-gray-200" />
                </div>
              )}
            </div>
          )}

          {/* Personal */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] mb-3 border-b border-gray-100 pb-1">Personal Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Row label="Full Name" value={martyr.fullName} />
              <Row label="Date of Birth" value={fmt(martyr.dob)} />
            </div>
          </div>

          {/* Army */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] mb-3 border-b border-gray-100 pb-1">Army Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Row label="Unit / Regiment" value={martyr.unit} />
              <Row label="Enrollment Date" value={fmt(martyr.enrollmentDate)} />
            </div>
          </div>

          {/* Martyrdom */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] mb-3 border-b border-gray-100 pb-1">Martyrdom Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <Row label="Date of Martyrdom" value={fmt(martyr.martyrdomDate)} />
              <Row label="Place" value={martyr.placeOfMartyrdom} />
            </div>
            <Row label="Incident Description" value={martyr.incidentDescription} />
          </div>

          {/* Family */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] mb-3 border-b border-gray-100 pb-1">Family Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Row label="Wife's Name" value={martyr.wifeName} />
              <Row label="Number of Sons" value={martyr.numberOfSons} />
              <Row label="Parents Details" value={martyr.parentsDetails} />
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] mb-3 border-b border-gray-100 pb-1">Address</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Row label="Village" value={martyr.village} />
              <Row label="Post Office" value={martyr.postOffice} />
              <Row label="Taluka" value={martyr.taluka} />
              <Row label="District" value={martyr.district} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ martyr, onClose, onConfirm, loading }) {
  if (!martyr) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <IconTrash />
        </div>
        <h3 className="text-base font-black text-[#1a2744] text-center">Delete Record?</h3>
        <p className="text-sm text-gray-500 text-center mt-1">
          Are you sure you want to delete <span className="font-bold text-gray-800">{martyr.fullName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60"
          >
            {loading && <IconSpinner />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── EMPTY FORM CONSTANT
// ══════════════════════════════════════════════════════════════════════════════
const EMPTY_FORM = {
  fullName: "", dob: "", unit: "", enrollmentDate: "",
  martyrdomDate: "", placeOfMartyrdom: "", incidentDescription: "",
  wifeName: "", numberOfSons: "", parentsDetails: "",
  village: "", postOffice: "", taluka: "", district: "",
};

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MartyrVeerJawanPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null); // null = create mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef(null);

  const [certFile, setCertFile] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const certRef = useRef(null);

  // ── Table state ─────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [tableMeta, setTableMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [viewMartyr, setViewMartyr] = useState(null);
  const [deleteMartyr, setDeleteMartyr] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formRef = useRef(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const makeFileHandler = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const clearForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
    setSuccess("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setCertFile(null);
    setCertPreview(null);
    if (photoRef.current) photoRef.current.value = "";
    if (certRef.current) certRef.current.value = "";
  };

  // ── Fetch table data ─────────────────────────────────────────────────────────
  const fetchMartyrs = useCallback(async (page = 1, searchVal = search) => {
    setTableLoading(true);
    setTableError("");
    try {
      const params = new URLSearchParams({ page, limit: tableMeta.limit });
      if (searchVal.trim()) params.set("search", searchVal.trim());
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/martyrs?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setTableData(data.data);
      setTableMeta({ total: data.total, page: data.page, limit: data.limit });
    } catch (err) {
      setTableError(err.message);
    } finally {
      setTableLoading(false);
    }
  }, [search, tableMeta.limit]);

  useEffect(() => { fetchMartyrs(1, search); }, [search]);

  // ── Submit (create or update) ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const payload = {
        ...form,
        photo: photoFile ? await toBase64(photoFile) : (editId && photoPreview ? undefined : null),
        certificate: certFile ? await toBase64(certFile) : undefined,
      };

      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/martyrs/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/martyrs`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(editId ? "Martyr profile updated successfully!" : "Martyr profile registered successfully!");
      clearForm();
      fetchMartyrs(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Edit: load into form ──────────────────────────────────────────────────────
  const handleEdit = (martyr) => {
    const toInputDate = (d) => d ? new Date(d).toISOString().split("T")[0] : "";
    setForm({
      fullName: martyr.fullName || "",
      dob: toInputDate(martyr.dob),
      unit: martyr.unit || "",
      enrollmentDate: toInputDate(martyr.enrollmentDate),
      martyrdomDate: toInputDate(martyr.martyrdomDate),
      placeOfMartyrdom: martyr.placeOfMartyrdom || "",
      incidentDescription: martyr.incidentDescription || "",
      wifeName: martyr.wifeName || "",
      numberOfSons: martyr.numberOfSons ?? "",
      parentsDetails: martyr.parentsDetails || "",
      village: martyr.village || "",
      postOffice: martyr.postOffice || "",
      taluka: martyr.taluka || "",
      district: martyr.district || "",
    });
    setEditId(martyr._id);
    setPhotoFile(null);
    setPhotoPreview(martyr.photo?.url || null);
    setCertFile(null);
    setCertPreview(martyr.certificate?.url || null);
    setError("");
    setSuccess("");
    // Scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // ── Delete confirm ────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteMartyr) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/martyrs/${deleteMartyr._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteMartyr(null);
      fetchMartyrs(tableMeta.page);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Search submit ─────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(tableMeta.total / tableMeta.limit);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-screen-lg mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-8">

        {/* ── Page Header ── */}
        <div ref={formRef}>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1a2744] tracking-tight leading-tight">
            Martyr Veer Jawan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Register a martyr's complete profile with all required details.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── Form Card ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">
                {editId ? "Edit Martyr Profile" : "New Martyr Registration"}
              </h2>
              <p className="text-white/60 text-xs mt-0.5">Fill all required fields marked with *</p>
            </div>
            {editId && (
              <button onClick={clearForm} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition border border-white/20">
                ✕ Cancel Edit
              </button>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <SectionTitle number="01">Personal Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Full Name" required>
                <input className={inputCls} placeholder="Enter full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" className={inputCls} value={form.dob} onChange={(e) => set("dob", e.target.value)} required />
              </Field>
            </div>

            <SectionTitle number="02">Army Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Unit / Regiment" required>
                <input className={inputCls} placeholder="e.g. 21 Maratha Light Infantry" value={form.unit} onChange={(e) => set("unit", e.target.value)} required />
              </Field>
              <Field label="Date of Enrollment" required>
                <input type="date" className={inputCls} value={form.enrollmentDate} onChange={(e) => set("enrollmentDate", e.target.value)} required />
              </Field>
            </div>

            <SectionTitle number="03">Martyr Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Date of Martyrdom" required>
                <input type="date" className={inputCls} value={form.martyrdomDate} onChange={(e) => set("martyrdomDate", e.target.value)} required />
              </Field>
              <Field label="Place of Martyrdom" required>
                <input className={inputCls} placeholder="City / State / Region" value={form.placeOfMartyrdom} onChange={(e) => set("placeOfMartyrdom", e.target.value)} required />
              </Field>
              <Field label="Incident Description (Cause of Martyrdom)" required className="col-span-full">
                <textarea className={`${inputCls} resize-y min-h-[100px]`} placeholder="Describe the incident and circumstances of martyrdom..." value={form.incidentDescription} onChange={(e) => set("incidentDescription", e.target.value)} required />
              </Field>
            </div>

            <SectionTitle number="04">Family Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Wife's Name">
                <input className={inputCls} placeholder="Enter wife's full name" value={form.wifeName} onChange={(e) => set("wifeName", e.target.value)} />
              </Field>
              <Field label="Number of Sons">
                <input type="number" min="0" className={inputCls} placeholder="0" value={form.numberOfSons} onChange={(e) => set("numberOfSons", e.target.value)} />
              </Field>
              <Field label="Parents Details" className="col-span-full">
                <textarea className={`${inputCls} resize-y min-h-[80px]`} placeholder="Father's name, mother's name, contact details, etc." value={form.parentsDetails} onChange={(e) => set("parentsDetails", e.target.value)} />
              </Field>
            </div>

            <SectionTitle number="05">Address Details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Village" required>
                <input className={inputCls} placeholder="Village name" value={form.village} onChange={(e) => set("village", e.target.value)} required />
              </Field>
              <Field label="Post Office" required>
                <input className={inputCls} placeholder="Post office name" value={form.postOffice} onChange={(e) => set("postOffice", e.target.value)} required />
              </Field>
              <Field label="Taluka / Tehsil" required>
                <input className={inputCls} placeholder="Taluka or tehsil name" value={form.taluka} onChange={(e) => set("taluka", e.target.value)} required />
              </Field>
              <Field label="District" required>
                <input className={inputCls} placeholder="District name" value={form.district} onChange={(e) => set("district", e.target.value)} required />
              </Field>
            </div>

            <SectionTitle number="06">Media Uploads</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md">
              <ImageUploadBox label="Photo" required preview={photoPreview} inputRef={photoRef} isChanged={!!photoFile}
                onChange={makeFileHandler(setPhotoFile, setPhotoPreview)}
                onClear={() => { setPhotoFile(null); setPhotoPreview(null); if (photoRef.current) photoRef.current.value = ""; }} />
              <ImageUploadBox label="Certificate" required={false} preview={certPreview} inputRef={certRef} isChanged={!!certFile}
                onChange={makeFileHandler(setCertFile, setCertPreview)}
                onClear={() => { setCertFile(null); setCertPreview(null); if (certRef.current) certRef.current.value = ""; }} />
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-2">Accepted formats: JPG, PNG, WEBP · Max 5 MB each</p>

            {/* Error / Success */}
            {error && (
              <div className="mt-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-5 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
              <button type="button" onClick={clearForm} className="w-full sm:w-36 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition min-h-[48px]">
                {editId ? "Cancel" : "Clear Form"}
              </button>
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FF671F] text-white text-sm font-bold hover:bg-[#e55a17] transition disabled:opacity-60 shadow-md shadow-[#FF671F]/20 min-h-[48px]">
                {loading && <IconSpinner />}
                {loading ? (editId ? "Updating…" : "Registering…") : (editId ? "Update Martyr Profile" : "Register Martyr Profile")}
              </button>
            </div>
          </form>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── Data Table Card ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
            <div>
              <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">Registered Martyrs</h2>
              <p className="text-white/60 text-xs mt-0.5">
                {tableMeta.total} record{tableMeta.total !== 1 ? "s" : ""} found
              </p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <IconSearch />
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search name, unit, district…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none focus:border-white/50 focus:bg-white/15 transition min-h-[36px]"
                />
              </div>
              <button type="submit" className="px-3 py-2 rounded-xl bg-[#FF671F] text-white text-xs font-bold hover:bg-[#e55a17] transition min-h-[36px] shrink-0">
                Search
              </button>
              {search && (
                <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} className="px-2 py-2 rounded-xl bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition min-h-[36px] shrink-0">
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            {tableLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
                <IconSpinner cls="w-5 h-5" />
                <span className="text-sm">Loading records…</span>
              </div>
            ) : tableError ? (
              <div className="text-center py-16 text-red-500 text-sm">{tableError}</div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No records found.</div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["#", "Photo", "Full Name", "Unit / Regiment", "Martyrdom Date", "Place", "District", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[9px] font-black tracking-widest uppercase text-[#1a2744] whitespace-nowrap bg-gray-50/60">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((m, i) => (
                    <tr key={m._id} className="border-b border-gray-50 hover:bg-[#293C86]/3 transition group">
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-400 font-medium whitespace-nowrap">
                        {(tableMeta.page - 1) * tableMeta.limit + i + 1}
                      </td>
                      {/* Photo */}
                      <td className="px-4 py-3">
                        {m.photo?.url ? (
                          <img src={m.photo.url} alt={m.fullName} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      {/* Full Name */}
                      <td className="px-4 py-3 text-sm font-bold text-[#1a2744] whitespace-nowrap">{m.fullName}</td>
                      {/* Unit */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap max-w-[160px] truncate">{m.unit}</td>
                      {/* Martyrdom Date */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDate(m.martyrdomDate)}</td>
                      {/* Place */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap max-w-[120px] truncate">{m.placeOfMartyrdom}</td>
                      {/* District */}
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{m.district}</td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setViewMartyr(m)}
                            title="View"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#293C86] hover:bg-[#293C86] hover:text-white hover:border-[#293C86] transition"
                          >
                            <IconEye />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(m)}
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition"
                          >
                            <IconEdit />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteMartyr(m)}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-700">{(tableMeta.page - 1) * tableMeta.limit + 1}–{Math.min(tableMeta.page * tableMeta.limit, tableMeta.total)}</span> of <span className="font-bold text-gray-700">{tableMeta.total}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={tableMeta.page === 1}
                  onClick={() => fetchMartyrs(tableMeta.page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-[#293C86] hover:text-white hover:border-[#293C86] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <IconChevron dir="left" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - tableMeta.page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => fetchMartyrs(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition border ${
                          tableMeta.page === p
                            ? "bg-[#293C86] text-white border-[#293C86]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  disabled={tableMeta.page === totalPages}
                  onClick={() => fetchMartyrs(tableMeta.page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-[#293C86] hover:text-white hover:border-[#293C86] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <IconChevron dir="right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ViewModal martyr={viewMartyr} onClose={() => setViewMartyr(null)} />
      <DeleteModal
        martyr={deleteMartyr}
        onClose={() => setDeleteMartyr(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}