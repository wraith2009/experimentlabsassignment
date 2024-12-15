import prisma from "../db";
import { Request, Response } from "express";
import { SALTROUNDS } from "../config";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import axios from "axios";
import { JWT_PASSWORD } from "../config";
import { oauth2Client } from "../googleauth";

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const code = req.query.code as string | undefined;

  if (!code) {
    res.status(400).json({ message: "Authorization code is required" });
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: userInfo } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );

    const { email, sub: googleId, name, picture } = userInfo;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          OauthId: googleId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id },
      process.env.JWT_PASSWORD || "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      jwtToken,
      message: "User Logged In Successfully",
      user: {
        id: user.id,
        email: user.email,
        OauthId: user.OauthId,
        accessToken: tokens.access_token,
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

    if (!JWT_PASSWORD) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_PASSWORD);

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
