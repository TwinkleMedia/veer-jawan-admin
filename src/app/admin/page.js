"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {

  const [statsData, setStatsData] = useState({
    volunteers: 0,
    donations: 0,
    certificates: 0,
    members: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetch("")
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data.stats);
        setRecentActivities(data.activities);
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  const stats = [
    {
      label: "Total Volunteers",
      value: statsData.volunteers,
      change: "Active volunteers",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
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
      label: "Total Donations",
      value: statsData.donations,
      change: "Donations received",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6" />
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
      label: "Certificates Generated",
      value: statsData.certificates,
      change: "Certificates issued",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 8h8M8 12h6M8 16h4" />
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
    {
      label: "Total Members",
      value: statsData.members,
      change: "Registered members",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0113 0" />
        </svg>
      ),
      accent: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      badgeColor: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-800">Dashboard</h1>
        <p className="text-amber-600 text-sm">
          Welcome back Admin 🙏
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border ${stat.border} ${stat.bg} p-6 shadow-sm`}
          >
            <div className="flex justify-between items-start">

              <div>
                <p className={`text-xs font-semibold ${stat.textColor} uppercase`}>
                  {stat.label}
                </p>

                <p className={`text-4xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>

                <span className={`text-xs px-2 py-1 rounded ${stat.badgeColor}`}>
                  {stat.change}
                </span>
              </div>

              <div className={`${stat.iconBg} ${stat.iconColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="mt-10 bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Recent Activities
        </h2>

        <ul className="space-y-3">
          {recentActivities.map((activity, index) => (
            <li
              key={index}
              className="flex justify-between text-sm border-b pb-2"
            >
              <span>{activity.message}</span>
              <span className="text-gray-400">{activity.time}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}