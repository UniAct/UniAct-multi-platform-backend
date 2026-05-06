import { Request, Response } from "express";
import { Program } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ProgramUpsertInput } from "../Interfaces/AcademicProgram";
import { BadRequestError } from "../Types/Errors";
import { ProgramService } from "../Services/ProgramService";
import { CreateProgramRequestDto } from "../Interfaces/Program/Create/CreateProgramSchema";

export default class ProgramController {

    static async Create(req: Request, res: Response) {
        const programData = req.body as CreateProgramRequestDto;

        const newProgram = await ProgramService.Create(programData, req.schema_name!);
        res.status(StatusCodes.CREATED).json({
            status: JSendStatus.SUCCESS,
            data: newProgram,
            message: "Program created successfully!",
        });
    }

    static async GetAllPrograms(req: Request, res: Response) {
        
        const programs: Partial<Program> [] = await ProgramService.GetAllPrograms(req.schema_name!);

        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: programs,
        });
    }

    static async GetProgramById(req:Request, res: Response){
        const id = parseInt(req.params.id as string);
    
        const program = await ProgramService.GetProgramById(id, req.schema_name!);
        res.status(StatusCodes.OK).json({
            status:JSendStatus.SUCCESS,
            data: program
        });
    }

    static async GetProgramsByFacultyId(req: Request, res: Response) {
        const facultyId = parseInt(req.params.facultyId as string);
        if(!facultyId)
            throw new BadRequestError("Faculty Id param is missing");
        const programs: Partial<Program> [] = await ProgramService.GetProgramsByFacultyId(facultyId,req.schema_name!);

        return res.status(200).json({
            data:programs,
            message: "programs fetched successfully"
        })
    }

    static async UpdateProgram(req: Request, res: Response){
        const id = parseInt(req.params.id as string);
        const programData = req.body as ProgramUpsertInput;

        const updatedProgram = await ProgramService.UpdateProgram(id, programData, req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            // data: updatedProgram,
            message: "Program updated successfully!",
        });
    }

    static async Delete(req: Request, res: Response) {
        
        const id = parseInt(req.params.id as string);

        // await ProgramService.DeleteProgramById(id,req.schema_name!);
        res.status(StatusCodes.OK).json({
            status: JSendStatus.SUCCESS,
            data: { message: "Program deleted successfully" },
        });
    }
}
