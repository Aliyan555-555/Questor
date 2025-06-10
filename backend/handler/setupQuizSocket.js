
import quizModel from "../model/quiz.model.js";
import { questionModel } from "../model/question.model.js";

export const setupQuizSocket = (io) => {
  const quizIo = io.of("/quiz");

  quizIo.on("connection", (socket) => {
    // Quiz creation and management events
    socket.on("create_quiz", async (data) => {
      try {
        // Create a question
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
          ...data,
          questions: [question._id],
        });

        if (!newQuiz) {
          socket.emit("created_quiz", {
            message: "Failed to create quiz",
            status: false,
          });
          return;
        }
        const populatedQuiz = await (
          await newQuiz.populate("questions")
        ).populate("theme");
        socket.emit("created_quiz", {
          data: populatedQuiz,
          status: true,
          message: "Quiz created successfully",
        });
      } catch (error) {
        console.error("Error during quiz creation:", error);
        socket.emit("created_quiz", {
          message: "Something went wrong during quiz creation",
          status: false,
        });
      }
    });

    socket.on("add_question", async (data) => {
      try {
        const { id, type } = data;
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
        const updatedQuiz = await quizModel
          .findByIdAndUpdate(
            id,
            { $push: { questions: question._id } },
            { new: true }
          )
          .populate("questions")
          .populate("theme");

        socket.emit("question_added", {
          data: updatedQuiz,
          status: true,
          message: "added question successfully",
        });
      } catch (error) {
        console.error("Error adding question:", error);
        socket.emit("question_added", {
          message: "Failed to add question",
          status: false,
        });
      }
    });
    socket.on("set_question_value", async (data) => {
      try {
        const quiz = await quizModel
          .findOne({ _id: data._id })
          .populate("questions")
          .populate("theme");

        if (!quiz) {
          socket.emit("set_question_value", {
            status: false,
            message: "Quiz not found",
          });
          return;
        }
        const question = await questionModel.findOneAndUpdate(
          { _id: data.questionId },
          { question: data.value },
          { new: true }
        );

        if (!question) {
          socket.emit("set_question_value", {
            status: false,
            message: "Question not found",
          });
          return;
        }

        socket.emit("set_question_value", {
          status: true,
          message: "Question updated successfully",
          data: quiz,
          question,
        });
      } catch (error) {
        console.error("Error updating question:", error);
        socket.emit("set_question_value", {
          status: false,
          message: "An error occurred while updating the question",
        });
      }

      socket.on("fetch_quiz", async (data) => {
        try {
          console.log("works", data);
          if (!data._id) {
            socket.emit("fetched_quiz", {
              status: false,
              message: "Id is required",
            });
            return;
          }

          const quiz = await quizModel
            .findOne({ _id: data._id })
            .populate("questions")
            .populate("theme");
          if (!quiz) {
            socket.emit("feched_quiz", {
              status: false,
              message: "Quiz not found",
            });
            return;
          }
          socket.emit("feched_quiz", {
            status: true,
            message: "Quiz fetched successfully",
            data: quiz,
          });
        } catch (error) {
          socket.emit("feched_quiz", {
            status: false,
            message: "Something went wrong",
          });
        }
      });

      socket.on("delete_question_in_quiz", async (data) => {
        try {
          const quiz = await quizModel
            .findById(data._id)
            .populate("questions")
            .populate("theme");

          if (!quiz) {
            socket.emit("deleted_question_in_quiz", {
              message: "Quiz not found",
              status: false,
            });
            return;
          }
          quiz.questions = quiz.questions.filter(
            (question) => question._id.toString() !== data.questionId
          );
          await quiz.save();
          const updatedQuiz = await quiz;
          socket.emit("deleted_question_in_quiz", {
            data: updatedQuiz,
            message: "Question deleted successfully",
            status: true,
          });
        } catch (error) {
          console.error("Error deleting question from quiz:", error);
          socket.emit("deleted_question_in_quiz", {
            message: "Something went wrong",
            status: false,
          });
        }
      });

      socket.on("update_question", async (data) => {
        const question = await questionModel.findByIdAndUpdate(data._id, data, {
          new: true,
        });
        if (!question) {
          socket.emit("updated_question", {
            message: "Something went wrong",
            status: false,
          });
          return;
        }
        socket.emit("updated_question", {
          data: question,
          message: "Updated successfully",
          status: true,
        });
      });
      socket.on("update_theme", async (data) => {
        const { id, theme } = data;
        const updatedQuiz = await quizModel
          .findByIdAndUpdate(id, { theme }, { new: true })
          .populate("questions")
          .populate("theme");
        if (!updatedQuiz) {
          socket.emit("updated_theme", {
            message: "Something went wrong",
            status: false,
          });
          return;
        }
        socket.emit("updated_theme", {
          data: updatedQuiz,
          message: "Updated successfully",
          status: true,
        });
      });
      socket.on("update_quiz_status", async (data) => {
        const { id, status } = data;
        const updatedQuiz = await quizModel
          .findByIdAndUpdate(id, { status }, { new: true })
          .populate("questions")
          .populate("theme");
        if (!updatedQuiz) {
          socket.emit("updated_quiz_status", {
            message: "Something went wrong",
            status: false,
          });
          return;
        }
        socket.emit("updated_quiz", {
          data: updatedQuiz,
          message: "Updated successfully",
          status: true,
        });
      });
      socket.on("update_quiz", async (data) => {
        try {
          const updateQuiz = await quizModel
            .findByIdAndUpdate(data._id, data, { new: true })
            .populate("questions")
            .populate("theme");
          if (!updateQuiz) {
            socket.emit("updated_quiz", {
              message: "Something went wrong",
              status: false,
            });
            return;
          }
          socket.emit("updated_quiz", {
            data: updateQuiz,
            status: true,
            message: "updated successfully",
          });
        } catch (error) {
          socket.emit("updated_quiz", {
            message: "Something went wrong",
            status: false,
          });
        }
      });
      socket.on("delete_quiz", async (data) => {
        s;
        try {
          const deleteQuiz = await quizModel.findByIdAndDelete(data._id);
          if (!deleteQuiz) {
            socket.emit("deleted_quiz", {
              message: "Something went wrong",
              status: false,
            });
            return;
          }
          socket.emit("deleted_quiz", {
            data: deleteQuiz,
            status: true,
            message: "deleted successfully",
          });
        } catch (error) {
          console.error(error);
          socket.emit("deleted_quiz", {
            message: "Something went wrong",
            status: false,
          });
        }
      });
    });
  });
};
