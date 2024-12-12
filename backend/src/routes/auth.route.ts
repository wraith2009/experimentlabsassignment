import { Router } from "express";
const AuthRouter = Router();
import { RegisterUser, LoginUser } from "../controller/auth.controller";

AuthRouter.route("/sign-up").post(RegisterUser);
AuthRouter.route("/login").post(LoginUser);

export default AuthRouter;
