import { Router } from "express";
const GoogleRouter = Router();
import { googleLogin } from "../controller/auth.controller";

GoogleRouter.route("/google").get(googleLogin);

export default GoogleRouter;
