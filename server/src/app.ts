import express from "express";
import cors from "cors";
import { errorHandler } from "./core/middleware/errorHandler";
import routes from "./core/routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running 🚀" });
});
app.use(routes)

app.use(errorHandler);



export default app;