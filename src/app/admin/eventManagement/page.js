"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

const INITIAL_FORM = { title: "", date: "", time: "", address: "", description: "" };

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, required, icon, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-[#1a2744]">
        {icon && <span className="text-[#FF671F]">{icon}</span>}
        {label}{required && <span className="text-[#FF671F]">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Modal Wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white w-full ${maxWidth} sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 overflow-hidden sm:mx-4`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
          <h2 className="text-white font-bold text-sm sm:text-base tracking-wide truncate pr-4">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition shrink-0"><CloseIcon /></button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function ViewModal({ event, onClose }) {
  return (
    <Modal title={`View Event — ${event.title}`} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title}
            className="w-full h-48 sm:h-60 object-cover rounded-xl border border-gray-100" />
        )}
        <h3 className="text-lg font-black text-[#1a2744]">{event.title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
            <span className="text-[#293C86]"><CalendarIcon /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
              <p className="text-sm font-semibold text-[#1a2744]">{formatDate(event.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
            <span className="text-[#FF671F]"><ClockIcon /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time</p>
              <p className="text-sm font-semibold text-[#1a2744]">{event.time || "—"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
          <span className="text-gray-400 mt-0.5"><MapPinIcon /></span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Address</p>
            <p className="text-sm text-gray-700">{event.address}</p>
          </div>
        </div>
        {event.description && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}
        <div className="flex gap-2 text-xs text-gray-400">
          <span>Created: {event.createdAt ? new Date(event.createdAt).toLocaleString("en-IN") : "—"}</span>
        </div>
      </div>
    </Modal>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ event, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`/api/events/${event._id}`, { method: "DELETE" });
      onDeleted(event._id);
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
              Delete event <strong>"{event.title}"</strong>?
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
            {loading ? <SpinnerIcon /> : <TrashIcon />}
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       event.title || "",
    date:        event.date || "",
    time:        event.time || "",
    address:     event.address || "",
    description: event.description || "",
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(event.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      let updatedData;
      if (imageFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", imageFile);
        const res = await fetch(`${API}/api/events/${event._id}`, {
          method: "PUT", credentials: "include", body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong");
        updatedData = data;
      } else {
        updatedData = await fetcher(`/api/events/${event._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
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
    <Modal title={`Edit Event`} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">

        <Field label="Event Title" required
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}>
          <input type="text" className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date" required icon={<CalendarIcon />}>
            <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Time" required icon={<ClockIcon />}>
            <input type="time" className={inputCls} value={form.time} onChange={(e) => set("time", e.target.value)} />
          </Field>
        </div>

        <Field label="Address" required icon={<MapPinIcon />}>
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.address}
            onChange={(e) => set("address", e.target.value)} />
        </Field>

        <Field label="Description"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}>
          <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.description}
            onChange={(e) => set("description", e.target.value)} />
        </Field>

        {/* Image */}
        <Field label="Event Image"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}>
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 group cursor-pointer"
            onClick={() => fileRef.current?.click()}>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-bold bg-black/30 px-3 py-1.5 rounded-lg">Click to Change</span>
                </div>
                {imageFile && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-black uppercase text-white bg-[#FF671F] px-2 py-0.5 rounded">New Image</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-36 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#293C86] transition bg-gray-50">
                <ImageIcon />
                <span className="text-xs font-semibold">Click to upload image</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />
        </Field>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
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
      </div>
    </Modal>
  );
}

// ── Create Event Form ─────────────────────────────────────────────────────────

function CreateEventForm({ onCreated }) {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const fileRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const resetAll = () => {
    setForm(INITIAL_FORM);
    clearImage();
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.title.trim()) return setError("Event title is required.");
    if (!form.date)         return setError("Event date is required.");
    if (!form.time)         return setError("Event time is required.");
    if (!form.address.trim()) return setError("Event address is required.");
    if (!imageFile)         return setError("Event image is required.");

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", imageFile);

      const res = await fetch(`${API}/api/events`, {
        method: "POST", credentials: "include", body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setSuccess(`Event "${data.data.title}" published successfully!`);
      onCreated(data.data);
      resetAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
        <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">Create New Event</h2>
        <p className="text-white/50 text-xs mt-0.5">Fill in all the details for the event below.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 space-y-4 sm:space-y-5">

        {/* Title */}
        <Field label="Event Title" required
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}>
          <input type="text" className={inputCls} placeholder="e.g. Shaheed Samman Samaroh 2025"
            value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>

        {/* Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Event Date" required icon={<CalendarIcon />}>
            <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Event Time" required icon={<ClockIcon />}>
            <input type="time" className={inputCls} value={form.time} onChange={(e) => set("time", e.target.value)} />
          </Field>
        </div>

        {/* Address */}
        <Field label="Event Address" required icon={<MapPinIcon />}>
          <textarea className={`${inputCls} resize-y min-h-[90px]`}
            placeholder="Enter the full venue address, city, state…"
            value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>

        {/* Description */}
        <Field label="Event Description"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}>
          <textarea className={`${inputCls} resize-y min-h-[100px]`}
            placeholder="Describe the event — purpose, program schedule, guests, etc."
            value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        {/* Image Upload */}
        <Field label="Event Image" required
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#293C86]/20 group">
              <img src={imagePreview} alt="Event" className="w-full h-44 sm:h-56 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#293C86] text-xs font-bold hover:bg-[#293C86] hover:text-white transition">
                    <EditIcon /> Change
                  </button>
                  <button type="button" onClick={clearImage}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition">
                    <TrashIcon /> Remove
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                <p className="text-white text-xs font-medium truncate">{imageFile?.name}</p>
              </div>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#293C86] hover:bg-blue-50/30 transition group">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-[#EEF0FB] flex items-center justify-center transition text-gray-400 group-hover:text-[#293C86]">
                <ImageIcon />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600 group-hover:text-[#293C86] transition">Click to upload event image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · Max 5MB</p>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" />
        </Field>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-green-600 shrink-0"><CheckIcon /></span>
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button type="button" onClick={resetAll}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
            Reset
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#293C86] text-white text-sm font-bold hover:bg-[#1a2744] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:translate-y-0">
            {loading ? (
              <><SpinnerIcon /><span>Publishing…</span></>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Publish Event
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          <span className="text-[#FF671F]">*</span> Fields marked with asterisk are mandatory
        </p>
      </form>
    </div>
  );
}

// ── Events Table ──────────────────────────────────────────────────────────────

function EventsTable({ events, loading, error, onRefresh, onView, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const PER_PAGE = 8;

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.address?.toLowerCase().includes(q) ||
      e.date?.includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1a2744] to-[#293C86] border-b-2 border-[#FF671F]">
        <h2 className="text-white font-bold text-sm sm:text-base tracking-wide">All Events</h2>
        <p className="text-white/50 text-xs mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""} in the database</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-gray-100">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#293C86] focus:ring-2 focus:ring-[#293C86]/10 transition placeholder-gray-400"
          />
        </div>
        <button onClick={onRefresh}
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
          <SpinnerIcon /><span className="text-sm font-medium">Loading events…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-4 text-center">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={onRefresh} className="text-sm text-[#293C86] font-bold hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-medium">{search ? "No events match your search." : "No events yet. Create one above!"}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table (md+) ── */}
          <div className="hidden md:block overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 w-[30%]">Event</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 w-[15%]">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 w-[10%]">Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 w-[28%]">Address</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-400 w-[17%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((event) => (
                  <tr key={event._id} className="hover:bg-[#f7f9ff] transition-colors">

                    {/* Event */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                        <p className="font-semibold text-[#1a2744] text-sm truncate">{event.title}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <span className="text-[#293C86]"><CalendarIcon /></span>
                        <span className="truncate">{formatDate(event.date)}</span>
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <span className="text-[#FF671F]"><ClockIcon /></span>
                        {event.time || "—"}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 truncate">{event.address}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onView(event)} title="View"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#293C86] bg-[#EEF0FB] hover:bg-[#d8dcf5] transition">
                          <EyeIcon />
                        </button>
                        <button onClick={() => onEdit(event)} title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 transition">
                          <EditIcon />
                        </button>
                        <button onClick={() => onDelete(event)} title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-red-500 hover:bg-red-600 transition">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards (below md) ── */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginated.map((event) => (
              <div key={event._id} className="p-3 sm:p-4 flex gap-3">
                {/* Image */}
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a2744] text-sm truncate mb-1">{event.title}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-[#293C86]"><CalendarIcon /></span>{formatDate(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-[#FF671F]"><ClockIcon /></span>{event.time || "—"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-2">{event.address}</p>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(event)} title="View"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#293C86] bg-[#EEF0FB] hover:bg-[#d8dcf5] transition">
                      <EyeIcon />
                    </button>
                    <button onClick={() => onEdit(event)} title="Edit"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 transition">
                      <EditIcon />
                    </button>
                    <button onClick={() => onDelete(event)} title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-red-500 hover:bg-red-600 transition">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} events
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
                        }`}>{p}
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
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EventManagementPage() {
  const [events, setEvents]   = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [fetchError, setFetchError]       = useState("");

  // Modals
  const [viewEvent,   setViewEvent]   = useState(null);
  const [editEvent,   setEditEvent]   = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  // Tab: "create" | "list"
  const [tab, setTab] = useState("list");

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true); setFetchError("");
    try {
      const data = await fetcher("/api/events");
      setEvents(data.data || []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setTab("list");
  };
  const handleEdited  = (updated) =>
    setEvents((prev) => prev.map((e) => e._id === updated._id ? { ...e, ...updated } : e));
  const handleDeleted = (id) =>
    setEvents((prev) => prev.filter((e) => e._id !== id));

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">

      {/* Modals */}
      {viewEvent   && <ViewModal   event={viewEvent}   onClose={() => setViewEvent(null)} />}
      {editEvent   && <EditModal   event={editEvent}   onClose={() => setEditEvent(null)}   onSaved={handleEdited} />}
      {deleteEvent && <DeleteModal event={deleteEvent} onClose={() => setDeleteEvent(null)} onDeleted={handleDeleted} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full bg-[#FF671F]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#1a2744] tracking-tight">Event Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 pl-4">Create and manage events for the organization.</p>
        </div>

        {/* Stat badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5 flex items-center gap-2">
            <div className="w-2 h-8 rounded-full bg-[#293C86] shrink-0" />
            <div>
              <p className="text-lg font-black text-[#1a2744] leading-none">{events.length}</p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Total Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm mb-5 sm:mb-6 w-fit">
        <button onClick={() => setTab("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
            tab === "list"
              ? "bg-[#293C86] text-white shadow-sm"
              : "text-gray-500 hover:text-[#293C86] hover:bg-gray-50"
          }`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          All Events
          {events.length > 0 && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${tab === "list" ? "bg-white/20 text-white" : "bg-[#EEF0FB] text-[#293C86]"}`}>
              {events.length}
            </span>
          )}
        </button>
        <button onClick={() => setTab("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
            tab === "create"
              ? "bg-[#FF671F] text-white shadow-sm"
              : "text-gray-500 hover:text-[#FF671F] hover:bg-orange-50"
          }`}>
          <PlusIcon />
          Create Event
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl">
        {tab === "list" ? (
          <EventsTable
            events={events}
            loading={loadingEvents}
            error={fetchError}
            onRefresh={loadEvents}
            onView={setViewEvent}
            onEdit={setEditEvent}
            onDelete={setDeleteEvent}
          />
        ) : (
          <CreateEventForm onCreated={handleCreated} />
        )}
      </div>
    </div>
  );
}