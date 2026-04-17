import { Router } from "express";
import { authMiddleware } from "../../core/middleware/authMiddleware";
import { NotificationController } from "./notification.controller";

const router = Router();
const ctrl = new NotificationController();

router.get("/",              authMiddleware, ctrl.getNotifications);
router.get("/unread",        authMiddleware, ctrl.getUnreadCount);
router.patch("/read",        authMiddleware, ctrl.markAllAsRead);
router.patch("/:id/read",    authMiddleware, ctrl.markAsRead);

export default router;
