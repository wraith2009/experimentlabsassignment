import prisma from "../db";
import { Request, Response } from "express";
import { SALTROUNDS } from "../config";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import bcryptjs from "bcryptjs";
import { google } from "googleapis";
import axios from "axios";
import { JWT_PASSWORD } from "../config";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const code = req.query.code as string | undefined;

  console.log("code", code);
  if (!code) {
    res.status(400).json({
      message: "Authorization code is required",
    });
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, id: OauthId } = userRes.data;

    if (!email || !OauthId) {
      res.status(400).json({
        message: "Failed to fetch user email or OauthId from Google",
      });
      return;
    }

    let existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email,
          OauthId,
        },
      });
    } else if (!existingUser.OauthId) {
      // Update the user to include OauthId if it's missing
      existingUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { OauthId },
      });
    }

    const { id } = existingUser;

    if (!JWT_PASSWORD) {
      throw new Error("JWT_PASSWORD is not defined");
    }
    const token = jwt.sign({ id }, JWT_PASSWORD);

    res.status(200).json({
      token,
      message: "User Logged In Successfully",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        OauthId: existingUser.OauthId,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

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
