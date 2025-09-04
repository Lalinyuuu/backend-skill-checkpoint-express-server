import { Router } from "express";
import {
  createAnswer,
  getAnswersForQuestion,
  deleteAnswersForQuestion,
  voteAnswer,
} from "../controllers/answersController.mjs";

const router = Router();

router.post("/questions/:questionId/answers", createAnswer);
router.get("/questions/:questionId/answers", getAnswersForQuestion);
router.delete("/questions/:questionId/answers", deleteAnswersForQuestion);
router.post("/answers/:answerId/vote", voteAnswer);

export default router;