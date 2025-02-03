import express from "express";
import { GetAllPublicQuizzes, GetAllQuizzesByUserId } from "../controller/quiz.controller.js";

const QuizRouter = express.Router();

QuizRouter.get("/get/quizzes/:id", GetAllQuizzesByUserId);
QuizRouter.get("/get/public/quizzes", GetAllPublicQuizzes);

export default QuizRouter;
