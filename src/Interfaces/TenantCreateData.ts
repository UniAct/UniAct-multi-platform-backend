import { Prisma, Tenant } from "../generated/public";

export interface TenantCreateData extends Prisma.TenantCreateInput {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}
