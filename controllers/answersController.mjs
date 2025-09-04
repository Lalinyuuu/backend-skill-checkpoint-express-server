import { query } from "../utils/db.mjs";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createAnswer(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    const { content } = req.body;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }
    if (!isNonEmptyString(content)) {
      return res.status(400).json({ message: "Content is required." });
    }
    if (content.length > 300) {
      return res
        .status(400)
        .json({ message: "Content must be at most 300 characters." });
    }

    // ตรวจว่ามี question นี้
    const qCheck = await query("SELECT id FROM questions WHERE id = $1", [questionId]);
    if (qCheck.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const insertSql = `
      INSERT INTO answers (question_id, content)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await query(insertSql, [questionId, content.trim()]);

    return res
      .status(201)
      .json({ message: "Answer created successfully.", id: result.rows[0].id });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to create answers.";
    next(err);
  }
}

export async function getAnswersForQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }


    const qCheck = await query("SELECT id FROM questions WHERE id = $1", [questionId]);
    if (qCheck.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }


    const selectSql = `
      SELECT
        answers.id,
        answers.content,
        COALESCE(SUM(answer_votes.vote), 0) AS total_votes
      FROM answers
      LEFT JOIN answer_votes
        ON answer_votes.answer_id = answers.id
      WHERE answers.question_id = $1
      GROUP BY answers.id, answers.content
      ORDER BY answers.id ASC
    `;
    const result = await query(selectSql, [questionId]);

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to fetch answers.";
    next(err);
  }
}

export async function deleteAnswersForQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    const qCheck = await query("SELECT id FROM questions WHERE id = $1", [questionId]);
    if (qCheck.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const deleteSql = `DELETE FROM answers WHERE question_id = $1`;
    await query(deleteSql, [questionId]);

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to delete answers.";
    next(err);
  }
}

export async function voteAnswer(req, res, next) {
  try {
    const answerId = Number(req.params.answerId);
    const { vote } = req.body;

    if (!Number.isInteger(answerId) || answerId <= 0) {
      return res.status(400).json({ message: "Invalid answer id." });
    }
    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: "Invalid vote value." });
    }

  
    const aCheck = await query("SELECT id FROM answers WHERE id = $1", [answerId]);
    if (aCheck.rowCount === 0) {
      return res.status(404).json({ message: "Answer not found." });
    }

    const insertSql = `
      INSERT INTO answer_votes (answer_id, vote)
      VALUES ($1, $2)
    `;
    await query(insertSql, [answerId, vote]);

    return res
      .status(200)
      .json({ message: "Vote on the answer has been recorded successfully." });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to vote answer.";
    next(err);
  }
}