import type { Tenant } from "@prisma/client";

import { tenantRepository } from "@/lib/db/tenant-repository";

import { sanitizeSubdomain } from "./validators";

export type TenantSummary = {
  subdomain: string;
  emoji: string;
  createdAt: number;
};

function mapTenantToSummary(tenant: Tenant): TenantSummary {
  return {
    subdomain: tenant.subdomain,
    emoji: tenant.emoji,
    createdAt: tenant.createdAt.getTime(),
  };
}

export async function getSubdomainData(
  subdomain: string
): Promise<TenantSummary | null> {
  const sanitizedSubdomain = sanitizeSubdomain(subdomain);
  const tenant = await tenantRepository.findUnique({
    where: { subdomain: sanitizedSubdomain },
  });

  if (!tenant) {
    return null;
  }

  return mapTenantToSummary(tenant);
}

export async function getAllSubdomains() {
  const tenants = await tenantRepository.findMany({
    orderBy: { createdAt: "desc" },
  });

  return tenants.map(mapTenantToSummary);
}
