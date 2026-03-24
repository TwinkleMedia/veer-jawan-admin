"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const RANKS = [
  "Sepoy","Lance Naik","Naik","Havildar","Naib Subedar","Subedar","Subedar Major",
  "2nd Lieutenant","Lieutenant","Captain","Major","Lieutenant Colonel","Colonel",
  "Brigadier","Major General","Lieutenant General","General","Field Marshal",
  "Aircraftman","Leading Aircraftman","Corporal","Sergeant","Warrant Officer",
  "Flying Officer","Flight Lieutenant","Squadron Leader","Wing Commander",
  "Group Captain","Air Commodore","Air Vice Marshal","Air Marshal","Air Chief Marshal",
  "Seaman","Leading Seaman","Petty Officer","Chief Petty Officer",
  "Sub Lieutenant","Lieutenant Commander","Commander","Captain (Navy)",
  "Commodore","Rear Admiral","Vice Admiral","Admiral","Admiral of the Fleet",
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.3.3 4.3s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.8 12 21.8 12 21.8s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.3v-2C23.3 9.1 23 7 23 7zM9.7 15.5v-7.4l8.1 3.7-8.1 3.7z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL;

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

const inputCls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400";

// ── Field — TOP LEVEL (prevents one-letter-at-a-time bug) ────────────────────

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-wider uppercase text-[#1a2744]">
        {label}{required && <span className="text-[#FF671F] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── ImageUploadBox — TOP LEVEL ────────────────────────────────────────────────

function ImageUploadBox({ label, preview, inputRef, onChange, onClear, isChanged }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 w-full justify-center">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#1a2744] text-center leading-tight">{label}</span>
        {isChanged && (
          <span className="text-[9px] font-black tracking-wider uppercase text-white bg-[#FF671F] px-1.5 py-0.5 rounded shrink-0">
            Changed
          </span>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-32 sm:h-36 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#293C86] hover:bg-blue-50/30 transition group"
        style={{ borderColor: isChanged ? "#FF671F" : undefined }}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-black/30 px-2 py-1 rounded">Click to Change</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400 group-hover:text-[#293C86] transition">
            <UploadIcon />
            <span className="text-[10px] font-semibold">Click to Upload</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border border-[#293C86] text-[#293C86] hover:bg-[#293C86] hover:text-white transition">
          {preview ? "Change" : "Upload"}
        </button>
        {isChanged && (
          <button type="button" onClick={onClear}
            className="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition">
            Reset
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} className="hidden" />
    </div>
  );
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white w-full ${maxWidth} sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 overflow-hidden sm:mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
          <h2 className="text-white font-bold text-sm sm:text-base tracking-wide truncate pr-4">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition shrink-0"><CloseIcon /></button>
        </div>
        {/* Body — full height on mobile, max-height on desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

// ── Section Title ─────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3 first:mt-0">
      <span className="block w-1 h-4 rounded-full bg-[#FF671F] shrink-0" />
      <h4 className="text-[11px] font-black tracking-widest uppercase text-[#1a2744]">{children}</h4>
    </div>
  );
}

// ── View / Detail Modal ───────────────────────────────────────────────────────

function DetailModal({ member, onClose }) {
  const Row = ({ label, value }) =>
    value !== undefined && value !== null && value !== "" ? (
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-0">
        <span className="text-[10px] font-black tracking-wider uppercase text-gray-400 sm:w-44 sm:shrink-0 sm:pt-0.5">{label}</span>
        <span className="text-sm text-gray-800 break-words flex-1">{value}</span>
      </div>
    ) : null;

  return (
    <Modal title={`View — ${member.fullName}`} onClose={onClose} maxWidth="max-w-2xl">
      {/* Document Images */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        {[
          { label: "Passport Photo",  url: member.passportPhotoUrl },
          { label: "Aadhar Card",     url: member.aadharCardUrl },
          { label: "Soldier ID Card", url: member.idCardUrl },
        ].map(({ label, url }) =>
          url ? (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="group text-center space-y-1">
              <img src={url} alt={label} className="w-full h-20 sm:h-28 object-cover rounded-xl border-2 border-gray-100 group-hover:border-[#293C86] transition" />
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
            </a>
          ) : null
        )}
      </div>

      <SectionTitle>01 — Basic Information</SectionTitle>
      <Row label="Membership No."      value={member.membershipNo} />
      <Row label="Date"                value={member.date} />
      <Row label="No. of Martyrs"      value={member.martyrCount} />
      <Row label="Full Name"           value={member.fullName} />

      <SectionTitle>02 — Martyr Soldier Details</SectionTitle>
      <Row label="Rank"                value={member.rank} />
      <Row label="Service Number"      value={member.serviceNumber} />
      <Row label="Martyrdom Date"      value={member.martyrdomDate} />
      <Row label="Place of Martyrdom"  value={member.placeOfMartyrdom} />
      <Row label="Awards / Honors"     value={member.awardsHonors} />
      <Row label="Operation Details"   value={member.operationDescription} />

      <SectionTitle>03 — Family Details</SectionTitle>
      <Row label="Veer Nari Name"      value={member.veerNariName} />
      <Row label="Veer Nari Education" value={member.veerNariEducation} />
      <Row label="Father's Name"       value={member.fatherName} />
      <Row label="Mother's Name"       value={member.motherName} />
      {member.children?.filter((c) => c.name || c.education).length > 0 && (
        <div className="py-2 border-b border-gray-100">
          <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">Children</span>
          <div className="mt-2 space-y-1 pl-2">
            {member.children.filter((c) => c.name || c.education).map((c, i) => (
              <div key={i} className="flex flex-wrap gap-1.5 text-sm text-gray-700">
                <span className="font-semibold text-[#1a2744]">Child {i + 1}:</span>
                <span>{c.name}</span>
                {c.education && <span className="text-gray-400">— {c.education}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionTitle>04 — Contact Details</SectionTitle>
      <Row label="Mobile 1"            value={member.mobile1} />
      <Row label="Mobile 2"            value={member.mobile2} />
      <Row label="Permanent Address"   value={member.permanentAddress} />
      <Row label="District"            value={member.district} />
      <Row label="State"               value={member.state} />

      {member.youtubeLink && (
        <>
          <SectionTitle>05 — YouTube</SectionTitle>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 py-2">
            <span className="text-[10px] font-black tracking-wider uppercase text-gray-400 sm:w-44 sm:shrink-0">YouTube Link</span>
            <a href={member.youtubeLink} target="_blank" rel="noreferrer"
              className="text-sm text-red-600 hover:underline break-all flex items-start gap-1.5 flex-1">
              <span className="shrink-0 mt-0.5"><YoutubeIcon /></span>{member.youtubeLink}
            </a>
          </div>
        </>
      )}

      <SectionTitle>Timestamps</SectionTitle>
      <Row label="Submitted At" value={member.createdAt ? new Date(member.createdAt).toLocaleString("en-IN") : ""} />
      <Row label="Last Updated"  value={member.updatedAt ? new Date(member.updatedAt).toLocaleString("en-IN") : ""} />
    </Modal>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    membershipNo:         member.membershipNo || "",
    date:                 member.date || "",
    martyrCount:          member.martyrCount || "",
    fullName:             member.fullName || "",
    rank:                 member.rank || "",
    serviceNumber:        member.serviceNumber || "",
    martyrdomDate:        member.martyrdomDate || "",
    placeOfMartyrdom:     member.placeOfMartyrdom || "",
    awardsHonors:         member.awardsHonors || "",
    operationDescription: member.operationDescription || "",
    veerNariName:         member.veerNariName || "",
    veerNariEducation:    member.veerNariEducation || "",
    fatherName:           member.fatherName || "",
    motherName:           member.motherName || "",
    mobile1:              member.mobile1 || "",
    mobile2:              member.mobile2 || "",
    permanentAddress:     member.permanentAddress || "",
    district:             member.district || "",
    state:                member.state || "",
  });

  const [children, setChildren] = useState(
    member.children?.length > 0 ? member.children : [{ name: "", education: "" }]
  );

  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(member.passportPhotoUrl || null);
  const [aadharFile,    setAadharFile]    = useState(null);
  const [aadharPreview, setAadharPreview] = useState(member.aadharCardUrl || null);
  const [idCardFile,    setIdCardFile]    = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(member.idCardUrl || null);

  const photoRef  = useRef(null);
  const aadharRef = useRef(null);
  const idCardRef = useRef(null);

  const makeFileHandler = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const addChild    = () => children.length < 6 && setChildren([...children, { name: "", education: "" }]);
  const removeChild = (i) => children.length > 1 && setChildren(children.filter((_, idx) => idx !== i));
  const updateChild = (i, field, val) => {
    const updated = [...children];
    updated[i][field] = val;
    setChildren(updated);
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      let updatedData;
      const hasNewImages = photoFile || aadharFile || idCardFile;

      if (hasNewImages) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("children", JSON.stringify(children));
        if (photoFile)  fd.append("photo",     photoFile);
        if (aadharFile) fd.append("aadharCard", aadharFile);
        if (idCardFile) fd.append("idCard",     idCardFile);
        const res = await fetch(`${API}/api/membership/${member._id}`, {
          method: "PUT", credentials: "include", body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong");
        updatedData = data;
      } else {
        updatedData = await fetcher(`/api/membership/${member._id}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, children }),
        });
      }

      onSaved(updatedData.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Edit — ${member.membershipNo}`} onClose={onClose} maxWidth="max-w-2xl">

      {/* 01 Basic */}
      <SectionTitle>01 — Basic Information</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Membership No." required>
          <input className={inputCls} value={form.membershipNo} onChange={(e) => set("membershipNo", e.target.value)} />
        </Field>
        <Field label="Date" required>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Number of Martyrs" required>
          <input type="number" min="1" className={inputCls} value={form.martyrCount} onChange={(e) => set("martyrCount", e.target.value)} />
        </Field>
        <Field label="Full Name" required>
          <input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
      </div>

      {/* 02 Soldier */}
      <SectionTitle>02 — Martyr Soldier Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Rank" required>
          <select className={inputCls} value={form.rank} onChange={(e) => set("rank", e.target.value)}>
            <option value="" disabled>Select Rank</option>
            {RANKS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Service Number" required>
          <input className={inputCls} value={form.serviceNumber} onChange={(e) => set("serviceNumber", e.target.value)} />
        </Field>
        <Field label="Martyrdom Date" required>
          <input type="date" className={inputCls} value={form.martyrdomDate} onChange={(e) => set("martyrdomDate", e.target.value)} />
        </Field>
        <Field label="Place of Martyrdom" required>
          <input className={inputCls} value={form.placeOfMartyrdom} onChange={(e) => set("placeOfMartyrdom", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-3 sm:mt-4">
        <Field label="Awards / Honors">
          <input className={inputCls} value={form.awardsHonors} onChange={(e) => set("awardsHonors", e.target.value)} />
        </Field>
        <Field label="Operation Description">
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.operationDescription}
            onChange={(e) => set("operationDescription", e.target.value)} />
        </Field>
      </div>

      {/* 03 Family */}
      <SectionTitle>03 — Family Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Veer Nari Name">
          <input className={inputCls} value={form.veerNariName} onChange={(e) => set("veerNariName", e.target.value)} />
        </Field>
        <Field label="Veer Nari Education">
          <input className={inputCls} value={form.veerNariEducation} onChange={(e) => set("veerNariEducation", e.target.value)} />
        </Field>
        <Field label="Father's Name" required>
          <input className={inputCls} value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
        </Field>
        <Field label="Mother's Name" required>
          <input className={inputCls} value={form.motherName} onChange={(e) => set("motherName", e.target.value)} />
        </Field>
      </div>

      {/* Children */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-gray-200">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#1a2744]">Children</span>
          <button type="button" onClick={addChild} disabled={children.length >= 6}
            className="text-[11px] font-bold text-[#293C86] border border-[#293C86] rounded px-2.5 py-1 hover:bg-[#293C86] hover:text-white transition disabled:opacity-40">
            + Add Child
          </button>
        </div>
        {children.map((child, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#FF671F] uppercase">Child {i + 1}</span>
              {children.length > 1 && (
                <button type="button" onClick={() => removeChild(i)}
                  className="text-xs text-red-400 hover:text-red-600 font-bold transition">✕ Remove</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Full name" value={child.name}
                onChange={(e) => updateChild(i, "name", e.target.value)} />
              <input className={inputCls} placeholder="Class / Degree" value={child.education}
                onChange={(e) => updateChild(i, "education", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* 04 Contact */}
      <SectionTitle>04 — Contact Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Mobile 1" required>
          <input type="tel" className={inputCls} value={form.mobile1} onChange={(e) => set("mobile1", e.target.value)} />
        </Field>
        <Field label="Mobile 2">
          <input type="tel" className={inputCls} value={form.mobile2} onChange={(e) => set("mobile2", e.target.value)} />
        </Field>
        <Field label="District" required>
          <input className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)} />
        </Field>
        <Field label="State" required>
          <select className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)}>
            <option value="" disabled>Select State / UT</option>
            {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-3 sm:mt-4">
        <Field label="Permanent Address" required>
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.permanentAddress}
            onChange={(e) => set("permanentAddress", e.target.value)} />
        </Field>
      </div>

      {/* 05 Document Images */}
      <SectionTitle>05 — Document Images</SectionTitle>
      <p className="text-xs text-gray-400 mb-4">
        Leave unchanged to keep the existing image. Upload a new one to replace it.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <ImageUploadBox
          label="Passport Size Photo" preview={photoPreview} inputRef={photoRef} isChanged={!!photoFile}
          onChange={makeFileHandler(setPhotoFile, setPhotoPreview)}
          onClear={() => { setPhotoFile(null); setPhotoPreview(member.passportPhotoUrl || null); if (photoRef.current) photoRef.current.value = ""; }}
        />
        <ImageUploadBox
          label="Aadhar Card Image" preview={aadharPreview} inputRef={aadharRef} isChanged={!!aadharFile}
          onChange={makeFileHandler(setAadharFile, setAadharPreview)}
          onClear={() => { setAadharFile(null); setAadharPreview(member.aadharCardUrl || null); if (aadharRef.current) aadharRef.current.value = ""; }}
        />
        <ImageUploadBox
          label="Soldier ID Card" preview={idCardPreview} inputRef={idCardRef} isChanged={!!idCardFile}
          onChange={makeFileHandler(setIdCardFile, setIdCardPreview)}
          onClear={() => { setIdCardFile(null); setIdCardPreview(member.idCardUrl || null); if (idCardRef.current) idCardRef.current.value = ""; }}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-5">
        <button onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={handleSave} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#293C86] text-white text-sm font-bold hover:bg-[#1a2744] transition disabled:opacity-60">
          {loading && <SpinnerIcon />}
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ── YouTube Modal ─────────────────────────────────────────────────────────────

function YoutubeModal({ member, onClose, onSaved }) {
  const [link, setLink]       = useState(member.youtubeLink || "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    setError("");
    if (link && !link.includes("youtube.com") && !link.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      await fetcher(`/api/membership/${member._id}/youtube`, {
        method: "PATCH",
        body: JSON.stringify({ youtubeLink: link }),
      });
      onSaved(member._id, link);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add / Update YouTube Video Link" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Paste the YouTube link for <strong className="text-[#1a2744]">{member.fullName}</strong>.
        </p>
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600 shrink-0"><YoutubeIcon /></span>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400 min-w-0" />
          {link && <button onClick={() => setLink("")} className="text-gray-400 hover:text-gray-600 transition shrink-0"><CloseIcon /></button>}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {link && (link.includes("youtube.com") || link.includes("youtu.be")) && (
          <a href={link} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline font-medium">
            <YoutubeIcon /> Preview link
          </a>
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#293C86] text-white text-sm font-bold hover:bg-[#1a2744] transition disabled:opacity-60">
            {loading && <SpinnerIcon />}
            Save Link
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({ member, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`/api/membership/${member._id}`, { method: "DELETE" });
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
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-red-700 mb-1">This action cannot be undone.</p>
            <p className="text-sm text-red-600">
              Permanently delete membership of{" "}
              <strong>{member.fullName}</strong> ({member.membershipNo})?
            </p>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
            {loading ? <SpinnerIcon /> : <DeleteIcon />}
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Action Buttons ────────────────────────────────────────────────────────────

function ActionButtons({ member, onView, onEdit, onYoutube, onDelete, size = "md" }) {
  const btn = size === "sm"
    ? "w-7 h-7 rounded-lg flex items-center justify-center transition"
    : "w-8 h-8 rounded-lg flex items-center justify-center transition";
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onView(member)} title="View"
        className={`${btn} text-[#293C86] bg-[#EEF0FB] hover:bg-[#d8dcf5]`}><EyeIcon /></button>
      <button onClick={() => onEdit(member)} title="Edit"
        className={`${btn} text-orange-600 bg-orange-50 hover:bg-orange-100`}><EditIcon /></button>
      <button onClick={() => onYoutube(member)} title="YouTube"
        className={`${btn} ${member.youtubeLink ? "text-red-600 bg-red-100 hover:bg-red-200" : "text-red-400 bg-red-50 hover:bg-red-100"}`}>
        <YoutubeIcon />
      </button>
      <button onClick={() => onDelete(member)} title="Delete"
        className={`${btn} text-white bg-red-500 hover:bg-red-600`}><DeleteIcon /></button>
    </div>
  );
}

// ── Doc Badges ────────────────────────────────────────────────────────────────

function DocBadges({ member }) {
  return (
    <div className="flex gap-1">
      {[
        { url: member.passportPhotoUrl, label: "P", title: "Passport" },
        { url: member.aadharCardUrl,    label: "A", title: "Aadhar" },
        { url: member.idCardUrl,        label: "I", title: "ID Card" },
      ].map(({ url, label, title }) => (
        <a key={label} href={url} target="_blank" rel="noreferrer" title={title}
          className="w-6 h-6 rounded-full bg-[#293C86] text-white text-[9px] font-black flex items-center justify-center hover:bg-[#FF671F] transition shrink-0">
          {label}
        </a>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MembershipsPage() {
  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  const [detailMember,  setDetailMember]  = useState(null);
  const [editMember,    setEditMember]    = useState(null);
  const [deleteMember,  setDeleteMember]  = useState(null);
  const [youtubeMember, setYoutubeMember] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetcher("/api/membership");
      setMembers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleYoutubeSaved = (id, link) =>
    setMembers((prev) => prev.map((m) => m._id === id ? { ...m, youtubeLink: link } : m));
  const handleEdited = (updated) =>
    setMembers((prev) => prev.map((m) => m._id === updated._id ? { ...m, ...updated } : m));
  const handleDeleted = (id) =>
    setMembers((prev) => prev.filter((m) => m._id !== id));

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.membershipNo?.toLowerCase().includes(q) ||
      m.rank?.toLowerCase().includes(q) ||
      m.state?.toLowerCase().includes(q) ||
      m.mobile1?.includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    // pt-16 on mobile accounts for the fixed hamburger button from AdminSidebar
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 px-3 sm:px-5 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden ">

      {/* Modals */}
      {detailMember  && <DetailModal  member={detailMember}  onClose={() => setDetailMember(null)} />}
      {editMember    && <EditModal    member={editMember}    onClose={() => setEditMember(null)}    onSaved={handleEdited} />}
      {deleteMember  && <DeleteModal  member={deleteMember}  onClose={() => setDeleteMember(null)}  onDeleted={handleDeleted} />}
      {youtubeMember && <YoutubeModal member={youtubeMember} onClose={() => setYoutubeMember(null)} onSaved={handleYoutubeSaved} />}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1a2744] tracking-tight">
          Veer Nari / Mata-Pita Memberships
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage all membership applications submitted through the portal.
        </p>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { label: "Total",        value: members.length,                                                   color: "bg-[#293C86]" },
          { label: "With YouTube", value: members.filter((m) => m.youtubeLink).length,                      color: "bg-red-600" },
          { label: "States",       value: new Set(members.map((m) => m.state).filter(Boolean)).size,        color: "bg-orange-500" },
          { label: "This Month",   value: members.filter((m) => {
              const d = new Date(m.createdAt), n = new Date();
              return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
            }).length,                                                                                       color: "bg-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className={`w-1.5 sm:w-2 h-8 sm:h-10 rounded-full ${color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-[#1a2744] leading-none">{value}</p>
              <p className="text-[9px] sm:text-[11px] font-bold tracking-wider uppercase text-gray-400 mt-0.5 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
            <input type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, ID, rank, state…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400"
            />
          </div>
          <button onClick={loadMembers}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition whitespace-nowrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <SpinnerIcon /><span className="text-sm font-medium">Loading memberships…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-4 text-center">
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button onClick={loadMembers} className="text-sm text-[#293C86] font-bold hover:underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 px-4 text-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No memberships found.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table (lg+) ── */}
            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["#","Membership No.","Full Name","Rank","State","Mobile","YT","Docs","Actions"].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((member, idx) => (
                    <tr key={member._id} className="hover:bg-[#f7f9ff] transition-colors">
                      <td className="px-3 py-3 text-gray-400 text-xs">{(page - 1) * PER_PAGE + idx + 1}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF0FB] text-[#293C86] text-xs font-bold">
                          {member.membershipNo}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[#1a2744] text-sm">{member.fullName}</p>
                        <p className="text-[11px] text-gray-400">{member.serviceNumber}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{member.rank}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{member.state}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{member.mobile1}</td>
                      <td className="px-3 py-3">
                        {member.youtubeLink
                          ? <a href={member.youtubeLink} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-600 transition flex"><YoutubeIcon /></a>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-3"><DocBadges member={member} /></td>
                      <td className="px-3 py-3">
                        <ActionButtons member={member} size="sm"
                          onView={setDetailMember} onEdit={setEditMember}
                          onYoutube={setYoutubeMember} onDelete={setDeleteMember} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* ── Mobile / Tablet Cards (below lg) ── */}
            <div className="lg:hidden divide-y divide-gray-100">
              {paginated.map((member) => (
                <div key={member._id} className="p-3 sm:p-4">

                  {/* Row 1: badge + name + actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EEF0FB] text-[#293C86] text-xs font-bold mb-1">
                        {member.membershipNo}
                      </span>
                      <p className="font-bold text-[#1a2744] text-sm leading-tight">{member.fullName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{member.serviceNumber}</p>
                    </div>
                    {/* Actions always visible, right-aligned */}
                    <ActionButtons member={member}
                      onView={setDetailMember} onEdit={setEditMember}
                      onYoutube={setYoutubeMember} onDelete={setDeleteMember} />
                  </div>

                  {/* Row 2: details grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
                    {[
                      { label: "Rank",     value: member.rank },
                      { label: "State",    value: member.state },
                      { label: "Mobile",   value: member.mobile1 },
                      { label: "District", value: member.district },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[9px] font-bold tracking-wider uppercase text-gray-400">{label}</p>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium mt-0.5 truncate">{value || "—"}</p>
                      </div>
                    ))}
                  </div>

                  {/* Row 3: docs + youtube */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Docs</span>
                      <DocBadges member={member} />
                    </div>
                    {member.youtubeLink && (
                      <a href={member.youtubeLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium transition">
                        <YoutubeIcon /><span>YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center">
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                        page === p ? "bg-[#293C86] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center">
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}