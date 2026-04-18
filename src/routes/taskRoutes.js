import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createTask, getTasks, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", createTask);

// GET /api/tasks
router.get("/", getTasks);

// DELETE /api/tasks/:id
router.delete("/:id", deleteTask);

export default router;
