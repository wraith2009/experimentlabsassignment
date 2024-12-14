"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const event_route_1 = __importDefault(require("./routes/event.route"));
const google_route_1 = __importDefault(require("./routes/google.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("API is running");
});
app.use("/api/v1/auth", google_route_1.default);
app.use("/api/v1", auth_route_1.default);
app.use("/api/v1", event_route_1.default);
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            status: error.status || 500,
        },
    });
});
exports.default = app;
