"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = exports.RegisterUser = exports.googleLogin = void 0;
const db_1 = __importDefault(require("../db"));
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const googleapis_1 = require("googleapis");
const axios_1 = __importDefault(require("axios"));
const config_2 = require("../config");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const oauth2Client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    console.log("code", code);
    if (!code) {
        res.status(400).json({
            message: "Authorization code is required",
        });
        return;
    }
    try {
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const userRes = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
        const { email, id: OauthId } = userRes.data;
        if (!email || !OauthId) {
            res.status(400).json({
                message: "Failed to fetch user email or OauthId from Google",
            });
            return;
        }
        let existingUser = yield db_1.default.user.findFirst({
            where: {
                email,
            },
        });
        if (!existingUser) {
            existingUser = yield db_1.default.user.create({
                data: {
                    email,
                    OauthId,
                },
            });
        }
        else if (!existingUser.OauthId) {
            // Update the user to include OauthId if it's missing
            existingUser = yield db_1.default.user.update({
                where: { id: existingUser.id },
                data: { OauthId },
            });
        }
        const { id } = existingUser;
        if (!config_2.JWT_PASSWORD) {
            throw new Error("JWT_PASSWORD is not defined");
        }
        console.log("in authcontro", config_2.JWT_PASSWORD);
        const token = jsonwebtoken_1.default.sign({ id }, config_2.JWT_PASSWORD);
        res.status(200).json({
            token,
            message: "User Logged In Successfully",
            user: {
                id: existingUser.id,
                email: existingUser.email,
                OauthId: existingUser.OauthId,
            },
        });
    }
    catch (error) {
        console.error("Error during Google login:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
exports.googleLogin = googleLogin;
const RegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({
                message: "please provide email and password",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, config_1.SALTROUNDS);
        const user = yield db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        res.status(200).json({
            message: "User Registered Successfully",
            data: user,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
exports.RegisterUser = RegisterUser;
const LoginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({
                message: "Please provide email and password",
            });
            return;
        }
        const user = yield db_1.default.user.findUnique({
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
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }
        if (!config_2.JWT_PASSWORD) {
            throw new Error("JWT_SECRET is not defined");
        }
        console.log("in authcontro", config_2.JWT_PASSWORD);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, config_2.JWT_PASSWORD);
        const { password: _ } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            message: "User logged in successfully",
            data: {
                user: userData,
                token,
            },
        });
    }
    catch (error) {
        console.error("Error in LoginUser:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
exports.LoginUser = LoginUser;
