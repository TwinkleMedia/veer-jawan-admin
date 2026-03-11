import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">

      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 px-4 sm:px-6 py-6 w-full overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}