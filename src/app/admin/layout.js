import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">

      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 min-w-0 w-full overflow-x-hidden px-0 py-0">
        {children}
      </main>

    </div>
  );
}