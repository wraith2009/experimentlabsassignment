import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().email().min(1, "please enter your email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
