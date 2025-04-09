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
    const { id } = req.params;
    await quizModel.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Quiz Deleted Successfully", status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
