import { Request, Response } from "express";
import { Program } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ProgramUpsertInput } from "../Interfaces/AcademicProgram";
import { programService } from "../Services/ProgramService";

export default class ProgramController {

    static async CreateProgram(req: Request, res: Response) {
        const programData = req.body as ProgramUpsertInput;

            const newProgram = await programService.CreateProgram(programData,req.schema_name!);
            res.status(StatusCodes.CREATED).json({
                status: JSendStatus.SUCCESS,
                data: newProgram,
                message: "Program created successfully!",
            });
    }

    static async GetAllPrograms(req: Request, res: Response) {
        
        const programs: Program[] = await programService.GetAllPrograms(req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: programs,
        });
    }

    static async GetProgramById(req:Request, res: Response){
        const id = parseInt(req.params.id as string);
    
        const program = await programService.GetProgramById(id, req.schema_name!);
        res.status(StatusCodes.OK).json({
            status:JSendStatus.SUCCESS,
            data: program
        });
    }

    static async UpdateProgram(req: Request, res: Response){
        const id = parseInt(req.params.id as string);
        const programData = req.body as ProgramUpsertInput;

        const updatedProgram = await programService.UpdateProgram(id, programData, req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: updatedProgram,
            message: "Program updated successfully!",
        });
    }

    static async Delete(req: Request, res: Response) {
        
        const id = parseInt(req.params.id as string);

        await programService.DeleteProgramById(id,req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: { message: "Program deleted successfully" },
        });
    }
}
