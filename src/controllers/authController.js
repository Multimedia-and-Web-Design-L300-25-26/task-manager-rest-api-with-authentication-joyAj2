import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { memoryStore, createId } from "../store/memoryStore.js";

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = memoryStore.users.find((user) => user.email === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: createId(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date()
    };

    memoryStore.users.push(user);
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(200).json({ token: signToken(user._id.toString()) });
    }

    const user = memoryStore.users.find((candidate) => candidate.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ token: signToken(user._id) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
};
