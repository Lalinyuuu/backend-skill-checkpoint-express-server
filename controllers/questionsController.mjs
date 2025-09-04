import { query } from "../utils/db.mjs";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createQuestion(req, res, next) {
  try {
    const { title, description, category } = req.body;

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "Title is required." });
    }
    // description, category เป็น optional แต่ถ้ามีก็ต้องเป็น string
    if (description != null && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string." });
    }
    if (category != null && typeof category !== "string") {
      return res.status(400).json({ message: "Category must be a string." });
    }

    const insertSql = `
      INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await query(insertSql, [title.trim(), description ?? null, category ?? null]);

    return res.status(201).json({
      message: "Question created successfully.",
      id: result.rows[0].id,
    });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to create question.";
    next(err);
  }
}

export async function getQuestions(_req, res, next) {
  try {
    const selectSql = `
      SELECT
        questions.id,
        questions.title,
        questions.description,
        questions.category,
        COALESCE(SUM(question_votes.vote), 0) AS total_votes
      FROM questions
      LEFT JOIN question_votes
        ON question_votes.question_id = questions.id
      GROUP BY questions.id, questions.title, questions.description, questions.category
      ORDER BY questions.id ASC
    `;
    const result = await query(selectSql);

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to fetch questions.";
    next(err);
  }
}

export async function getQuestionById(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    const selectSql = `
      SELECT
        questions.id,
        questions.title,
        questions.description,
        questions.category,
        COALESCE(SUM(question_votes.vote), 0) AS total_votes
      FROM questions
      LEFT JOIN question_votes
        ON question_votes.question_id = questions.id
      WHERE questions.id = $1
      GROUP BY questions.id, questions.title, questions.description, questions.category
      LIMIT 1
    `;
    const result = await query(selectSql, [questionId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to fetch questions.";
    next(err);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    const { title, description, category } = req.body;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    if (title != null && !isNonEmptyString(title)) {
      return res.status(400).json({ message: "Title must be a non-empty string." });
    }
    if (description != null && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string." });
    }
    if (category != null && typeof category !== "string") {
      return res.status(400).json({ message: "Category must be a string." });
    }


    const check = await query("SELECT id FROM questions WHERE id = $1", [questionId]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }


    const updateSql = `
      UPDATE questions
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category)
      WHERE id = $4
      RETURNING id
    `;
    await query(updateSql, [
      title != null ? title.trim() : null,
      description != null ? description : null,
      category != null ? category : null,
      questionId,
    ]);

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to fetch questions.";
    next(err);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    const deleteSql = `DELETE FROM questions WHERE id = $1 RETURNING id`;
    const result = await query(deleteSql, [questionId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res
      .status(200)
      .json({ message: "Question post has been deleted successfully." });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to delete question.";
    next(err);
  }
}

export async function searchQuestions(req, res, next) {
  try {
    const { title, category } = req.query;

    if (!title && !category) {
      return res.status(400).json({ message: "Invalid search parameters." });
    }

    const conditions = [];
    const params = [];

    if (title) {
      params.push(`%${String(title).toLowerCase()}%`);
      conditions.push(`LOWER(questions.title) LIKE $${params.length}`);
    }

    if (category) {
      params.push(`%${String(category).toLowerCase()}%`);
      conditions.push(`LOWER(questions.category) LIKE $${params.length}`);
    }

    const selectSql = `
      SELECT
        questions.id,
        questions.title,
        questions.description,
        questions.category,
        COALESCE(SUM(question_votes.vote), 0) AS total_votes
      FROM questions
      LEFT JOIN question_votes
        ON question_votes.question_id = questions.id
      WHERE ${conditions.join(" AND ")}
      GROUP BY questions.id, questions.title, questions.description, questions.category
      ORDER BY questions.id ASC
    `;
    const result = await query(selectSql, params);

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to fetch a question.";
    next(err);
  }
}

export async function voteQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.questionId);
    const { vote } = req.body;

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({ message: "Invalid question id." });
    }

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: "Invalid vote value." });
    }

    const check = await query("SELECT id FROM questions WHERE id = $1", [questionId]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const insertSql = `
      INSERT INTO question_votes (question_id, vote)
      VALUES ($1, $2)
    `;
    await query(insertSql, [questionId, vote]);

    return res
      .status(200)
      .json({ message: "Vote on the question has been recorded successfully." });
  } catch (err) {
    err.status = 500;
    err.message = "Unable to vote question.";
    next(err);
  }
}