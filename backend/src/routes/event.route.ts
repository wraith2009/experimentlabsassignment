import { jwtAuth } from "./../middleware/auth.middleware";
import { Router } from "express";
import {
  CreateEvent,
  DeleteEvents,
  GetEvents,
  UpdateEvent,
} from "../controller/event.controller";

const EventRouter = Router();

EventRouter.route("/create-event").post(jwtAuth, CreateEvent);
EventRouter.route("/get-event").post(GetEvents);
EventRouter.route("/update-event").post(jwtAuth, UpdateEvent);
EventRouter.route("/delete-event").post(jwtAuth, DeleteEvents);

export default EventRouter;
