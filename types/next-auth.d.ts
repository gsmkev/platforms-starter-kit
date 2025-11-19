import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

import type { TenantAccess } from "@/lib/auth/types";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      tenantAccess: TenantAccess[];
    };
  }

  interface User {
    role: UserRole;
    tenantAccess: TenantAccess[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    tenantAccess?: TenantAccess[];
  }
}
