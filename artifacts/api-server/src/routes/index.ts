import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import recipesRouter from "./recipes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(recipesRouter);

export default router;
