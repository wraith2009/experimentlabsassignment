"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_PASSWORD = exports.JWT_SECRET = exports.SALTROUNDS = exports.PORT = void 0;
exports.PORT = process.env.PORT || 3000;
exports.SALTROUNDS = parseInt(process.env.SALTROUNDS || "10", 10);
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_PASSWORD = process.env.JWT_PASSWORD;
