import { Request, Response } from "express";
import { Prisma,Faculty } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { FacultyService } from "../Services/FacultyService";

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
        const faculties: Faculty[] = await FacultyService.GetAllFaculties(req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculties,
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
