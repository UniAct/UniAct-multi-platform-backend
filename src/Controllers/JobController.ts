import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { JobService } from "../Services/JobService";

export class JobController {

    static async CheckStudentImportStatus(req: Request, res: Response) {
        const jobId = String(req.params.id!);
        const schemaName = req.schema_name!;

        const job = await JobService.CheckStudentImportStatus(jobId,schemaName);
        
        res.status(StatusCodes.CREATED).json({
            status: JSendStatus.SUCCESS,
            data: job,
        });
    }

    static async CheckStudentEnrollmentStatus(req: Request, res: Response) {
        const jobId = String(req.params.id!);
        const schemaName = req.schema_name!;

        const job = await JobService.CheckStudentEnrollmentStatus(jobId,schemaName);
        
        res.status(StatusCodes.CREATED).json({
            status: JSendStatus.SUCCESS,
            data: job,
        });
    }
}
