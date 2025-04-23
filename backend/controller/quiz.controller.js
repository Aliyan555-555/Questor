import quizModel from "../model/quiz.model.js";
import { roomModel } from "../model/room.model.js";
export const GetAllQuizzesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const userQuizzes = await quizModel.find({ creator: id });
    res.status(200).json({ data: userQuizzes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const GetAllPublicQuizzes = async (req, res) => {
  try {
    const publicQuizzes = await quizModel.find({isPrivet:false});
    res.status(200).json({ data: publicQuizzes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

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


export const GetActiveQuizzesById = async (req, res) => {
  try {
    const { id } = req.params;
    const Quizzes = await quizModel.find({creator: id});
    const QuizzesIds = Quizzes.map((quiz) => quiz._id);
    const activeRooms = await roomModel.find({
      quiz: { $in: QuizzesIds },
      status: { $in: ["waiting", "started"] },
      isActive: true,
    });
    const activeQuizzes = await quizModel.find({
      _id: { $in: activeRooms.map((room) => room.quiz) },
    });

    res.status(200).json({ data: activeQuizzes.map(q => q._id), status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
}