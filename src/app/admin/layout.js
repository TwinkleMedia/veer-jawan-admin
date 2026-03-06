import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-amber-50 min-h-screen">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content — offset by sidebar width on desktop, full width on mobile */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>

    </div>
  );
}