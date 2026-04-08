"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Upload Banner",
    href: "/admin/upload-banner",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <polyline points="8 12 12 8 16 12" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    ),
  },

  {
    name: "Membership Management",
    href: "/admin/volunteers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="9" cy="7" r="4"/>
        <path d="M17 11l2 2 4-4"/>
        <path d="M3 21a6 6 0 0112 0"/>
      </svg>
    ),
  },

  {
    name: "Donation Management",
    href: "/admin/membershipPages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M12 1v22"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },

  {
    name: "Donation Certificate",
    href: "/admin/certificates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M8 8h8M8 12h6M8 16h4"/>
      </svg>
    ),
  },

  {
    name: "Veer Nari / Parent Membership",
    href: "/admin/veernaripage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="12" cy="7" r="4"/>
        <path d="M5.5 21a6.5 6.5 0 0113 0"/>
      </svg>
    ),
  },

  {
    name: "Gallery",
    href: "/admin/gallery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },

  {
    name: "Event Management",
    href: "/admin/eventManagement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M21 15a4 4 0 01-4 4H7l-4 4V5a4 4 0 014-4h10a4 4 0 014 4z"/>
      </svg>
    ),
  },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SidebarInner({ pathname, onLinkClick, handleLogout }) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-950 via-stone-950 to-red-950 relative overflow-hidden">

      {/* Top tricolor strip */}
      <div className="absolute top-0 left-0 right-0 flex h-1 z-10">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white opacity-80" />
        <div className="flex-1 bg-green-700" />
      </div>

      {/* Subtle glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-800 opacity-15 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-5 border-b border-orange-500 border-opacity-20">
        <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-700" />
          </div>
          <span className="relative text-blue-900 font-black text-xs z-10">✦</span>
        </div>
        <div>
          <p className="text-orange-100 font-bold text-base tracking-wide leading-none">व्यवस्थापक</p>
          <p className="text-orange-400 text-opacity-70 text-xs tracking-widest uppercase mt-0.5 font-semibold">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-orange-500 text-opacity-40 text-xs font-bold tracking-widest uppercase px-3 pb-2">Navigation</p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group border";
          const activeClass = "bg-orange-500 bg-opacity-25 text-orange-200 border-orange-500 border-opacity-30 shadow-inner";
          const inactiveClass = "text-orange-200 text-opacity-60 hover:text-orange-100 hover:bg-orange-500 hover:bg-opacity-10 border-transparent";

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={baseClass + " " + (isActive ? activeClass : inactiveClass)}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-gradient-to-b from-orange-400 to-red-600" />
              )}
              <span className={isActive ? "text-orange-400" : "text-orange-500 text-opacity-50 group-hover:text-orange-400 transition-colors"}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="relative z-10 p-4 border-t border-orange-500 border-opacity-20 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-15">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
            A
          </div>
          <div className="min-w-0">
            <p className="text-orange-100 text-xs font-semibold truncate">Admin User</p>
            <p className="text-orange-500 text-opacity-55 text-xs uppercase tracking-wider">Super Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-900 bg-opacity-40 border border-red-700 border-opacity-40 hover:border-red-500 text-red-300 hover:text-red-100 text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-px active:translate-y-0"
        >
          <LogoutIcon />
          Logout
        </button>

        <p className="text-center text-orange-500 text-opacity-20 text-xs tracking-widest font-bold">✦ ॐ ✦ ॐ ✦ ॐ ✦</p>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  const mobileAsideClass = "lg:hidden fixed left-0 top-0 z-50 h-screen w-72 shadow-2xl transition-transform duration-300 ease-in-out " + (mobileOpen ? "translate-x-0" : "-translate-x-full");

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm"
        />
      )}

      {/* Mobile sidebar */}
      <aside className={mobileAsideClass}>
        <SidebarInner
          pathname={pathname}
          onLinkClick={() => setMobileOpen(false)}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 shadow-2xl">
        <SidebarInner pathname={pathname} handleLogout={handleLogout} />
      </aside>
    </>
  );
}