"use client";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { useUser } from "@/contexts/UserContext";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { userRole} = useUser();
    if (userRole !== "admin") {
      return <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
      </div>;
    }
  return (
    
    <div className="flex min-h-screen bg-[#eefdff]">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
