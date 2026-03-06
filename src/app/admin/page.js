export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Banners",
      value: "24",
      change: "+3 this week",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <polyline points="8 12 12 8 16 12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      ),
      accent: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
      badgeColor: "bg-orange-100 text-orange-600",
    },
    {
      label: "Products",
      value: "142",
      change: "+12 this month",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
      accent: "from-green-600 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      textColor: "text-green-700",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      label: "Visitors",
      value: "8,310",
      change: "+5.2% today",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      accent: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      badgeColor: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-orange-400 text-xl">❁</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-800 font-serif tracking-tight">
            Dashboard
          </h1>
        </div>
        <p className="text-amber-600 text-sm pl-9 tracking-wide">
          Welcome back, Admin · <span className="font-semibold">नमस्ते 🙏</span>
        </p>
        {/* Tricolor divider */}
        <div className="flex mt-3 ml-9 gap-0 w-24 h-1 rounded-full overflow-hidden">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-white border-y border-gray-200" />
          <div className="flex-1 bg-green-600" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative rounded-2xl border ${stat.border} ${stat.bg} p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group`}
          >
            {/* Top gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`} />

            {/* Corner ornament */}
            <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${stat.border} rounded-tr-lg opacity-40`} />
            <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${stat.border} rounded-bl-lg opacity-40`} />

            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${stat.textColor} opacity-70 mb-2`}>
                  {stat.label}
                </p>
                <p className={`text-4xl font-extrabold ${stat.textColor} leading-none mb-3`}>
                  {stat.value}
                </p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${stat.badgeColor}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {stat.change}
                </span>
              </div>

              <div className={`${stat.iconBg} ${stat.iconColor} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-orange-200" />
          <span className="text-orange-400 text-xs font-bold tracking-widest uppercase">Quick Actions</span>
          <div className="h-px flex-1 bg-orange-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Upload Banner CTA */}
          <a
            href="/admin/upload-banner"
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-orange-300/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <polyline points="8 12 12 8 16 12" />
                <line x1="12" y1="8" x2="12" y2="16" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">Upload New Banner</p>
              <p className="text-orange-100 text-xs mt-0.5">Add a banner to the homepage</p>
            </div>
            <svg className="ml-auto w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Manage Products CTA */}
          <a
            href="/admin/products"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-orange-200 text-orange-800 shadow-sm hover:shadow-md hover:border-orange-400 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">Manage Products</p>
              <p className="text-amber-600 text-xs mt-0.5">View and edit your catalogue</p>
            </div>
            <svg className="ml-auto w-5 h-5 opacity-30 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer decoration */}
      <div className="flex justify-center mt-10 gap-1">
        <div className="w-6 h-1 rounded-full bg-orange-400" />
        <div className="w-6 h-1 rounded-full bg-white border border-gray-200" />
        <div className="w-6 h-1 rounded-full bg-green-600" />
      </div>
      <p className="text-center text-amber-400 text-xs mt-2 tracking-widest">✦ ॐ ✦ ॐ ✦</p>

    </div>
  );
}