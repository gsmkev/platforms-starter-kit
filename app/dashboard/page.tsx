import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isGlobalAdmin } from "@/lib/auth/permissions";
import { protocol, rootDomain } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `Dashboard | ${rootDomain}`,
  description: "View tenant memberships and shortcuts.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { user } = session;
  const tenantAccess = user.tenantAccess;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
        </header>

        {isGlobalAdmin(user.role) && (
          <Card>
            <CardHeader>
              <CardTitle>Platform administration</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Manage tenants
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {tenantAccess.length === 0 ? (
              <p className="text-sm text-gray-500">
                You have not been added to any tenants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {tenantAccess.map((membership) => (
                  <div
                    key={membership.tenantId}
                    className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {membership.tenantSubdomain}
                      </p>
                      <p className="text-xs text-gray-500">
                        Role: {membership.role.toLowerCase()}
                      </p>
                    </div>
                    <Link
                      href={`${protocol}://${membership.tenantSubdomain}.${rootDomain}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Open site
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
