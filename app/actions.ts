"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { tenantRepository } from "@/lib/db/tenant-repository";
import { isValidIcon, sanitizeSubdomain } from "@/lib/domain/subdomains";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rootDomain, protocol } from "@/lib/config/site";
import { isGlobalAdmin } from "@/lib/auth/permissions";

const CREATE_ERROR_MESSAGE =
  "We couldn't create the subdomain right now. Please try again.";
const DELETE_ERROR_MESSAGE =
  "We couldn't delete the subdomain right now. Please refresh and retry.";
const UNAUTHORIZED_ERROR_MESSAGE = "You are not authorized to manage tenants.";

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

/**
 * Handle the admin form submission that creates a new tenant row.
 */
export async function createSubdomainAction(
  prevState: Record<string, unknown>,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user || !isGlobalAdmin(session.user.role)) {
    return { success: false, error: UNAUTHORIZED_ERROR_MESSAGE };
  }

  let subdomainInput: string;
  let iconInput: string;

  try {
    subdomainInput = getRequiredString(formData, "subdomain");
    iconInput = getRequiredString(formData, "icon");
  } catch {
    return { success: false, error: "Subdomain and icon are required" };
  }

  if (!isValidIcon(iconInput)) {
    return {
      subdomain: subdomainInput,
      icon: iconInput,
      success: false,
      error: "Please enter a valid emoji (maximum 10 characters)",
    };
  }

  const sanitizedSubdomain = sanitizeSubdomain(subdomainInput);

  if (
    sanitizedSubdomain.length === 0 ||
    sanitizedSubdomain !== subdomainInput
  ) {
    return {
      subdomain: subdomainInput,
      icon: iconInput,
      success: false,
      error:
        "Subdomain can only contain lowercase letters, numbers, and hyphens.",
    };
  }

  try {
    const subdomainAlreadyExists = await tenantRepository.findUnique({
      where: { subdomain: sanitizedSubdomain },
    });

    if (subdomainAlreadyExists) {
      return {
        subdomain: subdomainInput,
        icon: iconInput,
        success: false,
        error: "This subdomain is already taken",
      };
    }

    const tenant = await tenantRepository.create({
      data: {
        subdomain: sanitizedSubdomain,
        emoji: iconInput,
      },
    });

    await db.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });
  } catch (error) {
    console.error("Failed to create subdomain", error);
    return {
      subdomain: subdomainInput,
      icon: iconInput,
      success: false,
      error: CREATE_ERROR_MESSAGE,
    };
  }

  redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
}

/**
 * Server action that deletes a tenant row and revalidates the admin UI.
 */
export async function deleteSubdomainAction(
  prevState: Record<string, unknown>,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user || !isGlobalAdmin(session.user.role)) {
    return { error: UNAUTHORIZED_ERROR_MESSAGE };
  }

  const input = formData.get("subdomain");
  if (typeof input !== "string" || !input.trim()) {
    return { error: "A subdomain is required" };
  }

  const sanitizedSubdomain = sanitizeSubdomain(input);
  if (!sanitizedSubdomain) {
    return { error: "Invalid subdomain" };
  }

  try {
    await tenantRepository.delete({
      where: { subdomain: sanitizedSubdomain },
    });
  } catch (error) {
    console.error("Failed to delete subdomain", error);
    return { error: DELETE_ERROR_MESSAGE };
  }

  revalidatePath("/admin");
  return { success: "Domain deleted successfully" };
}
