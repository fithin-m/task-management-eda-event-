import { Request, Response } from "express";
import {
  createManagerService,
  listManagersService,
  listUsersService,
} from "../service/user.service";

export const createManager = async (req: Request, res: Response) => {
  try {
    const manager = await createManagerService(req.body);

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      data: manager,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listManagers = async (_req: Request, res: Response) => {
  try {
    const managers = await listManagersService();
    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await listUsersService();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};