import { Request, Response } from "express";
import { Prisma, Semester } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { SemesterService } from "../Services/SemesterService";
import { CreateSemesterRequest , UpdateSemesterRequest } from "../Interfaces/Semester";

export class SemesterController {

    static async CreateSemester(req: Request, res: Response) {
        const semesterData: CreateSemesterRequest = req.body as CreateSemesterRequest;

        const newSemester = await SemesterService.CreateSemester(semesterData, req.schema_name!);

        res.status(StatusCodes.CREATED).json({
            status: JSendStatus.SUCCESS,
            data: newSemester,
            message: "Semester created successfully!",
        });
    }

    static async GetAllSemesters(req: Request, res: Response) {
        const semesters: Semester[] = await SemesterService.GetAllSemesters(req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: semesters,
        });
    }

    public static async GetSemesterById(req: Request, res: Response) {
        const id = parseInt(req.params.id as string);
        const semester = await SemesterService.GetSemesterById(id, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: semester,
        });
    }

    public static async GetCurrentSemester(req: Request, res: Response) {
        const semester = await SemesterService.GetCurrentSemester(req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: semester,
        });
    }

    static async UpdateSemester(req: Request, res: Response) {
        const id = parseInt(req.params.id as string);
        const semesterData : UpdateSemesterRequest = req.body as UpdateSemesterRequest;
        const updatedSemester = await SemesterService.UpdateSemester(id, semesterData, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: updatedSemester,
            message: "Semester updated successfully!",
        });
    }

    public static async DeleteSemester(req: Request, res: Response) {
        const id = parseInt(req.params.id as string);

        await SemesterService.DeleteSemester(id, req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: { message: "Semester deleted successfully" },
        });
    }
}