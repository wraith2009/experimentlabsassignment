import prisma from "../db";
import { Request, Response } from "express";

export const CreateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const event = await prisma.events.create({
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
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
    });
  }
};

export const UpdateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, title, description, startDate, endDate } = req.body;

  try {
    if (!id) {
      res.status(404).json({
        message: "Invalid event",
      });
      return;
    }

    const updatedEvent = await prisma.events.update({
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
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: error,
        message: "Internal Server Error",
      });
    }
    console.error("Unhandled error:", error);
  }
};

export const GetEvents = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  try {
    if (!userId) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const events = await prisma.events.findMany({
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
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Internal Server Error",
    });
  }
};

export const DeleteEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId } = req.body;
  try {
    if (!eventId) {
      res.status(404).json({
        messgae: "event not found",
      });
      return;
    }

    await prisma.events.delete({
      where: {
        id: eventId,
      },
    });

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Internal Server Error",
    });
  }
};
