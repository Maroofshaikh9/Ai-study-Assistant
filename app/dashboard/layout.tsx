import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import StudentSidebar from "@/components/StudentSidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen lg:flex bg-[#f8fafc] text-slate-900 selection:bg-brand-500 selection:text-white print:bg-white print:block">
      <div className="print:hidden shrink-0">
        <StudentSidebar name={session.user.name} />
      </div>
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden print:overflow-visible print:p-0 print:m-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
