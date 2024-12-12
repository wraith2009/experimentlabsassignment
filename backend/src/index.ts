import app from "./app";
import { PORT } from "./config";
import dotenv from "dotenv";

dotenv.config();
async function main() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
