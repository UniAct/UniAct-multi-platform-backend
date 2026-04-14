import { Prisma, PrismaClient } from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class ClassroomRepository {
  // Keep response shape consistent across create/read/update so frontend does not branch by endpoint.
  private static readonly classroomDetailsInclude = {
    scheduleSlot: true,
  } as const;

  private static getClient(schema_name: string): PrismaClient {
    return GetTenantClient(schema_name);
  }

  public static async WithTransaction<T>(schema_name: string, operation: (tx: Prisma.TransactionClient) => Promise<T>) {
    const prisma = this.getClient(schema_name);
    return prisma.$transaction(operation);
  }

  public static async GetAllClassroomsBySchema(schema_name: string) {
    const prisma = this.getClient(schema_name);
    return this.GetAllClassrooms(prisma);
  }

  public static async GetClassroomByIdFromSchema(id: number, schema_name: string) {
    const prisma = this.getClient(schema_name);
    return this.GetClassroomById(id, prisma);
  }

  public static async CreateClassroom(data: Prisma.ClassroomCreateInput, prisma: DbClient) {
    return prisma.classroom.create({
      data,
      include: this.classroomDetailsInclude,
    });
  }

  public static async GetAllClassrooms(prisma: DbClient) {
    return prisma.classroom.findMany({
      include: this.classroomDetailsInclude,
      orderBy: [{ building: "asc" }, { classroomNumber: "asc" }],
    });
  }

  public static async GetClassroomById(id: number, prisma: DbClient) {
    return prisma.classroom.findUnique({
      where: { id },
      include: this.classroomDetailsInclude,
    });
  }

  public static async UpdateClassroom(id: number, data: Prisma.ClassroomUpdateInput, prisma: DbClient) {
    return prisma.classroom.update({
      where: { id },
      data,
      include: this.classroomDetailsInclude,
    });
  }

  public static async DeleteClassroom(id: number, prisma: DbClient) {
    return prisma.classroom.delete({
      where: { id },
    });
  }
}
