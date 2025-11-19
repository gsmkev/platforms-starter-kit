import Link from "next/link";

import { auth } from "@/auth";
import { isGlobalAdmin } from "@/lib/auth/permissions";
import { rootDomain } from "@/lib/config/site";

import { SubdomainForm } from "./subdomain-form";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;
  const canManageTenants = isGlobalAdmin(user?.role ?? null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 relative">
      <div className="absolute top-4 right-4">
        {user ? (
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {rootDomain}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Create your own subdomain with a custom emoji
          </p>
        </div>

        <div className="mt-8 bg-white shadow-md rounded-lg p-6 min-h-[220px] flex items-center justify-center">
          {canManageTenants ? (
            <SubdomainForm />
          ) : (
            <div className="space-y-4 text-center text-gray-600">
              <p>You need an admin account to create new tenant subdomains.</p>
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Sign in to continue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
