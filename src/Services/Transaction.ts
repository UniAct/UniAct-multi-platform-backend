import { User } from "../generated/tenants/alexandria_national_university";
import { TransactionRepository } from "../Repositories/TransactionRepository";
import { SchemaManager } from "../Utils/SchemaManager";

export class TransactionService {
  public static async CreateRootAccount(user : Partial<User> , schema_name : string) : Promise<User>{
    return await TransactionRepository.CreateRootAccount(user , schema_name);
  }   
}