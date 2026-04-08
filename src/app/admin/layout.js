import AdminSidebar from "@/app/components/AdminSidebar"; // adjust path as needed

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* lg:ml-64 matches the sidebar w-64 on desktop */}
      <main className="lg:ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}