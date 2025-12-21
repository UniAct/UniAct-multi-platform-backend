import { Router } from "express";
import { TenantResolver } from "../Middlewares/TenantResolver";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import ProgramController from "../Controllers/ProgramController";
const router = Router();


router.post(
    "/create",
    IsAuthenticated,
    IsSuperAdmin,
    //TO DO : VALIDATION ON THE CREATE DATA
    ProgramController.CreateProgram
)

router.get(
    "/",
    IsAuthenticated,
    TenantResolver,
    IsSuperAdmin,
    ProgramController.GetAllPrograms
)

router.delete(
    "/:id",
    IsAuthenticated,
    IsSuperAdmin,
    //TO DO : VALIDATION ON THE SENT ID
    ProgramController.Delete
)

export default router;