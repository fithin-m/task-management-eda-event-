import { Router } from "express";
import { authMiddleware } from "../../../core/middleware/authMiddleware";
import { roleMiddleware } from "../../../core/middleware/roleMiddleware";
import { createManager, listManagers, listUsers } from "../controller/user.controller";

const router = Router();

router.post( "/create-manager", authMiddleware, roleMiddleware(["ADMIN"]), createManager );
router.get("/managers", authMiddleware, roleMiddleware(["ADMIN"]), listManagers);
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), listUsers);

export default router;