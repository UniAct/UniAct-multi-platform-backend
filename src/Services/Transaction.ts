
import { Prisma } from "@prisma/client";
import { TransactionRepository } from "../Repositories/TransactionRepository";
import { getTenantClient } from "../Utils/prismaClient";


export class TransactionService {
  public static async CreateRootAccount(user : Prisma.UserCreateInput , schema_name : string){
    
    const prisma = getTenantClient(schema_name)
    return await TransactionRepository.CreateRootAccount(user , prisma);
  }   
}