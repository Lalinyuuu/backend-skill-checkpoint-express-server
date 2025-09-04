import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  searchQuestions,
  voteQuestion,
} from "../controllers/questionsController.mjs";

const router = Router();


router.post("/", createQuestion);
router.get("/", getQuestions);
router.get("/search", searchQuestions);
router.get("/:questionId", getQuestionById);
router.put("/:questionId", updateQuestion);
router.delete("/:questionId", deleteQuestion);
router.post("/:questionId/vote", voteQuestion);

export default router;