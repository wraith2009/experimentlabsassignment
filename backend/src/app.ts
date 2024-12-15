import express from "express";
import cors from "cors";
import AuthRouter from "./routes/auth.route";
import EventRouter from "./routes/event.route";
import GoogleRouter from "./routes/google.route";
const app = express();

const allowedOrigins = [
  "https://experimentlabsassignment-tak1.vercel.app",
  "http://localhost:5173",
  "*",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = allowedOrigins.some(
      (allowedOrigin) => allowedOrigin === origin
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed.`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/v1/auth", GoogleRouter);
app.use("/api/v1", AuthRouter);
app.use("/api/v1", EventRouter);
app.use((req, res, next) => {
  const error: any = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error: any, req: any, res: any, next: any) => {
  console.error(error);
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      status: error.status || 500,
    },
  });
});

export default app;
