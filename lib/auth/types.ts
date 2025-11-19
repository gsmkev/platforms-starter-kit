import type { TenantRole } from "@prisma/client";

export type TenantAccess = {
  tenantId: string;
  tenantSubdomain: string;
  role: TenantRole;
};
