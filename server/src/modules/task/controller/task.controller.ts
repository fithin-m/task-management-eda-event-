import { Request, Response } from "express";
import { TaskService } from "../service/task.service";
import { validateCreateTask } from "../validators/task.validator";

export class TaskController {
  private service = new TaskService();

  createTask = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      validateCreateTask(req.body);
      const task = await this.service.createTask(req.body, actor);
      res.status(201).json({ success: true, message: "Task created successfully", data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getTasks = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const tasks = await this.service.getTasks(actor, req.query as {
        q?: string;
        status?: string;
        priority?: string;
        assignedTo?: string;
        projectId?: string;
      });
      res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      console.error("Error in getTasks:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);
      await this.service.deleteTask(taskId, actor);
      res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);

      // Check if request body has any data
      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ success: false, message: "Request body cannot be empty" });
        return;
      }

      const task = await this.service.updateTask(taskId, req.body, actor);
      res.status(200).json({ success: true, message: "Task updated", data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: "Status is required" });
        return;
      }

      const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: "Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED" });
        return;
      }

      const task = await this.service.updateStatus(taskId, status, actor);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  assignTask = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);
      const { userId } = req.body;

      if (!userId || String(userId).trim() === "") {
        res.status(400).json({ success: false, message: "userId is required" });
        return;
      }

      const task = await this.service.assignTask(taskId, userId, actor);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getComments = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);
      const comments = await this.service.getComments(taskId, actor);
      res.status(200).json({ success: true, data: comments });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  addComment = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const taskId = String(req.params.taskId);

      const content = req.body?.content;

      if (!content || String(content).trim() === "") {
        res.status(400).json({ success: false, message: "Comment content cannot be empty" });
        return;
      }

      const comment = await this.service.addComment(
        taskId,
        { content: String(content).trim() },
        actor,
      );

      res.status(201).json({ success: true, message: "Comment added", data: comment });
    } catch (error: any) {
      console.error("Error in addComment:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
