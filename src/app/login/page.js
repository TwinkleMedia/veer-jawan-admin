"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import bgimage from "./adminbackground.jpg";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleLogin = async () => {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.message || "Invalid credentials. Please try again.");
    }

  } catch (error) {
    setError("Server error. Please try again later.");
  }

  setLoading(false);
};
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden ">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center "
        style={{
        backgroundImage: `url(${bgimage.src})`,
          filter: "brightness(0.3) saturate(1.3)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Purple glow blob */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 sm:mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 sm:p-10">

        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-purple-700/40 mb-4">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4zm0 4a3 3 0 110 6 3 3 0 010-6zm0 13c-2.67 0-5-1.34-6-3.34.03-2 4-3.09 6-3.09 1.99 0 5.97 1.09 6 3.09-1 2-3.33 3.34-6 3.34z" />
            </svg>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-white">Admin Portal</h1>
          <p className="text-xs uppercase tracking-widest text-white/35 mt-1">Secure Access Only</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-7" />

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-medium uppercase tracking-widest text-white/40 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-light placeholder-white/20 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-xs font-medium uppercase tracking-widest text-white/40 mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-light placeholder-white/20 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-400 text-center mb-4 animate-pulse">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-medium uppercase tracking-widest shadow-lg shadow-purple-700/40 hover:shadow-purple-600/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Authenticating…" : "Sign In"}
        </button>

      
      </div>
    </div>
  );
}