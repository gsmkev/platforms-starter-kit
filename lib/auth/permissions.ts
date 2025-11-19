import type { TenantRole, UserRole } from "@prisma/client";

import type { TenantAccess } from "./types";

const tenantRolePriority: Record<TenantRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export function isGlobalAdmin(role?: UserRole | null) {
  return role === "ADMIN";
}

export function findTenantMembership(
  access: TenantAccess[] | undefined,
  subdomain: string | null
) {
  if (!access || !subdomain) {
    return null;
  }

  return (
    access.find(
      (membership) =>
        membership.tenantSubdomain.toLowerCase() === subdomain.toLowerCase()
    ) ?? null
  );
}

export function hasTenantRole(
  membership: TenantAccess | null,
  minimumRole: TenantRole = "MEMBER"
) {
  if (!membership) {
    return false;
  }

  return tenantRolePriority[membership.role] >= tenantRolePriority[minimumRole];
}
