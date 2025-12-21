import { Request, Response } from "express";
import { Faculty, Prisma } from "../generated/tenants/alexandria_national_university";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { FacultyService } from "../Services/FacultyService";

export class FacultyController {

    static async CreateFaculty(req: Request, res: Response){
        const FacultyData : Prisma.FacultyCreateInput = req.body;
        try{
            const newFaculty = await FacultyService.CreateFaculty(FacultyData);
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newFaculty,
                message: "Faculty created successfully!",
            });
        }catch (err: any) {
            if (err.message.includes("already exists")) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                status: JSendStatus.FAIL,
                data: { message: err.message },
                });
            }

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: JSendStatus.ERROR,
                message: err.message || "Internal Server Error",
            });
        }        
    }

    static async GetAllFaculties(req: Request, res: Response){
        try{
            const faculties : Faculty[] = await FacultyService.GetAllFaculties();
            res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculties,
        });
        } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: JSendStatus.ERROR,
            message: err.message || "Internal Server Error",
        });
        }
    }

    public static async GetFacultyById(req: Request, res: Response) {
        try {
        const id = parseInt(req.params.id);
        const faculty = await FacultyService.GetFacultyById(id);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: faculty,
        });
        } catch (err: any) {
        res.status(StatusCodes.NOT_FOUND).json({
            status: JSendStatus.FAIL,
            data: { message: err.message },
        });
        }
    }

    public static async DeleteFaculty(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await FacultyService.DeleteFaculty(id);

            res.status(StatusCodes.OK).json({
                status: JSendStatus.SUCCESS,
                data: { message: " Faculty deleted successfully "},
            });
        }catch (err: any) {
            if (err.message.includes("not found")) {
                return res.status(StatusCodes.NOT_FOUND).json({
                status: JSendStatus.FAIL,
                data: { message: err.message },
                });
            }

            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: JSendStatus.ERROR,
                message: err.message || "Internal Server Error",
            });
        }
    }

}