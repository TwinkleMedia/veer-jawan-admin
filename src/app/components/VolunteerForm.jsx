"use client";

import { useState } from "react";

const inputCls =
  "w-full bg-white border border-orange-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-sm shadow-sm";

const labelCls =
  "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

const sectionTitleCls =
  "text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-5 flex items-center gap-2";

function SectionDivider({ title, icon }) {
  return (
    <div className={sectionTitleCls}>
      <span>{icon}</span>
      <span>{title}</span>
      <span className="flex-1 h-px bg-orange-100 ml-1" />
    </div>
  );
}

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    interests: [],
    skills: "",
    availability: "",
    location: "",
    occupation: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const interestsList = [
    "Event Management",
    "Fundraising",
    "Social Media Promotion",
    "Field Work",
    "Administrative Support",
    "Awareness Campaign",
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
    try {
      const res = await fetch("http://localhost:5000/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({
          fullName: "", dob: "", gender: "", email: "", mobile: "",
          alternateMobile: "", address1: "", address2: "", city: "",
          state: "", pincode: "", interests: [], skills: "",
          availability: "", location: "", occupation: "",
        });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error. Please try again later.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🇮🇳</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Jai Hind!</h2>
          <p className="text-gray-500 mb-6 text-sm">Your volunteer application has been submitted successfully. Thank you for stepping forward to serve the nation.</p>
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
    <div className="min-h-screen bg-orange-50/60 py-8 px-4 sm:py-10">

      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-8 px-2">
        <div className="text-3xl mb-2">🇮🇳</div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight leading-tight">
          Volunteer Registration
        </h1>
        <p className="text-gray-400 text-sm mt-1.5">
          Join hands to serve the nation and support those who protect it.
        </p>
        {/* Tricolor bar */}
        <div className="flex h-1 rounded-full overflow-hidden mt-4 max-w-xs mx-auto">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-white border-y border-gray-200" />
          <div className="flex-1 bg-green-600" />
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── PERSONAL INFO ── */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Personal Info" icon="👤" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Gender</label>
              <div className="flex flex-wrap gap-4 mt-1">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="accent-orange-500"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Teacher, Engineer, Student"
                className={inputCls}
              />
            </div>
          </div>

          {/* ── CONTACT ── */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Contact Details" icon="📞" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Mobile *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Alternate Mobile</label>
              <input
                type="tel"
                name="alternateMobile"
                value={formData.alternateMobile}
                onChange={handleChange}
                placeholder="Optional"
                className={inputCls}
              />
            </div>
          </div>

          {/* ── ADDRESS ── */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Address" icon="📍" />

            <div className="mb-4">
              <label className={labelCls}>Address Line 1</label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                placeholder="House / Flat No., Street"
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label className={labelCls}>Address Line 2</label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                placeholder="Landmark, Area (optional)"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Select State</option>
                  {indianStates.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input
                  type="number"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── INTERESTS ── */}
          <div className="px-5 sm:px-8 py-7 border-b border-orange-50">
            <SectionDivider title="Area of Interest" icon="🎯" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestsList.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition text-sm
                    ${formData.interests.includes(item)
                      ? "border-orange-300 bg-orange-50 text-orange-800 font-medium"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"
                    }`}
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.interests.includes(item)}
                    onChange={handleCheckbox}
                    className="accent-orange-500 w-4 h-4 shrink-0"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* ── SKILLS ── */}
          <div className="px-5 sm:px-8 py-7">
            <SectionDivider title="Skills" icon="⚡" />

            <textarea
              name="skills"
              rows="3"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Describe any relevant skills, languages spoken, or special expertise..."
              className={inputCls}
            />
          </div>

          {/* ── SUBMIT ── */}
          <div className="px-5 sm:px-8 py-6 bg-orange-50 border-t border-orange-100">
            <p className="text-xs text-gray-400 mb-4 text-center">
              Fields marked with <span className="text-orange-500 font-bold">*</span> are required.
            </p>
            <button
              type="submit"
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black rounded-xl transition text-sm tracking-wide shadow-md shadow-orange-200"
            >
              🇮🇳 &nbsp; Submit Application &nbsp; 🇮🇳
            </button>
          </div>

        </form>
      </div>

      <p className="text-center text-xs text-gray-300 mt-6 pb-4">Jai Hind 🇮🇳</p>
    </div>
  );
}