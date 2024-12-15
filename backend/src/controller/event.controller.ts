import prisma from "../db";
import { Request, Response } from "express";
import { oauth2Client } from "../googleauth";
import { google } from "googleapis";

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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accessToken || !user.refreshToken) {
      res.status(401).json({ message: "User not authenticated with Google" });
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const googleEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description,
        start: { dateTime: parsedstartDate.toISOString() },
        end: { dateTime: parsedendDate.toISOString() },
      },
    });

    const event = await prisma.events.create({
      data: {
        title,
        description,
        startDate: parsedstartDate,
        endDate: parsedendDate,
        googleEventId: googleEvent.data.id,
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

    const event = await prisma.events.findUnique({ where: { id } });
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: event.userId },
    });
    if (!user || !user.accessToken || !user.refreshToken) {
      res.status(401).json({ message: "User not authenticated with Google" });
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    if (event.googleEventId) {
      await calendar.events.update({
        calendarId: "primary",
        eventId: event.googleEventId,
        requestBody: {
          summary: title,
          description,
          start: { dateTime: new Date(startDate).toISOString() },
          end: { dateTime: new Date(endDate).toISOString() },
        },
      });
    } else {
      res.status(400).json({ message: "Google Event ID is missing" });
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.accessToken || !user.refreshToken) {
      res
        .status(400)
        .json({ message: "Google authentication details missing" });
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const googleEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const dbEvents = await prisma.events.findMany({
      where: {
        userId: userId,
      },
    });

    const uniqueEvents = new Map();

    googleEvents.data.items?.forEach((event) => {
      if (!uniqueEvents.has(event.id)) {
        uniqueEvents.set(event.id, {
          id: event.id, // Google event ID
          title: event.summary,
          description: event.description,
          startDate: event.start
            ? event.start.dateTime || event.start.date
            : undefined,
          endDate: event.end ? event.end.dateTime || event.end.date : undefined,
          source: "google", // Source can be used to differentiate
        });
      }
    });

    dbEvents.forEach((event) => {
      if (!uniqueEvents.has(event.id)) {
        uniqueEvents.set(event.id, {
          id: event.id, // Your DB event ID
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          source: "db", // Source can be used to differentiate
        });
      }
    });

    const mergedEvents = Array.from(uniqueEvents.values());

    res.status(200).json({
      message: "Events fetched successfully ",
      data: mergedEvents,
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

    const event = await prisma.events.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: event.userId } });
    if (!user || !user.accessToken || !user.refreshToken) {
      res.status(401).json({ message: "User not authenticated with Google" });
      return;
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (event.googleEventId) {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: event.googleEventId,
      });
    } else {
      res.status(400).json({ message: "Google Event ID is missing" });
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
