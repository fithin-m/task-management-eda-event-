import { Request, Response } from "express";
import { ProjectService } from "../service/project.service";

export class ProjectController {
  private service = new ProjectService();

  createProject = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;

      const project = await this.service.createProject(req.body, actor);

       res.status(201).json({ success: true, data: project });

    } catch (error: any) {
       res.status(400).json({ success: false, message: error.message });
    }
  };

  getProjects = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;

      const projects = await this.service.getProjects(actor);

       res.status(200).json({ success: true, data: projects });

    } catch (error: any) {
       res.status(400).json({ success: false, message: error.message });
    }
  };

  updateProject = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const projectId = req.params.projectId as string;

      const project = await this.service.updateProject(
        projectId,
        req.body,
        actor
      );

       res.status(200).json({ success: true, data: project });

    } catch (error: any) {
       res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const projectId = req.params.projectId as string;

      await this.service.deleteProject(projectId, actor);

       res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });

    } catch (error: any) {
       res.status(400).json({ success: false, message: error.message });
    }
  };

  addMember = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const projectId = req.params.projectId as string;
      const result = await this.service.addMember(
        projectId,
        req.body.userId,
        actor
      );

       res.status(200).json({ success: true, data: result });

    } catch (error: any) {
       res.status(400).json({ success: false, message: error.message });
    }
  };
}