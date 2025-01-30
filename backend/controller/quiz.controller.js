import quizModel from "../model/quiz.model.js";
export const GetAllQuizzesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const userQuizzes = await quizModel.find({ creator: id });
    res.status(200).json({ data: userQuizzes, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
