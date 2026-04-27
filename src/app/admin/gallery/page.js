"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_BYTES   = MAX_IMAGE_SIZE_MB * 1024 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Detect embed type and return an embed URL ─────────────────────────────────
function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    // YouTube watch
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    // YouTube short link
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    // Direct video file link — use as-is
    return url;
  } catch {
    return url;
  }
}

function isDirectVideoUrl(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov|avi)$/.test(path);
  } catch {
    return false;
  }
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ gallery, onClose }) {
  if (!gallery) return null;
  const images = gallery.media.filter((m) => m.type === "image");
  const videos = gallery.media.filter((m) => m.type === "video");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{gallery.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {gallery.media.length} file{gallery.media.length !== 1 ? "s" : ""} · Created {formatDate(gallery.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition">✕</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6">
          {images.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Images ({images.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noreferrer"
                    className="group block rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200 hover:border-gray-400 transition">
                    <img src={img.url} alt={img.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Videos ({videos.length})</p>
              <div className="grid grid-cols-1 gap-3">
                {videos.map((vid, i) => {
                  const embed = getEmbedUrl(vid.url);
                  const isDirect = isDirectVideoUrl(vid.url);
                  return (
                    <div key={i} className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {isDirect ? (
                        <video controls className="w-full max-h-56 object-cover">
                          <source src={vid.url} />
                        </video>
                      ) : (
                        <iframe
                          src={embed}
                          title={vid.fileName}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full aspect-video"
                        />
                      )}
                      <p className="text-[10px] text-gray-400 px-3 py-1.5 truncate">{vid.url}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ gallery, onClose, onSaved, showToast }) {
  const [title,         setTitle]         = useState(gallery.title);
  const [saving,        setSaving]        = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(new Set());
  const [newVideoLink,  setNewVideoLink]  = useState("");
  const [addVideoLinks, setAddVideoLinks] = useState([]);
  const [linkError,     setLinkError]     = useState("");

  const toggleDelete = (publicId) => {
    setMediaToDelete((prev) => {
      const next = new Set(prev);
      next.has(publicId) ? next.delete(publicId) : next.add(publicId);
      return next;
    });
  };

  const handleAddLink = () => {
    const trimmed = newVideoLink.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setAddVideoLinks((prev) => [...prev, trimmed]);
      setNewVideoLink("");
      setLinkError("");
    } catch {
      setLinkError("Please enter a valid URL.");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/gallery/${gallery._id}`, {
        method:      "PATCH",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:          title.trim(),
          deleteMediaIds: Array.from(mediaToDelete),
          addVideoLinks,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed.");
      showToast("Gallery updated ✓");
      onSaved(json.gallery);
      onClose();
    } catch (err) {
      showToast(err.message || "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Edit Gallery</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition">✕</button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
            />
          </div>

          {/* Existing media */}
          {gallery.media.length > 0 && (
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                Media — click to mark for removal
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {gallery.media.map((item) => (
                  <button
                    key={item.publicId}
                    type="button"
                    onClick={() => toggleDelete(item.publicId)}
                    className={`relative rounded-lg overflow-hidden aspect-square border-2 transition ${
                      mediaToDelete.has(item.publicId)
                        ? "border-red-400 opacity-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white text-[9px] gap-1 px-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-60">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span className="truncate w-full text-center opacity-60">{item.fileName}</span>
                      </div>
                    )}
                    {mediaToDelete.has(item.publicId) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                        <span className="text-red-500 font-bold text-lg">✕</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {mediaToDelete.size > 0 && (
                <p className="text-xs text-red-400 mt-2">{mediaToDelete.size} item{mediaToDelete.size > 1 ? "s" : ""} marked for removal</p>
              )}
            </div>
          )}

          {/* Add new video links */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
              Add Video Links
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={newVideoLink}
                onChange={(e) => { setNewVideoLink(e.target.value); setLinkError(""); }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >Add</button>
            </div>
            {linkError && <p className="text-xs text-red-400 mt-1">{linkError}</p>}
            {addVideoLinks.length > 0 && (
              <div className="mt-2 space-y-1">
                {addVideoLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-green-500 flex-shrink-0"><path d="M8 5v14l11-7z"/></svg>
                    <span className="text-xs text-green-700 truncate flex-1">{link}</span>
                    <button type="button" onClick={() => setAddVideoLinks((p) => p.filter((_, idx) => idx !== i))} className="text-green-400 hover:text-red-400 transition text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ gallery, onClose, onDeleted, showToast }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/gallery/${gallery._id}`, {
        method: "DELETE", credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed.");
      showToast("Gallery deleted.");
      onDeleted(gallery._id);
      onClose();
    } catch (err) {
      showToast(err.message || "Something went wrong.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"/>
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 text-base mb-1">Delete Gallery?</h3>
        <p className="text-sm text-gray-500 mb-6">
          "<span className="font-medium text-gray-700">{gallery.title}</span>" and all its media will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-40">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [title,         setTitle]         = useState("");
  const [images,        setImages]        = useState([]);
  const [videoLinks,    setVideoLinks]    = useState([]); // array of URL strings
  const [videoLinkInput,setVideoLinkInput]= useState("");
  const [videoLinkError,setVideoLinkError]= useState("");
  const [titleError,    setTitleError]    = useState(false);
  const [mediaError,    setMediaError]    = useState(false);
  const [sizeErrors,    setSizeErrors]    = useState([]);
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [isUploading,   setIsUploading]   = useState(false);
  const [toast,         setToast]         = useState({ show: false, message: "", type: "success" });

  // Table state
  const [galleries,    setGalleries]    = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError,   setTableError]   = useState("");
  const [search,       setSearch]       = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const PAGE_SIZE = 5;

  // Modals
  const [viewGallery,   setViewGallery]   = useState(null);
  const [editGallery,   setEditGallery]   = useState(null);
  const [deleteGallery, setDeleteGallery] = useState(null);

  const imgInputRef = useRef(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  // ── Fetch galleries ────────────────────────────────────────────────────────
  const fetchGalleries = useCallback(async () => {
    setTableLoading(true); setTableError("");
    try {
      const res  = await fetch(`${API_URL}/api/gallery`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load galleries.");
      setGalleries(json.galleries);
    } catch (err) {
      setTableError(err.message);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => { fetchGalleries(); }, [fetchGalleries]);

  // ── Table helpers ──────────────────────────────────────────────────────────
  const filtered   = galleries.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  // ── Image handlers ─────────────────────────────────────────────────────────
  const validateAndAddImages = (files) => {
    const errors = [], valid = [];
    files.forEach((f) => {
      if (f.size > MAX_IMAGE_BYTES) errors.push(`"${f.name}" exceeds ${MAX_IMAGE_SIZE_MB} MB limit.`);
      else valid.push({ file: f, preview: URL.createObjectURL(f) });
    });
    if (errors.length) setSizeErrors((prev) => [...prev, ...errors]);
    if (valid.length)  { setImages((prev) => [...prev, ...valid]); setMediaError(false); }
  };

  const handleImageChange = (e) => { setSizeErrors([]); validateAndAddImages(Array.from(e.target.files)); e.target.value = ""; };
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleImgDrop = (e) => {
    e.preventDefault(); setIsDraggingImg(false); setSizeErrors([]);
    validateAndAddImages(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  };

  // ── Video link handlers ────────────────────────────────────────────────────
  const addVideoLink = () => {
    const trimmed = videoLinkInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setVideoLinks((prev) => [...prev, trimmed]);
      setVideoLinkInput("");
      setVideoLinkError("");
      setMediaError(false);
    } catch {
      setVideoLinkError("Please enter a valid URL (e.g. https://youtube.com/watch?v=...)");
    }
  };

  const removeVideoLink = (i) => setVideoLinks((prev) => prev.filter((_, idx) => idx !== i));

  // ── Submit ─────────────────────────────────────────────────────────────────
 const handleSubmit = async (e) => {
  e.preventDefault();
  setSizeErrors([]);

  // ── ADD THIS: flush any pending video link input ──
  let finalVideoLinks = [...videoLinks];
  if (videoLinkInput.trim()) {
    try {
      new URL(videoLinkInput.trim());
      finalVideoLinks = [...finalVideoLinks, videoLinkInput.trim()];
      setVideoLinkInput("");
    } catch {
      setVideoLinkError("Please enter a valid URL.");
      return;
    }
  }
  // ─────────────────────────────────────────────────

  let valid = true;
  if (!title.trim())                                        { setTitleError(true); valid = false; }
  if (images.length === 0 && finalVideoLinks.length === 0)  { setMediaError(true); valid = false; }  // ← use finalVideoLinks
  if (!valid) return;
  if (!API_URL) { showToast("API URL not configured.", "error"); return; }

  setIsUploading(true);
  try {
    const imagePayload = await Promise.all(
      images.map(async ({ file }) => ({ name: file.name, size: file.size, data: await fileToBase64(file) }))
    );

    const res = await fetch(`${API_URL}/api/gallery/upload`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, images: imagePayload, videoLinks: finalVideoLinks }), // ← finalVideoLinks
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Upload failed.");

    setTitle(""); setImages([]); setVideoLinks([]); setVideoLinkInput("");
    showToast("Gallery uploaded successfully ✓");
    fetchGalleries();
  } catch (err) {
    showToast(err.message || "Something went wrong.", "error");
  } finally {
    setIsUploading(false);
  }
};
  // ── Table callbacks ────────────────────────────────────────────────────────
  const handleDeleted = (id)      => setGalleries((prev) => prev.filter((g) => g._id !== id));
  const handleSaved   = (updated) => setGalleries((prev) => prev.map((g) => g._id === updated._id ? updated : g));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      {/* Modals */}
      {viewGallery   && <ViewModal   gallery={viewGallery}   onClose={() => setViewGallery(null)} />}
      {editGallery   && <EditModal   gallery={editGallery}   onClose={() => setEditGallery(null)}   onSaved={handleSaved}   showToast={showToast} />}
      {deleteGallery && <DeleteModal gallery={deleteGallery} onClose={() => setDeleteGallery(null)} onDeleted={handleDeleted} showToast={showToast} />}

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 whitespace-nowrap ${
        toast.type === "error" ? "bg-red-600" : "bg-gray-900"
      } ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        {toast.message}
      </div>

      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Upload Form ── */}
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gallery Upload</h1>
            <p className="text-sm text-gray-500">Share your photos and video links in one place</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Day 2025"
                  value={title}
                  maxLength={80}
                  onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-gray-200 ${
                    titleError ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-gray-300"
                  }`}
                />
                {titleError && <p className="text-xs text-red-400 mt-1.5">Please enter a title</p>}
              </div>

              <div className="border-t border-gray-100" />

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                  Images
                  {images.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 normal-case tracking-normal">{images.length}</span>
                  )}
                  <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-gray-400">Max {MAX_IMAGE_SIZE_MB} MB per file</span>
                </label>
                <div
                  onClick={() => imgInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingImg(true); }}
                  onDragLeave={() => setIsDraggingImg(false)}
                  onDrop={handleImgDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDraggingImg ? "border-gray-400 bg-gray-100" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <input ref={imgInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="6" width="26" height="20" rx="3"/><circle cx="11" cy="13" r="2.5"/><path d="M3 22l7-6 5 5 4-4 9 8"/>
                  </svg>
                  <p className="text-sm font-medium text-gray-600">Drop images here or <span className="text-orange-500">click to browse</span></p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP — up to {MAX_IMAGE_SIZE_MB} MB each</p>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map(({ file, preview }, index) => (
                      <div key={index} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] px-1 py-0.5 truncate">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Video Links */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                  Video Links
                  {videoLinks.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 normal-case tracking-normal">{videoLinks.length}</span>
                  )}
                </label>
                <p className="text-xs text-gray-400 mb-2">Paste YouTube, Vimeo, or any direct video URL</p>

                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoLinkInput}
                    onChange={(e) => { setVideoLinkInput(e.target.value); setVideoLinkError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideoLink())}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={addVideoLink}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition flex-shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {videoLinkError && <p className="text-xs text-red-400 mt-1.5">{videoLinkError}</p>}

                {/* Added links list */}
                {videoLinks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {videoLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500 flex-shrink-0">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span className="text-xs text-green-700 truncate flex-1">{link}</span>
                        <button type="button" onClick={() => removeVideoLink(i)} className="text-green-400 hover:text-red-400 transition text-base leading-none flex-shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sizeErrors.length > 0 && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 space-y-1">
                  {sizeErrors.map((err, i) => <p key={i} className="text-xs text-red-500">⚠ {err}</p>)}
                </div>
              )}
              {mediaError && <p className="text-xs text-red-400">Please add at least one image or video link</p>}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Gallery"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Gallery Table ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Galleries</h2>
              <p className="text-sm text-gray-400 mt-0.5">{galleries.length} entr{galleries.length !== 1 ? "ies" : "y"} in database</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search galleries…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 w-48"
                />
              </div>
              <button onClick={fetchGalleries} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-500" title="Refresh">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
              {["Title", "Media", "Size", "Created", "Actions"].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</span>
              ))}
            </div>

            {tableLoading ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Loading galleries…
              </div>
            ) : tableError ? (
              <div className="flex items-center justify-center py-16 text-sm text-red-400 gap-2">⚠ {tableError}</div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400">
                <svg className="w-10 h-10 text-gray-200 mb-3" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="6" width="26" height="20" rx="3"/><circle cx="11" cy="13" r="2.5"/><path d="M3 22l7-6 5 5 4-4 9 8"/>
                </svg>
                {search ? "No galleries match your search." : "No galleries uploaded yet."}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {paginated.map((g) => {
                  const imgCount  = g.media.filter((m) => m.type === "image").length;
                  const vidCount  = g.media.filter((m) => m.type === "video").length;
                  const totalSize = g.media.reduce((acc, m) => acc + (m.size || 0), 0);
                  const thumb     = g.media.find((m) => m.type === "image")?.url;

                  return (
                    <div key={g._id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">{g.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {imgCount > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{imgCount} img</span>}
                        {vidCount > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">{vidCount} link{vidCount > 1 ? "s" : ""}</span>}
                        {imgCount === 0 && vidCount === 0 && <span className="text-xs text-gray-300">—</span>}
                      </div>

                      <span className="text-xs text-gray-500">{formatBytes(totalSize)}</span>
                      <span className="text-xs text-gray-500">{formatDate(g.createdAt)}</span>

                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewGallery(g)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          View
                        </button>
                        <button onClick={() => setEditGallery(g)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => setDeleteGallery(g)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!tableLoading && !tableError && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition ${p === currentPage ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}