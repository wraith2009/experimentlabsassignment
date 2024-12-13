import { Router } from "express";
import {
  CreateEvent,
  DeleteEvents,
  GetEvents,
  UpdateEvent,
} from "../controller/event.controller";

const EventRouter = Router();

EventRouter.route("/create-event").post(CreateEvent);
EventRouter.route("/get-event").post(GetEvents);
EventRouter.route("/update-event").post(UpdateEvent);
EventRouter.route("/delete-event").post(DeleteEvents);

export default EventRouter;
