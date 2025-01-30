import express from "express";
import { GetAllQuizzesByUserId } from "../controller/quiz.controller.js";

const QuizRouter = express.Router();

QuizRouter.get("/get/quizzes/:id", GetAllQuizzesByUserId);

export default QuizRouter;
