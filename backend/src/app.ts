import express from "express";
import cors from "cors";
import AuthRouter from "./routes/auth.route";
import EventRouter from "./routes/event.route";
import GoogleRouter from "./routes/google.route";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
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
