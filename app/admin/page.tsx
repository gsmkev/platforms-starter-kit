import { auth } from "@/auth";
import { getAllSubdomains } from "@/lib/domain/subdomains";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./dashboard";
import { rootDomain } from "@/lib/config/site";
import { isGlobalAdmin } from "@/lib/auth/permissions";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Manage subdomains for ${rootDomain}`,
};

/**
 * The admin dashboard queries live tenant data, so disable static rendering.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isGlobalAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  const tenants = await getAllSubdomains();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminDashboard tenants={tenants} />
    </div>
  );
}
