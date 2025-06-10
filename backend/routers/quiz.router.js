import express from "express";
import {
  CreateQuiz,
  DeleteQuizBuyId,
  GetActiveQuizzesById,
  GetAllPublicQuizzes,
  GetAllQuizzesByUserId,
  UpdateQuiz,
  DeleteQuestionFromQuiz,
  AddQuestionInQuiz,
  UpdateQuestionInQuiz,
  GetSingleQuizById,
} from "../controller/quiz.controller.js";

const QuizRouter = express.Router();

// GET all quizzes by user ID
QuizRouter.get("/get/quizzes/:id", GetAllQuizzesByUserId);

// GET all public quizzes
QuizRouter.get("/get/public/quizzes", GetAllPublicQuizzes);

// GET active quizzes by teacher ID
QuizRouter.get("/get/active/quizzes/:id", GetActiveQuizzesById);

// DELETE a quiz by ID
QuizRouter.delete("/delete/quiz/:id", DeleteQuizBuyId);

// POST create a new quiz
QuizRouter.post("/create", CreateQuiz);

// PUT update a quiz by ID
QuizRouter.put("/update/:id", UpdateQuiz);

// DELETE a question from quiz
QuizRouter.delete("/delete/question/:quizId/:questionId", DeleteQuestionFromQuiz);

// POST add a question to quiz
QuizRouter.post("/add/question/:quizId", AddQuestionInQuiz);
// update septate questions
QuizRouter.put("/update/question/:questionId", UpdateQuestionInQuiz);
// get single quiz by quiz id 
QuizRouter.get("/get/quiz/:quizId",GetSingleQuizById);

export default QuizRouter;
