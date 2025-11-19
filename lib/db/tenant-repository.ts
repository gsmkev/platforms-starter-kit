import { db } from "@/lib/db/client";
import { createRepository } from "@/lib/db/repository";

export const tenantRepository = createRepository(db.tenant);
