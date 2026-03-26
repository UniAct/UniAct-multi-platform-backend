
import { Prisma } from "@prisma/client";
import { TransactionRepository } from "../Repositories/TransactionRepository";
import { GetTenantClient } from "../Utils/prismaClient";


export class TransactionService {
  public static async CreateRootAccount(user: Prisma.UserCreateInput, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    return await TransactionRepository.CreateRootAccount(user, prisma);
  }
}
