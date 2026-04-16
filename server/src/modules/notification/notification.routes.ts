import { Router } from "express";
import { authMiddleware } from "../../core/middleware/authMiddleware";
import { NotificationController } from "./notification.controller";

const router = Router();
const ctrl = new NotificationController();

// GET  /notifications          — fetch all for current user
router.get("/",              authMiddleware, ctrl.getNotifications);
// GET  /notifications/unread  — unread count
router.get("/unread",        authMiddleware, ctrl.getUnreadCount);
// PATCH /notifications/read   — mark ALL as read
router.patch("/read",        authMiddleware, ctrl.markAllAsRead);
// PATCH /notifications/:id/read — mark one as read
router.patch("/:id/read",    authMiddleware, ctrl.markAsRead);

export default router;
