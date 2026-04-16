import { Request, Response } from "express";
import * as authService from "../service/ auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};