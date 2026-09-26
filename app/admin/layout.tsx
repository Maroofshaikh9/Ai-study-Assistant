import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen lg:flex bg-[#f8fafc]">
      {session?.user?.role === "admin" ? (
        <>
          <AdminSidebar name={session.user.name} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl w-full mx-auto">
            {children}
          </main>
        </>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6">{children}</main>
      )}
    </div>
  );
}
