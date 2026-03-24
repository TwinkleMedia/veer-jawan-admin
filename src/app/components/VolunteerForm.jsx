"use client";

import { useState, useEffect } from "react";

const inputCls =
  "w-full bg-white border border-orange-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-sm shadow-sm";

const labelCls =
  "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

const sectionTitleCls =
  "text-xs font-black uppercase tracking-wider text-orange-400 mb-5 flex items-center gap-2 min-w-0";

const API = process.env.NEXT_PUBLIC_API_URL;

const EMPTY_FORM = {
  fullName: "", dob: "", gender: "", email: "", mobile: "",
  alternateMobile: "", address1: "", address2: "", city: "",
  state: "", pincode: "", interests: [], skills: "",
  availability: "", location: "", occupation: "",
};

const interestsList = [
  "Event Management", "Fundraising", "Social Media Promotion",
  "Field Work", "Administrative Support", "Awareness Campaign",
  "Helping Martyrs' Families",
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

function SectionDivider({ title, icon }) {
  return (
    <div className={sectionTitleCls}>
      <span>{icon}</span>
      <span>{title}</span>
      <span className="flex-1 min-w-0 h-px bg-orange-100 ml-1" />
    </div>
  );
}

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ volunteer, onClose, onSaved }) {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when volunteer changes
  useEffect(() => {
    if (!volunteer) return;
    setFormData({
      fullName: volunteer.fullName || "",
      dob: volunteer.dob ? volunteer.dob.slice(0, 10) : "",
      gender: volunteer.gender || "",
      email: volunteer.email || "",
      mobile: volunteer.mobile || "",
      alternateMobile: volunteer.alternateMobile || "",
      address1: volunteer.address1 || "",
      address2: volunteer.address2 || "",
      city: volunteer.city || "",
      state: volunteer.state || "",
      pincode: volunteer.pincode || "",
      interests: volunteer.interests || [],
      skills: volunteer.skills || "",
      availability: volunteer.availability || "",
      location: volunteer.location || "",
      occupation: volunteer.occupation || "",
    });
    setError("");
  }, [volunteer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, value]
        : prev.interests.filter((i) => i !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/volunteers/${volunteer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.message || "Update failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!volunteer) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden my-auto">

        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Edit Volunteer</h2>
            <p className="text-orange-100 text-xs mt-0.5 truncate max-w-xs">{volunteer.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-lg transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto max-h-[70vh]">

          {/* PERSONAL INFO */}
          <div className="px-6 py-6 border-b border-orange-50">
            <SectionDivider title="Personal Info" icon="👤" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} required placeholder="Enter full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob}
                  onChange={handleChange} className={inputCls} />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Gender</label>
              <div className="flex flex-wrap gap-4 mt-1">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="radio" name="gender" value={g}
                      checked={formData.gender === g} onChange={handleChange} className="accent-orange-500" />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation}
                onChange={handleChange} placeholder="e.g. Teacher, Engineer, Student" className={inputCls} />
            </div>
          </div>

          {/* CONTACT */}
          <div className="px-6 py-6 border-b border-orange-50">
            <SectionDivider title="Contact Details" icon="📞" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile *</label>
                <input type="tel" name="mobile" value={formData.mobile}
                  onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Alternate Mobile</label>
              <input type="tel" name="alternateMobile" value={formData.alternateMobile}
                onChange={handleChange} placeholder="Optional" className={inputCls} />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="px-6 py-6 border-b border-orange-50">
            <SectionDivider title="Address" icon="📍" />
            <div className="mb-4">
              <label className={labelCls}>Address Line 1</label>
              <input type="text" name="address1" value={formData.address1}
                onChange={handleChange} placeholder="House / Flat No., Street" className={inputCls} />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Address Line 2</label>
              <input type="text" name="address2" value={formData.address2}
                onChange={handleChange} placeholder="Landmark, Area (optional)" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} placeholder="City" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select name="state" value={formData.state} onChange={handleChange} className={inputCls}>
                  <option value="">Select State</option>
                  {indianStates.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input type="number" name="pincode" value={formData.pincode}
                  onChange={handleChange} placeholder="6-digit PIN" maxLength={6} className={inputCls} />
              </div>
            </div>
          </div>

          {/* INTERESTS */}
          <div className="px-6 py-6 border-b border-orange-50">
            <SectionDivider title="Area of Interest" icon="🎯" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestsList.map((item) => (
                <label key={item}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition text-sm
                    ${formData.interests.includes(item)
                      ? "border-orange-300 bg-orange-50 text-orange-800 font-medium"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"}`}>
                  <input type="checkbox" value={item}
                    checked={formData.interests.includes(item)}
                    onChange={handleCheckbox} className="accent-orange-500 w-4 h-4 shrink-0" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* SKILLS */}
          <div className="px-6 py-6">
            <SectionDivider title="Skills" icon="⚡" />
            <textarea name="skills" rows="3" value={formData.skills}
              onChange={handleChange}
              placeholder="Describe any relevant skills, languages spoken, or special expertise..."
              className={inputCls} />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="sticky bottom-0 px-6 py-4 bg-orange-50 border-t border-orange-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 font-bold rounded-xl transition text-sm border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl transition text-sm tracking-wide shadow-md shadow-orange-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : "✅ Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Mobile Volunteer Card ──────────────────────────────────────────────────
function VolunteerCard({ v, i, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-orange-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-orange-50/50 transition text-left"
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 font-black text-sm flex items-center justify-center shrink-0">
          {v.fullName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{v.fullName}</p>
          <p className="text-xs text-gray-400 truncate">{v.email}</p>
        </div>
        <span className="text-gray-300 text-xs shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-orange-50/40 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-orange-100">
          {[
            ["Mobile", v.mobile],
            ["Gender", v.gender],
            ["City", v.city],
            ["State", v.state],
            ["Occupation", v.occupation],
            ["Registered", v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">{label}</p>
              <p className="text-gray-700 font-medium mt-0.5">{val || "—"}</p>
            </div>
          ))}
          {v.interests?.length > 0 && (
            <div className="col-span-2">
              <p className="text-gray-400 uppercase font-bold tracking-wider text-[10px] mb-1">Interests</p>
              <div className="flex flex-wrap gap-1">
                {v.interests.map((int) => (
                  <span key={int} className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                    {int}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="col-span-2 mt-2 flex gap-2">
            <button
              onClick={() => onEdit(v)}
              className="flex-1 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold rounded-lg text-xs transition border border-orange-200"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(v._id)}
              className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition border border-red-100"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function VolunteerForm() {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editingVolunteer, setEditingVolunteer] = useState(null);

  const fetchVolunteers = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(`${API}/api/volunteers`);
      const data = await res.json();
      if (data.success) setVolunteers(data.data);
    } catch (err) {
      console.error("Failed to fetch volunteers", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => { fetchVolunteers(); }, []);

  useEffect(() => {
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.overflowX = "";
      document.body.style.overflowX = "";
    };
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (editingVolunteer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [editingVolunteer]);

  const deleteVolunteer = async (id) => {
    if (!confirm("Are you sure you want to delete this volunteer?")) return;
    try {
      const res = await fetch(`${API}/api/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchVolunteers();
      } else {
        alert("Delete failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, value]
        : prev.interests.filter((i) => i !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ ...EMPTY_FORM });
        fetchVolunteers();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = volunteers.filter((v) =>
    v.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase()) ||
    v.state?.toLowerCase().includes(search.toLowerCase())
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 overflow-x-hidden">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 sm:p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🇮🇳</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Jai Hind!</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your volunteer application has been submitted successfully. Thank you for stepping forward to serve the nation.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition text-sm"
          >
            Register Another Volunteer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/60 py-8 px-4 sm:py-10 overflow-x-hidden">

      {/* Edit Modal */}
      {editingVolunteer && (
        <EditModal
          volunteer={editingVolunteer}
          onClose={() => setEditingVolunteer(null)}
          onSaved={fetchVolunteers}
        />
      )}

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto text-center mb-8 px-2">
        <div className="text-3xl mb-2">🇮🇳</div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Volunteer Registration</h1>
        <p className="text-gray-400 text-sm mt-1.5">Join hands to serve the nation.</p>
        <div className="flex h-1 rounded-full overflow-hidden mt-4 max-w-xs mx-auto">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-white border-y border-gray-200" />
          <div className="flex-1 bg-green-600" />
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden mb-12">
        <form onSubmit={handleSubmit} noValidate>

          {/* PERSONAL INFO */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Personal Info" icon="👤" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} required placeholder="Enter your full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob}
                  onChange={handleChange} required className={inputCls} />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Gender</label>
              <div className="flex flex-wrap gap-4 mt-1">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="radio" name="gender" value={g}
                      checked={formData.gender === g} onChange={handleChange} className="accent-orange-500" />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation}
                onChange={handleChange} placeholder="e.g. Teacher, Engineer, Student" className={inputCls} />
            </div>
          </div>

          {/* CONTACT */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Contact Details" icon="📞" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile *</label>
                <input type="tel" name="mobile" value={formData.mobile}
                  onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Alternate Mobile</label>
              <input type="tel" name="alternateMobile" value={formData.alternateMobile}
                onChange={handleChange} placeholder="Optional" className={inputCls} />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Address" icon="📍" />
            <div className="mb-4">
              <label className={labelCls}>Address Line 1</label>
              <input type="text" name="address1" value={formData.address1}
                onChange={handleChange} placeholder="House / Flat No., Street" className={inputCls} />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Address Line 2</label>
              <input type="text" name="address2" value={formData.address2}
                onChange={handleChange} placeholder="Landmark, Area (optional)" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} placeholder="City" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select name="state" value={formData.state} onChange={handleChange} className={inputCls}>
                  <option value="">Select State</option>
                  {indianStates.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input type="number" name="pincode" value={formData.pincode}
                  onChange={handleChange} placeholder="6-digit PIN" maxLength={6} className={inputCls} />
              </div>
            </div>
          </div>

          {/* INTERESTS */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Area of Interest" icon="🎯" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestsList.map((item) => (
                <label key={item}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition text-sm break-words
                    ${formData.interests.includes(item)
                      ? "border-orange-300 bg-orange-50 text-orange-800 font-medium"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"}`}>
                  <input type="checkbox" value={item}
                    checked={formData.interests.includes(item)}
                    onChange={handleCheckbox} className="accent-orange-500 w-4 h-4 shrink-0" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* SKILLS */}
          <div className="px-5 sm:px-8 py-7">
            <SectionDivider title="Skills" icon="⚡" />
            <textarea name="skills" rows="3" value={formData.skills}
              onChange={handleChange}
              placeholder="Describe any relevant skills, languages spoken, or special expertise..."
              className={inputCls} />
          </div>

          {/* SUBMIT */}
          <div className="px-5 sm:px-8 py-6 bg-orange-50 border-t border-orange-100">
            <p className="text-xs text-gray-400 mb-4 text-center">
              Fields marked with <span className="text-orange-500 font-bold">*</span> are required.
            </p>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl transition text-sm tracking-wide shadow-md shadow-orange-200">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting...
                </span>
              ) : "🇮🇳 \u00a0 Submit Application \u00a0 🇮🇳"}
            </button>
          </div>

        </form>
      </div>

      {/* ── VOLUNTEERS TABLE ── */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden mb-10">

        {/* Table Header */}
        <div className="px-5 sm:px-8 py-5 bg-gradient-to-r from-orange-500 to-orange-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Registered Volunteers</h2>
              <p className="text-orange-100 text-xs mt-0.5">
                {volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-white/90 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {tableLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-orange-300">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <p className="text-sm font-medium">Loading volunteers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <div className="text-5xl mb-3">🙁</div>
            <p className="text-sm font-medium text-gray-400">No volunteers found</p>
            {search && (
              <button onClick={() => setSearch("")}
                className="mt-3 text-xs text-orange-400 hover:text-orange-600 underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Desktop Table (md+) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    {["#", "Name", "Gender", "Email", "Mobile", "City", "State", "Occupation", "Interests", "Registered On", "Actions"].map((h) => (
                      <th key={h}
                        className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-orange-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <tr key={v._id}
                      className={`border-b border-gray-50 hover:bg-orange-50/50 transition-colors
                        ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                      <td className="px-4 py-3.5 text-gray-300 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 font-black text-xs flex items-center justify-center shrink-0">
                            {v.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800 whitespace-nowrap">{v.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{v.gender || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-[180px] truncate">{v.email}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{v.mobile}</td>
                      <td className="px-4 py-3.5 text-gray-500">{v.city || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{v.state || "—"}</td>
                      <td className="px-4 py-3.5 text-gray-500">{v.occupation || "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {v.interests?.length > 0
                            ? v.interests.map((int) => (
                                <span key={int}
                                  className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold whitespace-nowrap">
                                  {int}
                                </span>
                              ))
                            : <span className="text-gray-300">—</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(v.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingVolunteer(v)}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold rounded-lg text-xs transition border border-orange-200 whitespace-nowrap"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteVolunteer(v._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition border border-red-100 whitespace-nowrap"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards (< md) ── */}
            <div className="flex flex-col gap-2 p-4 md:hidden">
              {filtered.map((v, i) => (
                <VolunteerCard
                  key={v._id}
                  v={v}
                  i={i}
                  onDelete={deleteVolunteer}
                  onEdit={setEditingVolunteer}
                />
              ))}
            </div>
          </>
        )}

        {/* Table Footer */}
        {!tableLoading && filtered.length > 0 && (
          <div className="px-5 sm:px-8 py-3.5 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing <span className="font-bold text-orange-500">{filtered.length}</span> of{" "}
              <span className="font-bold text-orange-500">{volunteers.length}</span> volunteers
            </span>
            <button onClick={fetchVolunteers}
              className="text-xs text-orange-400 hover:text-orange-600 font-semibold transition flex items-center gap-1">
              ↻ Refresh
            </button>
          </div>
        )}

      </div>

      <p className="text-center text-xs text-gray-300 mt-2 pb-6">Jai Hind 🇮🇳</p>
    </div>
  );
}