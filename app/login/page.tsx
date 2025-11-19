import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { rootDomain } from "@/lib/config/site";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: `Sign in | ${rootDomain}`,
  description: "Authenticate to manage your tenants.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl;
  const session = await auth();

  if (session?.user) {
    redirect(callbackUrl ?? "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white rounded-lg shadow p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-500">
            Use your platform credentials to access the dashboard.
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />

        <div className="text-center text-sm text-gray-500">
          <span>Need access?</span>{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
