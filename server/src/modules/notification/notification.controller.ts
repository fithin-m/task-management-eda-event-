import { Request, Response } from "express";
import { notificationService } from "./notification.service";

export class NotificationController {
  getNotifications = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const userId = String(actor?.userId ?? actor?.id ?? "");
      if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const notifications = await notificationService.getForUser(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const userId = String(actor?.userId ?? actor?.id ?? "");
      const notificationId = String(req.params.id);

      await notificationService.markAsRead(notificationId, userId);
      res.status(200).json({ success: true, message: "Marked as read" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const userId = String(actor?.userId ?? actor?.id ?? "");

      await notificationService.markAllAsRead(userId);
      res.status(200).json({ success: true, message: "All marked as read" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const actor = (req as any).user;
      const userId = String(actor?.userId ?? actor?.id ?? "");

      const count = await notificationService.getUnreadCount(userId);
      res.status(200).json({ success: true, data: { count } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}
