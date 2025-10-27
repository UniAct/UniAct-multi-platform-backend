import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RBACService } from "../Services/RBACService";
import JSendStatus from "../Enums/Jsend";

export class RBACController {
  public static async CreateRole(req: Request, res: Response) {
    try {
      const { name, description }: { name: string; description: string } = req.body;
      const tenant = req.tenant;

      const role = await RBACService.CreateRole(name, description, tenant?.schema_name!);

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "Role created successfully",
        data: role,
      });
    } catch (err: any) {
      if (err.message.includes("exists")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
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

  public static async GetRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tenant = req.tenant;

      const role = await RBACService.GetRole(id, tenant?.schema_name!);

      if (!role) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: "Role not found" },
        });
      }

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: role,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async GetAllRole(req: Request, res: Response) {
    try {
      const tenant = req.tenant;

      const roles = await RBACService.GetAllRole(tenant?.schema_name!);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: roles,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async UpdateRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description }: { name: string; description: string } = req.body;
      const tenant = req.tenant;

      const updatedRole = await RBACService.UpdateRole(id, name, description, tenant?.schema_name!);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Role updated successfully",
        data: updatedRole,
      });
    } catch (err: any) {
      if (err.message.includes("exists")) {
        return res.status(StatusCodes.CONFLICT).json({
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

  public static async DeleteRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tenant = req.tenant;

      const deletedRole = await RBACService.DeleteRole(id, tenant?.schema_name!);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Role deleted successfully",
        data: deletedRole,
      });
    } catch (err: any) {
      if (err.message.includes("not exist")) {
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

  public static async ReadPermissions(req: Request, res: Response) {
    try {
      const tenant = req.tenant;

      const permissions = await RBACService.GetAllPermissions(tenant?.schema_name!);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Permissions retrieved successfully",
        data: permissions,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async ReadPermissionsById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tenant = req.tenant;

      const permission = await RBACService.GetPermissionById(id, tenant?.schema_name!);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: permission,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async AssignPermissionsToRole(req: Request, res: Response) {
    try {
      const role_id = Number(req.params.id);
      const { permissions }: { permissions: string[] } = req.body;
      const tenant = req.tenant;

      const updatedRole = await RBACService.AssignPermissionsToRole(
        role_id,
        permissions,
        tenant?.schema_name!
      );

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Permissions assigned successfully",
        data: updatedRole,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async AssignRoleToUser(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      const { id } = req.params;
      const { role_names } = req.body; 

      const result = await RBACService.AssignRoleToUser(
        parseInt(id),
        role_names,
        tenant?.schema_name!
      );

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Roles assigned to user successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in AssignRoleToUser:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: error.message || "Failed to assign roles to user",
      });
    }
  }
}
