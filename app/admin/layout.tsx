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
    <div className="min-h-screen lg:flex bg-[#f4f7f6]">
      {session?.user?.role === "admin" ? (
        <>
          <AdminSidebar name={session.user.name} />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
        </>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
}
