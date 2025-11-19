import { db } from "@/lib/db";
import { createRepository } from "@/lib/repository";

export const tenantRepository = createRepository(db.tenant);
