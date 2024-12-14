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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteEvents = exports.GetEvents = exports.UpdateEvent = exports.CreateEvent = void 0;
const db_1 = __importDefault(require("../db"));
const CreateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, description, startDate, endDate } = req.body;
    try {
        if (!userId || !title || !startDate || !endDate) {
            res.status(400).json({
                message: "Please provide all the details",
            });
            return;
        }
        const parsedstartDate = new Date(startDate);
        const parsedendDate = new Date(endDate);
        if (isNaN(parsedstartDate.getTime())) {
            res.status(400).json({
                message: "Invalid date format",
            });
            return;
        }
        if (isNaN(parsedendDate.getTime())) {
            res.status(400).json({
                message: "Invalid date format",
            });
            return;
        }
        const event = yield db_1.default.events.create({
            data: {
                title,
                description,
                startDate: parsedstartDate,
                endDate: parsedendDate,
                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        res.status(201).json({
            message: "Event created successfully",
            event,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create event",
        });
    }
});
exports.CreateEvent = CreateEvent;
const UpdateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, title, description, startDate, endDate } = req.body;
    try {
        if (!id) {
            res.status(404).json({
                message: "Invalid event",
            });
            return;
        }
        const updatedEvent = yield db_1.default.events.update({
            where: {
                id: id,
            },
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        if (!updatedEvent) {
            res.status(404).json({
                message: "Unable to update event",
            });
            return;
        }
        res.status(200).json({
            message: "Event successfully updated",
            data: updatedEvent,
        });
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({
                error: error,
                message: "Internal Server Error",
            });
        }
        console.error("Unhandled error:", error);
    }
});
exports.UpdateEvent = UpdateEvent;
const GetEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        if (!userId) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const events = yield db_1.default.events.findMany({
            where: {
                userId: userId,
            },
        });
        if (!events) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            message: "Events fetched successfully ",
            data: events,
        });
    }
    catch (error) {
        res.status(500).json({
            error: error,
            message: "Internal Server Error",
        });
    }
});
exports.GetEvents = GetEvents;
const DeleteEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.body;
    try {
        if (!eventId) {
            res.status(404).json({
                messgae: "event not found",
            });
            return;
        }
        yield db_1.default.events.delete({
            where: {
                id: eventId,
            },
        });
        res.status(200).json({
            message: "Event deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            error: error,
            message: "Internal Server Error",
        });
    }
});
exports.DeleteEvents = DeleteEvents;
