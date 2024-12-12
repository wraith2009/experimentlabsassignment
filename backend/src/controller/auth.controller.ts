import prisma from "../db";
import { Request, Response } from "express";
import { SALTROUNDS } from "../config";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import bcryptjs from "bcryptjs";

export const RegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({
        message: "please provide email and password",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, SALTROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: "User Registered Successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const LoginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email and password",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    const { password: _, ...userData } = user;
    res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Error in LoginUser:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
