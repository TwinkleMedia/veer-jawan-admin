"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const API = process.env.NEXT_PUBLIC_API_URL || "";

// ── API Helper ────────────────────────────────────────────────────────────────

const fetcher = async (url, options = {}) => {
  const res = await fetch(`${API}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// ── File → Base64 ─────────────────────────────────────────────────────────────

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ── Download Helper ───────────────────────────────────────────────────────────

const downloadFile = async (url, filename) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Download error:", err);
    // Fallback: open in new tab
    window.open(url, "_blank", "noreferrer");
  }
};

// ── Shared input class ────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white " +
  "focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400 " +
  "min-h-[44px]";

// ══════════════════════════════════════════════════════════════════════════════
// ── Icons ─────────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" />
  </svg>
);

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const IconPdf = () => (
  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// ── Shared UI Primitives ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

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

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mt-7 mb-4 first:mt-0">
      <span className="block w-1 h-5 rounded-full bg-[#FF671F] shrink-0" />
      <h4 className="text-[10px] font-black tracking-widest uppercase text-[#1a2744]">
        {children}
      </h4>
      <span className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Image Upload Box ──────────────────────────────────────────────────────────

function ImageUploadBox({ label, preview, downloadUrl, inputRef, onChange, onClear, isChanged }) {
  const safeFilename = label.toLowerCase().replace(/\s+/g, "-");

  const isPdf =
    (downloadUrl && downloadUrl.toLowerCase().includes(".pdf")) ||
    (preview && preview.startsWith("data:application/pdf"));

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label Row */}
      <div className="flex items-center gap-1.5 w-full justify-center flex-wrap">
        <span className="text-[10px] font-black tracking-widest uppercase text-[#1a2744] text-center leading-tight">
          {label}
        </span>
        {isChanged && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-[#FF671F] px-1.5 py-0.5 rounded-full shrink-0">
            New
          </span>
        )}
        {!isChanged && downloadUrl && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-green-500 px-1.5 py-0.5 rounded-full shrink-0">
            ✓
          </span>
        )}
      </div>

      {/* Drop Zone */}
      <div
        className="relative w-full rounded-2xl overflow-hidden transition group"
        style={{
          height: "clamp(80px, 20vw, 128px)",
          border: `2px dashed ${isChanged ? "#FF671F" : downloadUrl ? "#22c55e" : "#e5e7eb"}`,
          cursor: preview ? "default" : "pointer",
        }}
        onClick={!preview ? () => inputRef.current?.click() : undefined}
      >
        {preview ? (
          isPdf ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50">
              <IconPdf />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">PDF</span>
            </div>
          ) : (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#293C86] transition">
            <IconUpload />
            <span className="text-[10px] font-semibold hidden sm:block">Click to Upload</span>
            <span className="text-[10px] font-semibold sm:hidden">Tap</span>
          </div>
        )}

        {/* Hover overlay — Download + Change when file exists */}
        {preview && (
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            {/* Download — only if real server URL and not a newly staged file */}
            {downloadUrl && !isChanged && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadFile(downloadUrl, safeFilename); }}
                className="flex flex-col items-center gap-1 text-white hover:text-green-300 transition"
                title={`Download ${label}`}
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider">Download</span>
              </button>
            )}
            {/* Change */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="flex flex-col items-center gap-1 text-white hover:text-blue-300 transition"
              title={`Replace ${label}`}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons Below */}
      <div className="flex gap-1.5 w-full">
        {/* Download button — visible below box when server file exists and no new file staged */}
        {downloadUrl && !isChanged && (
          <button
            type="button"
            onClick={() => downloadFile(downloadUrl, safeFilename)}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-2 rounded-xl border border-green-400 text-green-600 hover:bg-green-50 active:bg-green-100 transition min-h-[36px]"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
        )}

        {/* Upload / Change */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 text-[10px] font-bold px-2 py-2 rounded-xl border border-[#293C86] text-[#293C86] hover:bg-[#293C86] hover:text-white transition min-h-[36px]"
        >
          {preview ? "Change" : "Upload"}
        </button>

        {/* Reset — only when user has staged a new file */}
        {isChanged && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-bold px-2 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition min-h-[36px]"
          >
            Reset
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92dvh] sm:max-h-[88dvh]`}>
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] sm:rounded-t-2xl border-b-2 border-[#FF671F] shrink-0">
          <h2 className="text-white font-bold text-sm sm:text-base tracking-wide truncate pr-4">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
            <IconClose />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── View Modal ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ViewModal({ member, onClose }) {
  const Row = ({ label, value }) =>
    value ? (
      <div className="flex flex-col xs:flex-row gap-0.5 xs:gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 xs:w-40 xs:shrink-0 leading-none pt-0.5">{label}</span>
        <span className="text-sm text-gray-800 break-words flex-1 leading-snug">{value}</span>
      </div>
    ) : null;

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "");

  return (
    <Modal title={`${member.fullName}`} onClose={onClose} maxWidth="max-w-2xl">
      {/* Document images with download buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {[
          { label: "Photo", url: member.photo?.url, filename: "passport-photo" },
          { label: "Aadhar", url: member.aadharCard?.url, filename: "aadhar-card" },
          { label: "Soldier ID", url: member.soldierIdCard?.url, filename: "soldier-id" },
        ].map(({ label, url, filename }) =>
          url ? (
            <div key={label} className="text-center space-y-1.5">
              <a href={url} target="_blank" rel="noreferrer" className="group block">
                {url.toLowerCase().includes(".pdf") ? (
                  <div className="w-full aspect-[4/3] rounded-xl bg-red-50 border-2 border-red-100 flex flex-col items-center justify-center gap-1">
                    <IconPdf />
                    <span className="text-[9px] font-bold text-red-400 uppercase">PDF</span>
                  </div>
                ) : (
                  <img src={url} alt={label} className="w-full aspect-[4/3] object-cover rounded-xl border-2 border-gray-100 group-hover:border-[#293C86] transition" />
                )}
              </a>
              <button
                type="button"
                onClick={() => downloadFile(url, filename)}
                className="w-full flex items-center justify-center gap-1 text-[9px] font-bold py-1.5 px-2 rounded-lg border border-green-300 text-green-600 hover:bg-green-50 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            </div>
          ) : (
            <div key={label} className="text-center space-y-1">
              <div className="w-full aspect-[4/3] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 font-bold">No File</span>
              </div>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">{label}</p>
            </div>
          ),
        )}
      </div>

      <SectionTitle>Basic Information</SectionTitle>
      <Row label="Membership No." value={member.membershipNumber} />
      <Row label="Date" value={fmt(member.date)} />
      <Row label="Full Name" value={member.fullName} />
      <Row label="Date of Birth" value={fmt(member.dob)} />

      <SectionTitle>Address</SectionTitle>
      <Row label="Address" value={member.address} />
      <Row label="Pincode" value={member.pincode} />
      <Row label="District" value={member.district} />
      <Row label="State" value={member.state} />

      <SectionTitle>Contact</SectionTitle>
      <Row label="Mobile 1" value={member.mobile1} />
      <Row label="Mobile 2" value={member.mobile2} />
      <Row label="Email" value={member.email} />

      <SectionTitle>Personal Details</SectionTitle>
      <Row label="Occupation" value={member.occupation} />
      <Row label="Education" value={member.education} />
      <Row label="Marital Status" value={member.maritalStatus} />

      <SectionTitle>Additional Information</SectionTitle>
      <Row label="Is Associated" value={member.isAssociated} />
      <Row label="Organization Name" value={member.organizationName} />
      <Row label="Brief Description" value={member.briefDescription} />

      <SectionTitle>Timestamps</SectionTitle>
      <Row label="Created At" value={member.createdAt ? new Date(member.createdAt).toLocaleString("en-IN") : ""} />
      <Row label="Updated At" value={member.updatedAt ? new Date(member.updatedAt).toLocaleString("en-IN") : ""} />

      <div className="pt-4">
        <button onClick={onClose} className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition min-h-[48px]">
          Close
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Edit Modal ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function EditModal({ member, onClose, onSaved }) {
  const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

  const [form, setForm] = useState({
    membershipNumber: member.membershipNumber || "",
    date: toDateInput(member.date),
    fullName: member.fullName || "",
    dob: toDateInput(member.dob),
    address: member.address || "",
    pincode: member.pincode || "",
    district: member.district || "",
    state: member.state || "",
    mobile1: member.mobile1 || "",
    mobile2: member.mobile2 || "",
    email: member.email || "",
    occupation: member.occupation || "",
    education: member.education || "",
    maritalStatus: member.maritalStatus || "",
    isAssociated: member.isAssociated || "",
    organizationName: member.organizationName || "",
    briefDescription: member.briefDescription || "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(member.photo?.url || null);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(member.aadharCard?.url || null);
  const [soldierFile, setSoldierFile] = useState(null);
  const [soldierPreview, setSoldierPreview] = useState(member.soldierIdCard?.url || null);

  const photoRef = useRef(null);
  const aadharRef = useRef(null);
  const soldierRef = useRef(null);

  const makeFileHandler = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (photoFile) payload.photo = await toBase64(photoFile);
      if (aadharFile) payload.aadharCard = await toBase64(aadharFile);
      if (soldierFile) payload.soldierIdCard = await toBase64(soldierFile);
      const result = await fetcher(`/api/membershipAdmin/${member._id}`, { method: "PUT", body: JSON.stringify(payload) });
      onSaved(result.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Edit — ${member.membershipNumber}`} onClose={onClose} maxWidth="max-w-2xl">
      <SectionTitle>Basic Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Membership Number" required>
          <input className={inputCls} value={form.membershipNumber} onChange={(e) => set("membershipNumber", e.target.value)} />
        </Field>
        <Field label="Date" required>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Full Name" required>
          <input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <Field label="Date of Birth" required>
          <input type="date" className={inputCls} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Address</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Address" required className="sm:col-span-2">
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Pincode" required>
          <input className={inputCls} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
        </Field>
        <Field label="District" required>
          <input className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)} />
        </Field>
        <Field label="State" required className="sm:col-span-2">
          <select className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)}>
            <option value="">Select State / UT</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <SectionTitle>Contact</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Mobile 1" required>
          <input type="tel" className={inputCls} value={form.mobile1} onChange={(e) => set("mobile1", e.target.value)} />
        </Field>
        <Field label="Mobile 2">
          <input type="tel" className={inputCls} value={form.mobile2} onChange={(e) => set("mobile2", e.target.value)} />
        </Field>
        <Field label="Email" className="sm:col-span-2">
          <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Personal Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Occupation">
          <input className={inputCls} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
        </Field>
        <Field label="Education">
          <input className={inputCls} value={form.education} onChange={(e) => set("education", e.target.value)} />
        </Field>
        <Field label="Marital Status">
          <select className={inputCls} value={form.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)}>
            <option value="">Select</option>
            <option>Married</option>
            <option>Unmarried</option>
          </select>
        </Field>
        <Field label="Is Associated">
          <select className={inputCls} value={form.isAssociated} onChange={(e) => set("isAssociated", e.target.value)}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
        <Field label="Organization Name" className="sm:col-span-2">
          <input className={inputCls} value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
        </Field>
        <Field label="Brief Description" className="sm:col-span-2">
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.briefDescription} onChange={(e) => set("briefDescription", e.target.value)} />
        </Field>
      </div>

      <SectionTitle>Document Images</SectionTitle>
      <p className="text-xs text-gray-400 mb-4">
        Click <strong>Download</strong> to save existing files. Upload a new one to replace.
      </p>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <ImageUploadBox
          label="Photo"
          preview={photoPreview}
          downloadUrl={member.photo?.url}
          inputRef={photoRef}
          isChanged={!!photoFile}
          onChange={makeFileHandler(setPhotoFile, setPhotoPreview)}
          onClear={() => { setPhotoFile(null); setPhotoPreview(member.photo?.url || null); if (photoRef.current) photoRef.current.value = ""; }}
        />
        <ImageUploadBox
          label="Aadhar"
          preview={aadharPreview}
          downloadUrl={member.aadharCard?.url}
          inputRef={aadharRef}
          isChanged={!!aadharFile}
          onChange={makeFileHandler(setAadharFile, setAadharPreview)}
          onClear={() => { setAadharFile(null); setAadharPreview(member.aadharCard?.url || null); if (aadharRef.current) aadharRef.current.value = ""; }}
        />
        <ImageUploadBox
          label="Soldier ID"
          preview={soldierPreview}
          downloadUrl={member.soldierIdCard?.url}
          inputRef={soldierRef}
          isChanged={!!soldierFile}
          onChange={makeFileHandler(setSoldierFile, setSoldierPreview)}
          onClear={() => { setSoldierFile(null); setSoldierPreview(member.soldierIdCard?.url || null); if (soldierRef.current) soldierRef.current.value = ""; }}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5">
        <button onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition min-h-[48px]">
          Cancel
        </button>
        <button onClick={handleSave} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#293C86] text-white text-sm font-bold hover:bg-[#1a2744] transition disabled:opacity-60 min-h-[48px]">
          {loading && <IconSpinner />} Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Delete Modal ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function DeleteModal({ member, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`/api/membershipAdmin/${member._id}`, { method: "DELETE" });
      onDeleted(member._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Confirm Delete" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-red-700 mb-1">This action cannot be undone.</p>
            <p className="text-sm text-red-600">
              Permanently delete membership of <strong>{member.fullName}</strong> ({member.membershipNumber})? All uploaded documents will also be removed.
            </p>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 font-medium px-1">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition min-h-[48px]">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 min-h-[48px]">
            {loading ? <IconSpinner /> : <IconDelete />} Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Doc Badges ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function DocBadges({ member }) {
  return (
    <div className="flex gap-1">
      {[
        { url: member.photo?.url, label: "P", title: "Passport Photo", filename: "passport-photo" },
        { url: member.aadharCard?.url, label: "A", title: "Aadhar Card", filename: "aadhar-card" },
        { url: member.soldierIdCard?.url, label: "S", title: "Soldier ID", filename: "soldier-id" },
      ].map(({ url, label, title, filename }) =>
        url ? (
          <button
            key={label}
            type="button"
            onClick={() => downloadFile(url, filename)}
            title={`Download ${title}`}
            className="w-6 h-6 rounded-full bg-[#293C86] text-white text-[9px] font-black flex items-center justify-center hover:bg-green-600 transition shrink-0 cursor-pointer"
          >
            {label}
          </button>
        ) : (
          <span
            key={label}
            title={`${title} — not uploaded`}
            className="w-6 h-6 rounded-full bg-gray-100 text-gray-300 text-[9px] font-black flex items-center justify-center shrink-0"
          >
            {label}
          </span>
        ),
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Registration Form ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const EMPTY_FORM = {
  membershipNumber: "",
  date: "",
  fullName: "",
  dob: "",
  address: "",
  pincode: "",
  district: "",
  state: "",
  mobile1: "",
  mobile2: "",
  email: "",
  occupation: "",
  education: "",
  maritalStatus: "",
  isAssociated: "",
  organizationName: "",
  briefDescription: "",
};

function RegistrationForm({ onCreated, collapsed, onToggle }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [soldierFile, setSoldierFile] = useState(null);
  const [soldierPreview, setSoldierPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const photoRef = useRef(null);
  const aadharRef = useRef(null);
  const soldierRef = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const makeFileHandler = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (photoFile) payload.photo = await toBase64(photoFile);
      if (aadharFile) payload.aadharCard = await toBase64(aadharFile);
      if (soldierFile) payload.soldierIdCard = await toBase64(soldierFile);

      const result = await fetcher("/api/membershipAdmin", { method: "POST", body: JSON.stringify(payload) });

      setSuccess("Member registered successfully!");
      setForm(EMPTY_FORM);
      setPhotoFile(null); setPhotoPreview(null);
      setAadharFile(null); setAadharPreview(null);
      setSoldierFile(null); setSoldierPreview(null);
      if (photoRef.current) photoRef.current.value = "";
      if (aadharRef.current) aadharRef.current.value = "";
      if (soldierRef.current) soldierRef.current.value = "";
      onCreated(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F] text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">New Member Registration</h2>
            <p className="text-white/60 text-xs mt-0.5">{collapsed ? "Tap to expand form" : "Fill all required fields marked with *"}</p>
          </div>
        </div>
        <span className={`text-white/70 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}>
          <IconChevronDown />
        </span>
      </button>

      {!collapsed && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <SectionTitle>01 — Basic Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Membership Number" required>
              <input className={inputCls} placeholder="e.g. MEM-0001" value={form.membershipNumber} onChange={(e) => set("membershipNumber", e.target.value)} required />
            </Field>
            <Field label="Date" required>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </Field>
            <Field label="Full Name" required>
              <input className={inputCls} placeholder="Enter full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" className={inputCls} value={form.dob} onChange={(e) => set("dob", e.target.value)} required />
            </Field>
          </div>

          <SectionTitle>02 — Address Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Address" required className="col-span-full">
              <textarea className={`${inputCls} resize-y min-h-[80px]`} placeholder="Full address" value={form.address} onChange={(e) => set("address", e.target.value)} required />
            </Field>
            <Field label="Pincode" required>
              <input className={inputCls} placeholder="6-digit pincode" maxLength={6} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} required />
            </Field>
            <Field label="District" required>
              <input className={inputCls} placeholder="District" value={form.district} onChange={(e) => set("district", e.target.value)} required />
            </Field>
            <Field label="State" required className="col-span-full">
              <select className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} required>
                <option value="">Select State / UT</option>
                {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <SectionTitle>03 — Contact Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Mobile 1" required>
              <input type="tel" className={inputCls} placeholder="Primary mobile" value={form.mobile1} onChange={(e) => set("mobile1", e.target.value)} required />
            </Field>
            <Field label="Mobile 2">
              <input type="tel" className={inputCls} placeholder="Secondary (optional)" value={form.mobile2} onChange={(e) => set("mobile2", e.target.value)} />
            </Field>
            <Field label="Email" className="col-span-full">
              <input type="email" className={inputCls} placeholder="Email address (optional)" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
          </div>

          <SectionTitle>04 — Personal Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Occupation">
              <input className={inputCls} placeholder="Occupation" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
            </Field>
            <Field label="Education">
              <input className={inputCls} placeholder="Highest qualification" value={form.education} onChange={(e) => set("education", e.target.value)} />
            </Field>
            <Field label="Marital Status">
              <select className={inputCls} value={form.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)}>
                <option value="">Select</option>
                <option>Married</option>
                <option>Unmarried</option>
              </select>
            </Field>
            <Field label="Is Associated with Any Org?">
              <select className={inputCls} value={form.isAssociated} onChange={(e) => set("isAssociated", e.target.value)}>
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>
            {form.isAssociated === "Yes" && (
              <Field label="Organization Name" className="col-span-full">
                <input className={inputCls} placeholder="Organization name" value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} />
              </Field>
            )}
            <Field label="Brief Description" className="col-span-full">
              <textarea className={`${inputCls} resize-y min-h-[80px]`} placeholder="Any additional notes…" value={form.briefDescription} onChange={(e) => set("briefDescription", e.target.value)} />
            </Field>
          </div>

          <SectionTitle>05 — Documents Upload</SectionTitle>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* No downloadUrl on registration form — files don't exist yet */}
            <ImageUploadBox
              label="Passport Photo"
              preview={photoPreview}
              inputRef={photoRef}
              isChanged={!!photoFile}
              onChange={makeFileHandler(setPhotoFile, setPhotoPreview)}
              onClear={() => { setPhotoFile(null); setPhotoPreview(null); if (photoRef.current) photoRef.current.value = ""; }}
            />
            <ImageUploadBox
              label="Aadhar Card"
              preview={aadharPreview}
              inputRef={aadharRef}
              isChanged={!!aadharFile}
              onChange={makeFileHandler(setAadharFile, setAadharPreview)}
              onClear={() => { setAadharFile(null); setAadharPreview(null); if (aadharRef.current) aadharRef.current.value = ""; }}
            />
            <ImageUploadBox
              label="Soldier ID"
              preview={soldierPreview}
              inputRef={soldierRef}
              isChanged={!!soldierFile}
              onChange={makeFileHandler(setSoldierFile, setSoldierPreview)}
              onClear={() => { setSoldierFile(null); setSoldierPreview(null); if (soldierRef.current) soldierRef.current.value = ""; }}
            />
          </div>

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

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5">
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setError(""); setSuccess(""); }}
              className="w-full sm:w-36 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition min-h-[48px]"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FF671F] text-white text-sm font-bold hover:bg-[#e55a17] transition disabled:opacity-60 shadow-md shadow-[#FF671F]/20 min-h-[48px]"
            >
              {loading && <IconSpinner />}
              {loading ? "Registering…" : "Register Member"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Members Table ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const PER_PAGE = 10;

function MembersTable({ members, loading, error, onRefresh, onView, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.membershipNumber?.toLowerCase().includes(q) ||
      m.district?.toLowerCase().includes(q) ||
      m.state?.toLowerCase().includes(q) ||
      m.mobile1?.includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  useEffect(() => { setPage(1); }, [search]);

  const handleDownload = async (id) => {
    try {
      const res = await fetch(`${API}/api/membershipAdmin/${id}/pdf`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "member.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("PDF download failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table header */}
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="shrink-0">
          <h3 className="text-sm font-black text-[#1a2744] tracking-tight">All Registered Members</h3>
          <p className="text-xs text-gray-400 mt-0.5">{members.length} total record{members.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><IconSearch /></span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400 min-h-[44px]"
            />
          </div>
          <button onClick={onRefresh} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition shrink-0 min-h-[44px]">
            <IconRefresh />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
          <IconSpinner />
          <span className="text-sm font-medium">Loading members…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={onRefresh} className="text-sm text-[#293C86] font-bold hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 px-6">
          <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-sm font-medium text-center">{search ? "No results found." : "No members registered yet."}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table (lg+) ── */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["#", "Membership No.", "Full Name", "DOB", "District / State", "Mobile", "Docs", "Registered", "Actions"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-black tracking-widest uppercase text-gray-400 whitespace-nowrap first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((member, idx) => (
                  <tr key={member._id} className="hover:bg-[#f7f9ff] transition-colors group">
                    <td className="pl-5 py-3.5 text-gray-400 text-xs tabular-nums">{(page - 1) * PER_PAGE + idx + 1}</td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#EEF0FB] text-[#293C86] text-xs font-bold">{member.membershipNumber}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-[#1a2744] text-sm leading-tight">{member.fullName}</p>
                      {member.email && <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[160px]">{member.email}</p>}
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 text-xs whitespace-nowrap tabular-nums">{fmt(member.dob)}</td>
                    <td className="px-3 py-3.5">
                      <p className="text-gray-700 text-xs font-medium">{member.district}</p>
                      <p className="text-gray-400 text-[11px]">{member.state}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="text-gray-700 text-xs tabular-nums">{member.mobile1}</p>
                      {member.mobile2 && <p className="text-gray-400 text-[11px] tabular-nums">{member.mobile2}</p>}
                    </td>
                    <td className="px-3 py-3.5">
                      {/* DocBadges now trigger download on click */}
                      <DocBadges member={member} />
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 text-xs whitespace-nowrap tabular-nums">{fmt(member.createdAt)}</td>
                    <td className="px-3 pr-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onView(member)} title="View" className="w-8 h-8 rounded-lg flex items-center justify-center text-[#293C86] bg-[#EEF0FB] hover:bg-[#d8dcf5] transition">
                          <IconEye />
                        </button>
                        <button onClick={() => onEdit(member)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 transition">
                          <IconEdit />
                        </button>
                        <button onClick={() => onDelete(member)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-red-500 hover:bg-red-600 transition">
                          <IconDelete />
                        </button>
                        <button onClick={() => handleDownload(member._id)} title="Download PDF" className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-green-500 hover:bg-green-600 transition text-[10px] font-black">
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile / Tablet Cards (< lg) ── */}
          <div className="lg:hidden divide-y divide-gray-100">
            {paginated.map((member, idx) => (
              <div key={member._id} className="p-3 sm:p-4 active:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] text-gray-400 tabular-nums font-bold">#{(page - 1) * PER_PAGE + idx + 1}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#EEF0FB] text-[#293C86] text-[10px] font-black">{member.membershipNumber}</span>
                    </div>
                    <p className="font-bold text-[#1a2744] text-sm leading-tight">{member.fullName}</p>
                    {member.email && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{member.email}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onView(member)} aria-label="View" className="w-9 h-9 rounded-xl flex items-center justify-center text-[#293C86] bg-[#EEF0FB] hover:bg-[#d8dcf5] active:scale-95 transition">
                      <IconEye />
                    </button>
                    <button onClick={() => onEdit(member)} aria-label="Edit" className="w-9 h-9 rounded-xl flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 active:scale-95 transition">
                      <IconEdit />
                    </button>
                    <button onClick={() => onDelete(member)} aria-label="Delete" className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-red-500 hover:bg-red-600 active:scale-95 transition">
                      <IconDelete />
                    </button>
                    <button onClick={() => handleDownload(member._id)} title="Download PDF" className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-green-500 hover:bg-green-600 active:scale-95 transition text-[10px] font-black">
                      PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2.5">
                  {[
                    { label: "Mobile", value: member.mobile1 },
                    { label: "DOB", value: member.dob ? new Date(member.dob).toLocaleDateString("en-IN") : "—" },
                    { label: "District", value: member.district },
                    { label: "State", value: member.state },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">{label}</p>
                      <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">Docs</span>
                  {/* Clicking P/A/S badge triggers download */}
                  <DocBadges member={member} />
                  <span className="ml-auto text-[10px] text-gray-400 tabular-nums">{fmt(member.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition flex items-center justify-center">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-9 text-center text-gray-400 text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-bold transition ${page === p ? "bg-[#293C86] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
                ),
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition flex items-center justify-center">›</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main Page ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function MembershipAdminPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  const [formCollapsed, setFormCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 640,
  );

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetcher("/api/membershipAdmin");
      setMembers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleCreated = (newMember) => setMembers((prev) => [newMember, ...prev]);
  const handleEdited = (updated) => setMembers((prev) => prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)));
  const handleDeleted = (id) => setMembers((prev) => prev.filter((m) => m._id !== id));

  return (
    <div className="min-h-screen bg-gray-50/80">
      {viewMember && <ViewModal member={viewMember} onClose={() => setViewMember(null)} />}
      {editMember && <EditModal member={editMember} onClose={() => setEditMember(null)} onSaved={handleEdited} />}
      {deleteMember && <DeleteModal member={deleteMember} onClose={() => setDeleteMember(null)} onDeleted={handleDeleted} />}

      <div className="max-w-screen-xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1a2744] tracking-tight leading-tight">Membership Administration</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Register new members and manage all existing membership records.</p>
          </div>
          <button
            onClick={() => setFormCollapsed(false)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF671F] text-white text-sm font-bold hover:bg-[#e55a17] transition shadow-md shadow-[#FF671F]/20 shrink-0"
          >
            <IconPlus /> New Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: "Total Members", value: members.length, color: "bg-[#293C86]" },
            {
              label: "This Month",
              value: members.filter((m) => { const d = new Date(m.createdAt), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length,
              color: "bg-green-600",
            },
            { label: "States Covered", value: new Set(members.map((m) => m.state).filter(Boolean)).size, color: "bg-orange-500" },
            { label: "With All Docs", value: members.filter((m) => m.photo?.url && m.aadharCard?.url && m.soldierIdCard?.url).length, color: "bg-teal-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className={`w-1.5 h-10 rounded-full ${color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black text-[#1a2744] leading-none tabular-nums">{value}</p>
                <p className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-gray-400 mt-1 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <RegistrationForm onCreated={handleCreated} collapsed={formCollapsed} onToggle={() => setFormCollapsed((v) => !v)} />

        <MembersTable members={members} loading={loading} error={error} onRefresh={loadMembers} onView={setViewMember} onEdit={setEditMember} onDelete={setDeleteMember} />
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { setFormCollapsed(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="sm:hidden fixed bottom-5 right-4 z-40 w-14 h-14 rounded-full bg-[#FF671F] text-white shadow-xl shadow-[#FF671F]/40 flex items-center justify-center active:scale-95 transition"
        aria-label="Register new member"
      >
        <IconPlus />
      </button>
    </div>
  );
}