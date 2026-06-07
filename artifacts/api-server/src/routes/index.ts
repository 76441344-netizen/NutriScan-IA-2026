import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import recipesRouter from "./recipes";
import scansRouter from "./scans";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(recipesRouter);
router.use(scansRouter);
router.use(chatRouter);

export default router;
