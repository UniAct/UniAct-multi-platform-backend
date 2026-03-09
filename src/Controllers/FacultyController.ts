import { Request, Response } from "express";
import { Prisma,Faculty } from "../generated/tenants/anu";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { FacultyService } from "../Services/FacultyService";
import { handlePrismaError } from "../Utils/prismaErrorHandler";

export class FacultyController {

    static async CreateFaculty(req: Request, res: Response) {
        const FacultyData: Prisma.FacultyCreateInput = req.body;

            const newFaculty = await FacultyService.CreateFaculty(FacultyData);
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newFaculty,
                message: "Faculty created successfully!",
            });
    }

    static async GetAllFaculties(req: Request, res: Response) {
        const faculties: Faculty[] = await FacultyService.GetAllFaculties();
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculties,
        });
    }

    public static async GetFacultyById(req: Request, res: Response) {

        const id = parseInt(req.params.id);
        const faculty = await FacultyService.GetFacultyById(id);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculty,
        });
    
    }

    public static async DeleteFaculty(req: Request, res: Response) {
            const id = parseInt(req.params.id);
            await FacultyService.DeleteFaculty(id);

            res.status(StatusCodes.OK).json({
                status: JSendStatus.SUCCESS,
                data: { message: " Faculty deleted successfully " },
            });
    }

}