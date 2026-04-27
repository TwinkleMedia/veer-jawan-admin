"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Icons (inline SVG, no extra deps) ───────────────────────────────────────
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const API = process.env.NEXT_PUBLIC_API_URL || "";
const MAX_SIZE = 2 * 1024 * 1024;

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ cert, onClose }) {
  if (!cert) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-orange-400 hover:text-orange-200 transition-colors">
          <IconX />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-400"><IconCert /></span>
          <h3 className="text-lg font-semibold text-orange-200 truncate">{cert.title}</h3>
        </div>
        <img
          src={cert.imageUrl}
          alt={cert.title}
          className="w-full max-h-96 object-contain rounded-xl border border-orange-500/20 bg-black/30"
        />
        <p className="mt-3 text-xs text-orange-500/60 text-right">
          Added {new Date(cert.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ cert, onClose, onSaved }) {
  const [title, setTitle] = useState(cert.title);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(cert.imageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { setError("Image must be less than 2MB"); return; }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (image) formData.append("image", image);

      const res = await fetch(`${API}/api/certificates/${cert._id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      onSaved(data.certificate);
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-[#1a1a1a] border border-orange-500/30 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-orange-400 hover:text-orange-200 transition-colors">
          <IconX />
        </button>
        <h3 className="text-lg font-semibold text-orange-300">Edit Certificate</h3>

        <div>
          <label className="block text-xs text-orange-400 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-orange-500/30 text-orange-100 placeholder-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-orange-400 mb-1">Replace Image (optional, max 2MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-orange-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-700 file:text-white hover:file:bg-orange-600 cursor-pointer"
          />
        </div>

        {preview && (
          <img src={preview} alt="preview" className="w-full max-h-48 object-contain rounded-xl border border-orange-500/20 bg-black/20" />
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-700 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ cert, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/certificates/${cert._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(cert._id);
    } catch {
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-[#1a1a1a] border border-red-500/40 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <IconTrash />
        </div>
        <h3 className="text-white font-semibold">Delete Certificate?</h3>
        <p className="text-sm text-orange-300/60">
          "<span className="text-orange-300">{cert.title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-orange-500/30 text-orange-300 text-sm hover:bg-orange-500/10 transition">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UploadCertificates() {
  // Upload form state
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Table state
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState("");

  // Modal state
  const [viewCert, setViewCert] = useState(null);
  const [editCert, setEditCert] = useState(null);
  const [deleteCert, setDeleteCert] = useState(null);

  // ── Fetch certificates ──────────────────────────────────────────────────
  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setTableError("");
    try {
      const res = await fetch(`${API}/api/certificates`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCerts(data.certificates || []);
    } catch {
      setTableError("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  // ── Upload form handlers ────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { setFormError("Image must be less than 2MB"); setImage(null); return; }
    setFormError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) { setFormError("All fields are required"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);
    try {
      const res = await fetch(`${API}/api/upload-certificate`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCerts((prev) => [data.certificate, ...prev]);
      setTitle(""); setImage(null); setPreview(null); setFormError("");
    } catch {
      setFormError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Table callbacks ─────────────────────────────────────────────────────
  const handleEdited = (updated) =>
    setCerts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

  const handleDeleted = (id) =>
    setCerts((prev) => prev.filter((c) => c._id !== id));

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Modals */}
      {viewCert   && <ViewModal   cert={viewCert}   onClose={() => setViewCert(null)} />}
      {editCert   && <EditModal   cert={editCert}   onClose={() => setEditCert(null)}   onSaved={(u) => { handleEdited(u); setEditCert(null); }} />}
      {deleteCert && <DeleteModal cert={deleteCert} onClose={() => setDeleteCert(null)} onDeleted={(id) => { handleDeleted(id); setDeleteCert(null); }} />}

      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-10 space-y-10">

        {/* ── Upload Form ── */}
        <div className="max-w-3xl mx-auto bg-white border border-orange-200 rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 flex items-center gap-2">
            <IconUpload /> Upload Certificate
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-orange-600 mb-1">Certificate Title</label>
              <input
                type="text"
                placeholder="Enter certificate title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-300 text-gray-800 placeholder-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-1">Upload Image (Max 2MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
              />
            </div>

            {preview && (
              <div>
                <p className="text-orange-500 text-sm mb-2">Preview:</p>
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl border border-orange-200 bg-orange-50" />
              </div>
            )}

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading…</>
              ) : (
                <><IconUpload /> Upload Certificate</>
              )}
            </button>
          </form>
        </div>

        {/* ── Certificates Table ── */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500"><IconCert /></span>
              All Certificates
              {!loading && (
                <span className="ml-2 text-xs font-normal bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  {certs.length}
                </span>
              )}
            </h2>
            <button
              onClick={fetchCerts}
              className="text-xs text-orange-500 hover:text-orange-700 border border-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white border border-orange-100 rounded-2xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-orange-400 gap-3">
                <span className="w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                Loading certificates…
              </div>
            ) : tableError ? (
              <div className="text-center py-16 text-red-400">{tableError}</div>
            ) : certs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3 opacity-30">🏅</div>
                No certificates uploaded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-left">
                      <th className="px-4 py-3 font-semibold w-10">#</th>
                      <th className="px-4 py-3 font-semibold w-20">Image</th>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Uploaded On</th>
                      <th className="px-4 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certs.map((cert, i) => (
                      <tr
                        key={cert._id}
                        className={`border-t border-orange-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-orange-50/40"} hover:bg-orange-50`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>

                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-12 h-12 object-cover rounded-lg border border-orange-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setViewCert(cert)}
                          />
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
                          {cert.title}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(cert.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* View */}
                            <button
                              onClick={() => setViewCert(cert)}
                              title="View"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition text-xs font-medium"
                            >
                              <IconEye /> View
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditCert(cert)}
                              title="Edit"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition text-xs font-medium"
                            >
                              <IconEdit /> Edit
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteCert(cert)}
                              title="Delete"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition text-xs font-medium"
                            >
                              <IconTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}