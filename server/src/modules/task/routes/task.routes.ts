import { Router } from "express";
import { authMiddleware } from "../../../core/middleware/authMiddleware";
import { roleMiddleware } from "../../../core/middleware/roleMiddleware";
import { TaskController } from "../controller/task.controller";

const router = Router();
const controller = new TaskController();


router.get("/", authMiddleware, controller.getTasks);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.createTask);
router.patch("/:taskId", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.updateTask);
router.patch("/:taskId/status", authMiddleware, controller.updateStatus);
router.patch("/:taskId/assign", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.assignTask);
router.delete("/:taskId", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.deleteTask);

router.get("/:taskId/comments", authMiddleware, controller.getComments);
router.post("/:taskId/comments", authMiddleware, controller.addComment);

export default router;