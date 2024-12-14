"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthRouter = (0, express_1.Router)();
const auth_controller_1 = require("../controller/auth.controller");
AuthRouter.route("/sign-up").post(auth_controller_1.RegisterUser);
AuthRouter.route("/login").post(auth_controller_1.LoginUser);
exports.default = AuthRouter;
