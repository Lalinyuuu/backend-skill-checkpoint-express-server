import express from "express";
import cors from "cors";
import "dotenv/config.js";

import questionsRouter from "./routes/questions.mjs";
import answersRouter from "./routes/answers.mjs";
import { notFound, errorHandler } from "./middleware/errorHandler.mjs";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


app.get("/test", (_req, res) =>
  res.json({ ok: true, msg: "Server API is working 🚀" })
);


app.use("/questions", questionsRouter);
app.use("/", answersRouter);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});