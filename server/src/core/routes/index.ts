import { Router } from "express";
import authRoutes         from "../../modules/auth/routes/auth.routes";
import taskRoutes         from "../../modules/task/routes/task.routes";
import userRoutes         from "../../modules/user/routes/user.routes";
import projectRoutes      from "../../modules/project/routes/project.routes";
import notificationRoutes from "../../modules/notification/notification.routes";

const router = Router();

router.use("/auth",          authRoutes);
router.use("/users",         userRoutes);
router.use("/projects",      projectRoutes);
router.use("/tasks",         taskRoutes);
router.use("/notifications", notificationRoutes);

export default router;
