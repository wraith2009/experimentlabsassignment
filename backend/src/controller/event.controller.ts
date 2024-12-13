import prisma from "../db";
import { Request, Response } from "express";

export const CreateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, title, description, date } = req.body;
  console.log(req.body);
  try {
    if (!userId || !title || !description || !date) {
      res.status(400).json({
        message: "Please provide all the details",
      });
      return;
    }

    console.log(title);
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: "Invalid date format",
      });
      return;
    }

    const event = await prisma.events.create({
      data: {
        title,
        description,
        date: parsedDate,
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
    console.log(error);
    res.status(500).json({
      message: "Failed to create event",
    });
  }
};

export const UpdateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId, title, description } = req.body;
  try {
    if (!eventId) {
      res.status(404).json({
        message: "Invalid event",
      });
    }

    const updatedEvent = await prisma.events.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        description,
      },
    });

    if (!updatedEvent) {
      res.status(404).json({
        message: "Unable to update event",
      });
    }

    res.status(200).json({
      message: "Event successfully updated",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Internal Server Error",
    });
  }
};

export const GetEvents = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  try {
    if (!userId) {
      res.status(404).json({
        message: "User not found",
      });
    }

    const events = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        events: true,
      },
    });

    if (!events) {
      res.status(404).json({
        message: "User not found",
      });
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
