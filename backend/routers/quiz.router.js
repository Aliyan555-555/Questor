import express from "express";
import { DeleteQuizBuyId, GetActiveQuizzesById, GetAllPublicQuizzes, GetAllQuizzesByUserId } from "../controller/quiz.controller.js";

const QuizRouter = express.Router();

QuizRouter.get("/get/quizzes/:id", GetAllQuizzesByUserId);
QuizRouter.get("/get/public/quizzes", GetAllPublicQuizzes);
QuizRouter.get("/get/active/quizzes/:id", GetActiveQuizzesById);
QuizRouter.delete("/delete/quiz/:id", DeleteQuizBuyId);

export default QuizRouter;
