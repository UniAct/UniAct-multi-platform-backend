import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassroomService } from "../../../src/Services/ClassroomService";
import { ClassroomRepository } from "../../../src/Repositories/ClassroomRepository";
import { NotFoundError } from "../../../src/Types/Errors";

vi.mock("../../../src/Repositories/ClassroomRepository", () => ({
  ClassroomRepository: {
    WithTransaction: vi.fn(),
    CreateClassroom: vi.fn(),
    GetAllClassroomsBySchema: vi.fn(),
    GetClassroomByIdFromSchema: vi.fn(),
    GetClassroomById: vi.fn(),
    UpdateClassroom: vi.fn(),
    DeleteClassroom: vi.fn(),
  },
}));

describe("ClassroomService", () => {
  const schema = "tenant_test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates classroom with default isAvailable=true", async () => {
    (ClassroomRepository.WithTransaction as any).mockImplementation(async (_schema: string, operation: any) => {
      return operation({});
    });

    (ClassroomRepository.CreateClassroom as any).mockResolvedValue({
      id: 1,
      roomNumber: "A101",
      building: "Main",
      capacity: 40,
      type: "Lecture",
      isAvailable: true,
      classSessions: [],
    });

    const result = await ClassroomService.CreateClassroom(
      {
        roomNumber: "A101",
        building: "Main",
        capacity: 40,
        type: "Lecture",
      },
      schema,
    );

    expect(ClassroomRepository.WithTransaction).toHaveBeenCalledWith(schema, expect.any(Function));
    expect(ClassroomRepository.CreateClassroom).toHaveBeenCalledWith(
      expect.objectContaining({
        roomNumber: "A101",
        building: "Main",
        capacity: 40,
        type: "Lecture",
        isAvailable: true,
      }),
      expect.anything(),
    );
    expect(result).toHaveProperty("id", 1);
  });

  it("gets all classrooms by schema", async () => {
    (ClassroomRepository.GetAllClassroomsBySchema as any).mockResolvedValue([{ id: 11 }, { id: 12 }]);

    const result = await ClassroomService.GetAllClassrooms(schema);

    expect(ClassroomRepository.GetAllClassroomsBySchema).toHaveBeenCalledWith(schema);
    expect(result).toHaveLength(2);
  });

  it("throws NotFoundError when classroom by id does not exist", async () => {
    (ClassroomRepository.GetClassroomByIdFromSchema as any).mockResolvedValue(null);

    await expect(ClassroomService.GetClassroomById(999, schema)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates classroom when it exists", async () => {
    (ClassroomRepository.WithTransaction as any).mockImplementation(async (_schema: string, operation: any) => {
      return operation({});
    });

    (ClassroomRepository.GetClassroomById as any).mockResolvedValue({ id: 7 });
    (ClassroomRepository.UpdateClassroom as any).mockResolvedValue({ id: 7, roomNumber: "B201" });

    const result = await ClassroomService.UpdateClassroom(
      7,
      {
        roomNumber: "B201",
        building: "Science",
        capacity: 60,
        type: "Lab",
        isAvailable: false,
      },
      schema,
    );

    expect(ClassroomRepository.UpdateClassroom).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ roomNumber: "B201", isAvailable: false }),
      expect.anything(),
    );
    expect(result).toHaveProperty("id", 7);
  });

  it("throws NotFoundError when updating missing classroom", async () => {
    (ClassroomRepository.WithTransaction as any).mockImplementation(async (_schema: string, operation: any) => {
      return operation({});
    });

    (ClassroomRepository.GetClassroomById as any).mockResolvedValue(null);

    await expect(
      ClassroomService.UpdateClassroom(
        404,
        {
          roomNumber: "X1",
          building: "Nowhere",
          capacity: 10,
          type: "Other",
        },
        schema,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(ClassroomRepository.UpdateClassroom).not.toHaveBeenCalled();
  });

  it("deletes classroom when it exists", async () => {
    (ClassroomRepository.WithTransaction as any).mockImplementation(async (_schema: string, operation: any) => {
      return operation({});
    });

    (ClassroomRepository.GetClassroomById as any).mockResolvedValue({ id: 3 });
    (ClassroomRepository.DeleteClassroom as any).mockResolvedValue({ id: 3 });

    await ClassroomService.DeleteClassroom(3, schema);

    expect(ClassroomRepository.DeleteClassroom).toHaveBeenCalledWith(3, expect.anything());
  });
});
