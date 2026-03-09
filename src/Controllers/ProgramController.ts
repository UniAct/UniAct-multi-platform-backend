import { Request, Response } from "express";
import { Prisma,Program } from "../generated/tenants/anu";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { programService } from "../Services/ProgramService";
import { handlePrismaError } from "../Utils/prismaErrorHandler";

export default class ProgramController {

    static async CreateProgram(req: Request, res: Response) {
        const programData: Prisma.ProgramCreateInput = req.body;

            const newProgram = await programService.CreateProgram(programData);
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newProgram,
                message: "Program created successfully!",
            });
    }

    static async GetAllPrograms(req: Request, res: Response) {
        
        const programs: Program[] = await programService.GetAllPrograms();

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: programs,
        });
    }

    static async GetProgramById(req:Request, res: Response){
        const id = parseInt(req.params.id);
    
        const program = await programService.GetProgramById(id);
        res.status(StatusCodes.OK).json({
            status:JSendStatus.SUCCESS,
            data: program
        });
    }

    static async Delete(req: Request, res: Response) {
        
        const id = parseInt(req.params.id);

        await programService.DeleteProgramById(id);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: { message: "Program deleted successfully" },
        });
    }
}