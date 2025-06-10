import quizModel from "../model/quiz.model.js";
import { roomModel } from "../model/room.model.js";
import { questionModel } from "../model/question.model.js";
import {
  createQuizValidation,
  updateQuizValidation,
} from "../validations/quiz.validation.js";

/**
 * @desc Get all quizzes created by a specific user
 * @route GET /api/quizzes/get/quizzes/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const GetAllQuizzesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const userQuizzes = await quizModel.find({ creator: id });
    res.status(200).json({ data: userQuizzes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

/**
 * @desc Get all public quizzes
 * @route GET /api/quizzes/get/public/quizzes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const GetAllPublicQuizzes = async (req, res) => {
  try {
    const publicQuizzes = await quizModel.find({ isPrivet: false });
    res.status(200).json({ data: publicQuizzes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

/**
 * @desc Delete a quiz by ID
 * @route DELETE /api/quizzes/delete/quiz/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const DeleteQuizBuyId = async (req, res) => {
  try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res
    //     .status(401)
    //     .json({ message: "No token provided", status: false });
    // }
    const { id } = req.params;
    await quizModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Quiz Deleted Successfully", status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

/**
 * @desc Get active quizzes by user ID (quizzes associated with active rooms)
 * @route GET /api/quizzes/get/active/quizzes/:id
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const GetActiveQuizzesById = async (req, res) => {
  try {
    const { id } = req.params;
    const Quizzes = await quizModel.find({ creator: id });
    const QuizzesIds = Quizzes.map((quiz) => quiz._id);
    const activeRooms = await roomModel.find({
      quiz: { $in: QuizzesIds },
      status: { $in: ["waiting", "started"] },
      isActive: true,
    });
    const activeQuizzes = await quizModel.find({
      _id: { $in: activeRooms.map((room) => room.quiz) },
    });

    res
      .status(200)
      .json({ data: activeQuizzes.map((q) => q._id), status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

/**
 * @desc Create a new quiz
 * @route POST /api/quizzes/create
 * @param {object} req - Express request object (contains quiz data in body)
 * @param {object} res - Express response object
 */
export const CreateQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    // Validate request body using Joi
    // const { error } = createQuizValidation.validate(quizData);
    // if (error) {
    //   return res.status(400).json({ message: error.details[0].message, status: false });
    // }

    const question = await questionModel.create({
      duration: 30,
      type: "quiz",
      showQuestionDuration: 2000,
      media: "",
      options: ["", "", "", ""],
      answerIndex: [],
      attemptStudents: [],
      results: [],
      maximumMarks: 1000,
      question: "",
    });

    if (!question) {
      socket.emit("created_quiz", {
        message: "Failed to create question",
        status: false,
      });
      return;
    }
    const newQuiz = await quizModel.create({
      ...quizData,
      questions: [question._id],
    });

    const populatedQuiz = await (
      await newQuiz.populate("questions")
    ).populate("theme");

    res.status(201).json({ data: populatedQuiz, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

/**
 * @desc Update an existing quiz by ID
 * @route PUT /api/quizzes/update/:id
 * @param {object} req - Express request object (contains quiz ID in params and update data in body)
 * @param {object} res - Express response object
 */
export const UpdateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate request body using Joi
    // const { error } = updateQuizValidation.validate(updateData);
    // if (error) {
    //   return res
    //     .status(400)
    //     .json({ message: error.details[0].message, status: false });
    // }

    const updatedQuiz = await quizModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .populate("questions")
      .populate("theme");
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found", status: false });
    }
  

    res.status(200).json({ data: updatedQuiz, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const AddQuestionInQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { type = "quiz" } = req.body;
    if (!quizId) {
      return res
        .status(400)
        .json({ message: "Quiz ID is required", status: false });
    }
    const question = await questionModel.create({
      duration: 30,
      type: type,
      showQuestionDuration: 2000,
      media: "",
      options: ["", "", "", ""],
      answerIndex: [],
      attemptStudents: [],
      results: [],
      maximumMarks: 1000,
      question: "",
    });

    if (!question) {
      return res
        .status(400)
        .json({ message: "Failed to create question", status: false });
    }

    // Add the question to the quiz
    const updatedQuiz = await quizModel
      .findByIdAndUpdate(
        quizId,
        { $push: { questions: question._id } },
        { new: true }
      )
      .populate("questions")
      .populate("theme");

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found", status: false });
    }

    res.status(200).json({ data: updatedQuiz, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const DeleteQuestionFromQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    // Validate that quizId and questionId are provided
    if (!quizId || !questionId) {
      return res.status(400).json({
        message: "Quiz ID and Question ID are required",
        status: false,
      });
    }

    // Find the quiz and remove the question
    const updatedQuiz = await quizModel.findByIdAndUpdate(
      quizId,
      { $pull: { questions: questionId } },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found", status: false });
    }

    const populatedQuiz = await (
      await updatedQuiz.populate("questions")
    ).populate("theme");

    // Optionally, you can also delete the question from the question model
    await questionModel.findByIdAndDelete(questionId);

    res.status(200).json({ data: populatedQuiz, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const UpdateQuestionInQuiz = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;

    const updatedQuestion = await questionModel.findByIdAndUpdate(
      questionId,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedQuestion) {
      return res
        .status(404)
        .json({ message: "Question not found", status: false });
    }

    res.status(200).json({ data: updatedQuestion, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const GetSingleQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res
        .status(400)
        .json({ message: "Quiz ID is required", status: false });
    }

    const quiz = await quizModel
      .findById(quizId)
      .populate("questions")
      .populate("theme");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found", status: false });
    }

    res.status(200).json({ data: quiz, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
