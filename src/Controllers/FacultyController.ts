import { Request, Response } from "express";
import { Prisma,Faculty } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { FacultyService } from "../Services/FacultyService";
import { GetTenantClient } from "../Utils/prismaClient";

export class FacultyController {

    static async CreateFaculty(req: Request, res: Response) {
        const FacultyData: Prisma.FacultyCreateInput = req.body;

            const newFaculty = await FacultyService.CreateFaculty(FacultyData,req.schema_name!);
            
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newFaculty,
                message: "Faculty created successfully!",
            });
    }

    static async GetAllFaculties(req: Request, res: Response) {
        const faculties: Partial<Faculty>[] = await FacultyService.GetAllFaculties(req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculties,
        });
    }

    static async GetPublicFaculties(req: Request, res: Response) {
        const schema = String(req.params.schema || "").trim().toLowerCase();
        const prisma = GetTenantClient(schema);

        const faculties = await prisma.faculty.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                programs: {
                    select: {
                        name: true,
                        durationYears: true,
                        _count: {
                            select: { students: true },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        const data = faculties.map((faculty) => ({
            id: faculty.id,
            name: faculty.name,
            description: faculty.description,
            programs: faculty.programs.map((program) => program.name),
            students: faculty.programs.reduce((sum, program) => sum + program._count.students, 0),
            years: faculty.programs[0]?.durationYears ?? 4,
        }));

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data,
        });
    }

    public static async GetFacultyById(req: Request, res: Response) {

        const id = parseInt(req.params.id as string);
        const faculty = await FacultyService.GetFacultyById(id, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculty,
        });
    }

    public static async GetProgramsByFacultyID(req: Request, res: Response){
        const facultyId = parseInt(req.params.id as string);

        const programs = await FacultyService.GetProgramsByFacultyId(facultyId, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: programs
        })
    }

    static async UpdateFaculty(req: Request, res: Response) {
        const id = parseInt(req.params.id as string);
        const FacultyData: Prisma.FacultyUpdateInput = req.body;
        const updatedFaculty = await FacultyService.UpdateFaculty(id, FacultyData, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: updatedFaculty,
            message: "Faculty updated successfully!",
        });
    }

    public static async DeleteFaculty(req: Request, res: Response) {
            const id = parseInt(req.params.id as string );

            await FacultyService.DeleteFaculty(id, req.schema_name!);

            res.status(StatusCodes.OK).json({
                status: JSendStatus.SUCCESS,
                data: { message: " Faculty deleted successfully " },
            });
    }

}
