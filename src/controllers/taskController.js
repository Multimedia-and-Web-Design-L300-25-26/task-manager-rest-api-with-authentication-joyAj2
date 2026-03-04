import mongoose from "mongoose";
import Task from "../models/Task.js";
import { memoryStore, createId } from "../store/memoryStore.js";

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const task = await Task.create({
        title,
        description,
        owner: req.user._id
      });
      return res.status(201).json(task);
    }

    const task = {
      _id: createId(),
      title,
      description: description || "",
      completed: false,
      owner: req.user._id?.toString?.() || String(req.user._id),
      createdAt: new Date()
    };

    memoryStore.tasks.push(task);
    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasks = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    }

    const ownerId = req.user._id?.toString?.() || String(req.user._id);
    const tasks = memoryStore.tasks.filter((task) => String(task.owner) === ownerId);
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }

      await task.deleteOne();
      return res.status(200).json({ message: "Task deleted successfully" });
    }

    const ownerId = req.user._id?.toString?.() || String(req.user._id);
    const taskIndex = memoryStore.tasks.findIndex((task) => String(task._id) === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (String(memoryStore.tasks[taskIndex].owner) !== ownerId) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    memoryStore.tasks.splice(taskIndex, 1);
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task id" });
    }
    return res.status(500).json({ message: "Failed to delete task" });
  }
};
