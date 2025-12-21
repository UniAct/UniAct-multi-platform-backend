import { Request, Response } from "express";
import { Prisma, Program } from "../generated/tenants/alexandria_national_university";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { programService } from "../Services/ProgramService";
import { handlePrismaError } from "../Utils/prismaErrorHandler";

export default class ProgramController {

    static async CreateProgram(req: Request, res: Response) {
        const programData: Prisma.ProgramCreateInput = req.body;
        try {
            const newProgram = await programService.CreateProgram(programData);
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newProgram,
                message: "Program created successfully!",
            });
        } catch (err: any) {
            return handlePrismaError(err, res);
        }
    }

    static async GetAllPrograms(req: Request, res: Response) {
        try {
            const programs: Program[] = await programService.GetAllPrograms();

            res.status(StatusCodes.OK).json({
                status: JSendStatus.SUCCESS,
                data: programs,
            });
        }
        catch (err: any) {
            return handlePrismaError(err, res);
        }

    }

    static async Delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await programService.DeleteProgramById(id);
            res.status(StatusCodes.OK).json({
                status: JSendStatus.SUCCESS,
                data: { message: "Program deleted successfully" },
            });
        } catch (err: any) {
            return handlePrismaError(err, res);
        }
    }
}