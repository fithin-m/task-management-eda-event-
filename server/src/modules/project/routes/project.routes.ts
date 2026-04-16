import { Router } from "express";
import { authMiddleware } from "../../../core/middleware/authMiddleware";
import { roleMiddleware } from "../../../core/middleware/roleMiddleware";
import { ProjectController } from "../controller/project.controller";

const router = Router();
const controller = new ProjectController();


router.post("/", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.createProject);


router.get("/", authMiddleware, controller.getProjects);

router.put("/:projectId", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.updateProject);

router.delete("/:projectId", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.deleteProject);

router.post("/:projectId/members", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), controller.addMember);

export default router;