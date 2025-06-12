// kahoot/src/socket/gameSocket.ts
import { Server, Socket } from "socket.io";
import { roomModel } from "../model/room.model.js";
import { studentModel } from "../model/studentModel.js";
import { questionModel } from "../model/question.model.js";
import { questionResultModel } from "../model/questionResult.model.js";
import { avatarModel } from "../model/avatar.model.js";
import { itemModel } from "../model/item.model.js";
import jwt from "jsonwebtoken";

// Authentication middleware for game sockets
export const gameAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    // if (!token) {
    //   return next(new Error("Authentication token required"));
    // }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // socket.user = decoded;
    // next();

    console.log("token",token)
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

// Game socket event handlers
export const setupGameSocket = (io) => {
  const gameIo = io.of("/");

  // Apply auth middleware to game namespace
  gameIo.use(gameAuthMiddleware);

  gameIo.on("connection", (socket) => {
    socket.on("tryReconnect", async ({ token, time }) => {
    if (token && time) {
      const decode = jwt.decode(token);
      if (decode) {
        const room = await roomModel.findById(decode.roomId).populate([
          {
            path: "quiz",
            populate: [{ path: "questions" }, { path: "theme" }],
          },
          {
            path: "students",
            populate: [
              { path: "avatar" },
              { path: "item" },
              {
                path: "quiz",
                populate: [{ path: "questions" }, { path: "theme" }],
              },
              { path: "room" },
            ],
          },
        ]);
        if (room) {
          const isStudentExist = room.students.find(
            (s) => s._id.toString() === decode.studentId
          );
          console.log("trying to reconnect", room, isStudentExist);
          if (isStudentExist) {
            const student = await studentModel
              .findById(decode.studentId)
              .populate([
                {
                  path: "avatar",
                },
                {
                  path: "item",
                },
                {
                  path: "room",
                },
                {
                  path: "quiz",
                  populate: [
                    {
                      path: "questions",
                    },
                    {
                      path: "theme",
                    },
                  ],
                },
              ]);
            if (student) {
              student.isActive = true;
              room.students.push(student._id);
              await student.save();
              await room.save();
              await room.populate({
                path: "students",
                populate: [
                  { path: "avatar" },
                  { path: "item" },
                  {
                    path: "quiz",
                    populate: [
                      {
                        path: "questions",
                      },
                      {
                        path: "theme",
                      },
                    ],
                  },
                ],
              });
              socket.join(room._id.toString());
              io.to(room._id.toString()).emit("studentJoined", {
                students: room.students,
                data: room,
              });
              socket.emit("reconnectionAttempt", {
                status: true,
                currentStage: room.currentStage,
                roomStatus: room.status,
                student,
              });
              console.log({
                status: true,
                currentStage: room.currentStage,
                join: {
                  roomId: room._id,
                  student,
                  refreshToken: token,
                },
              });
            } else {
              socket.emit("reconnectionAttempt", {
                status: false,
                message: "student not exist",
              });
              console.log("student not exist");
            }
          }
        } else {
          socket.emit("reconnectionAttempt", {
            status: false,
            message: "Room already completed",
          });
          console.log("Room already completed");
        }
      } else {
        socket.emit("reconnectionAttempt", {
          status: false,
          message: "user token not perfect",
        });
        console.log("user token not perfect");
      }
    } else {
      socket.emit("reconnectionAttempt", {
        status: false,
        message: "token or time not provided",
      });
      console.log("token or time not provided");
    }
  });
  socket.on("calculate_ranks", async (data) => {
    const room = await roomModel.findById(data.roomId).populate([
      {
        path: "quiz",
        populate: [{ path: "questions" }, { path: "theme" }],
      },
      {
        path: "students",
        populate: [
          { path: "avatar" },
          { path: "item" },
          {
            path: "quiz",
            populate: [{ path: "questions" }, { path: "theme" }],
          },
          { path: "room" },
        ],
      },
    ]);

    const sortedStudents = room.students
      .sort((a, b) => b.score - a.score)
      .map((student, index) => student._id);
    // sortedStudents.forEach((student, index) => {
    //   student.rank = index + 1;
    // });

    // room.students = sortedStudents;
    // room.status = "completed";
    // await room.save();
    await roomModel.findByIdAndUpdate(
      room._id,
      { status: "completed", students: sortedStudents },
      { new: true, runValidators: true }
    );
    await room.populate([
      {
        path: "students",
        populate: [
          {
            path: "avatar",
          },
          {
            path: "item",
          },
        ],
      },
      {
        path: "quiz",
      },
      {
        path: "teacher",
      },
    ]);
    const report = await GetReportDataWithId(room._id);
    const r = await reportModel.create(report);
    console.log(r);
    io.to(room._id.toString()).emit("calculate_ranks_student", {
      students: room.students,
      data: room,
    });
  });
  socket.on("start", async (roomId) => {
    console.log(roomId);
    const room = await roomModel.findByIdAndUpdate(
      roomId,
      { status: "started" },
      { new: true }
    );
    // const result = await ResultModel.create
    io.to(room._id.toString()).emit("started", { data: room });
  });
  socket.on("submit_answer", async (data) => {
    try {
      const room = await roomModel.findById(data.room).populate({
        path: "students",
        populate: [{ path: "avatar" }, { path: "item" }],
      });

      if (!room) {
        console.error(`Room with ID ${data.room} not found.`);
        return;
      }

      const question = await questionModel.findById(data.question);
      if (!question) {
        console.error(`Question with ID ${data.question} not found.`);
        return;
      }

      const student = await studentModel.findById(data.student);
      if (!student) {
        console.error(`Student with ID ${data.student} not found.`);
        return;
      }

      let getScore = 0;
      let isCorrect = false;

      const isAttempted = await questionResultModel.findOne({
        room: room._id,
        student: data.student,
        question: data.question,
      });

      if (isAttempted) {
        console.log(
          `Student ${student._id} has already attempted this question.`
        );
        return;
      }

      if (data.isTimeUp) {
        console.log(
          `Student ${student._id} ran out of time for question ${question._id}.`
        );
        await questionResultModel.create({
          room: room._id,
          quiz: room.quiz,
          student: data.student,
          question: data.question,
          score: getScore,
          timeSpend: data.timeSpent,
          answer: "No answer",
          totalScore: student.score,
          status: "timeUp",
        });
      } else {
        student.attemptQuestions.push(question._id);

        isCorrect = question.answerIndex.every((index) =>
          data.options.includes(question.options[index])
        );

        if (isCorrect) {
          const totalMarks = question.maximumMarks;
          const perSecondMarks = totalMarks / question.duration;
          getScore = data.timeSpent * perSecondMarks;
          student.score += getScore;

          await questionResultModel.create({
            room: room._id,
            quiz: room.quiz,
            student: data.student,
            answer: data.options[0],
            timeSpend: data.timeSpent,
            question: data.question,
            score: getScore,
            totalScore: student.score,
            status: "correct",
          });
        } else {
          await questionResultModel.create({
            room: room._id,
            quiz: room.quiz,
            student: data.student,
            question: data.question,
            answer: data.options[0],
            timeSpend: data.timeSpent,
            score: getScore,
            totalScore: student.score,
            status: "wrong",
          });
        }

        await student.save();
      }

      // 🛠️ Update student ranks properly
      const studentsInRoom = await studentModel
        .find({ _id: { $in: room.students.map((s) => s._id) } })
        .sort({ score: -1 });

      let currentRank = 1;
      let previousScore = null;
      let sameRankCount = 0;

      for (let i = 0; i < studentsInRoom.length; i++) {
        const currentStudent = studentsInRoom[i];

        if (previousScore !== null && currentStudent.score === previousScore) {
          sameRankCount++;
        } else {
          currentRank = i + 1;
          sameRankCount = 0;
        }

        currentStudent.rank = currentRank;
        await currentStudent.save();
        previousScore = currentStudent.score;
      }

      // 🔥 Get current student's updated rank
      const updatedStudent = await studentModel.findById(student._id);

      io.to(room._id.toString()).emit("receiveStudentResult", {
        student: updatedStudent._id,
        score: updatedStudent.score,
        question: question._id,
        rank: updatedStudent.rank,
      });

      socket.emit("result", {
        question: question._id,
        isCorrect,
        isTimeUp: data.isTimeUp,
        rank: updatedStudent.rank,
        currentScore: getScore,
        score: updatedStudent.score,
      });
    } catch (error) {
      console.error("❌ Error processing answer submission:", error);
    }
  });

  socket.on("student_waiting", () => {
    // console.log("student_waiting")
    io.emit("student_waiting");
  });
  socket.on("setCount", (count) => {
    io.to(count.roomId).emit("setCount", {
      duration: count.duration,
      count: count.count,
    });
  });
  socket.on("next_question_redirect", (data) => {
    io.to(data.roomId).emit("next_question_redirection");
  });
  socket.on(
    "checkUserInRoom",
    async ({ roomId, studentData, token, stage = 0 }) => {
      const room = await roomModel.findById(roomId);
      if (!room) {
        socket.emit("userInRoom", { status: false });
        console.error(`Room with ID ${roomId} not found.`);
        return;
      }

      const studentExist = room.students.includes(studentData.student._id);
      if (studentExist) {
        socket.emit("userInRoom", { status: true });
      } else {
        socket.emit("userInRoom", { status: false });
      }
    }
  );
  socket.on("changeCharacter", async (data) => {
    const avatar = await avatarModel.findById(data.selectedAvatarId);
    const room = await roomModel.findById(data.roomId).populate({
      path: "quiz",
      populate: [{ path: "questions" }, { path: "theme" }],
    });
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    if (!avatar) return;
    const student = await studentModel.findByIdAndUpdate(
      data.student._id,
      {
        avatar: avatar._id,
      },
      { new: true }
    );
    if (!student) return;
    (await (await student.populate("avatar")).populate("item")).populate(
      "quiz"
    );
    await room.populate({
      path: "students",
      populate: [{ path: "avatar" }, { path: "item" }],
    });
    io.to(room._id.toString()).emit("changedStudentCharacter", {
      students: room.students,
      room,
      student: student,
    });
    socket.emit("changedYourCharacter", {
      student: student,
      room,
    });
  });
  socket.on("changeCharacterAccessories", async (data) => {
    const selectedAccessories = await itemModel.findById(
      data.selectedAccessoriesId
    );
    const room = await roomModel.findById(data.roomId).populate([
      { path: "quiz", populate: [{ path: "theme" }, { path: "questions" }] },
      { path: "students", populate: [{ path: "avatar" }, { path: "item" }] },
    ]);
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    if (!selectedAccessories) {
      console.error(`Accessories with ID ${data.selectedAvatarId} not found.`);
      return;
    }
    const student = await studentModel
      .findByIdAndUpdate(
        data.student._id,
        { item: data.selectedAccessoriesId },
        { new: true }
      )
      .populate([
        {
          path: "avatar",
        },
        {
          path: "item",
        },
      ]);
    io.to(room._id.toString()).emit("changedStudentCharacterAccessories", {
      students: room.students,
      room,
      student: student,
    });
    socket.emit("changedYourCharacterAccessories", {
      student: student,
      room,
    });
  });

  // socket.on("add_question", async (data) => {

  //   try {
  //     const { id, type } = data;
  //     const question = await questionModel.create({
  //       duration: 30,
  //       type: type,
  //       showQuestionDuration: 2000,
  //       media: "",
  //       options: ["", "", "", ""],
  //       answerIndex: [],
  //       attemptStudents: [],
  //       results: [],
  //       maximumMarks: 1000,
  //       question: "",
  //     });
  //     const updatedQuiz = await quizModel
  //       .findByIdAndUpdate(
  //         id,
  //         { $push: { questions: question._id } },
  //         { new: true }
  //       )
  //       .populate("questions")
  //       .populate("theme");

  //     socket.emit("question_added", {
  //       data: updatedQuiz,
  //       status: true,
  //       message: "added question successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error adding question:", error);
  //     socket.emit("question_added", {
  //       message: "Failed to add question",
  //       status: false,
  //     });
  //   }
  // });
  // socket.on("create_quiz", async (data) => {
  //   try {
  //     // Create a question
  //     const question = await questionModel.create({
  //       duration: 30,
  //       type: "quiz",
  //       showQuestionDuration: 2000,
  //       media: "",
  //       options: ["", "", "", ""],
  //       answerIndex: [],
  //       attemptStudents: [],
  //       results: [],
  //       maximumMarks: 1000,
  //       question: "",
  //     });

  //     if (!question) {
  //       socket.emit("created_quiz", {
  //         message: "Failed to create question",
  //         status: false,
  //       });
  //       return;
  //     }
  //     const newQuiz = await quizModel.create({
  //       ...data,
  //       questions: [question._id],
  //     });

  //     if (!newQuiz) {
  //       socket.emit("created_quiz", {
  //         message: "Failed to create quiz",
  //         status: false,
  //       });
  //       return;
  //     }
  //     const populatedQuiz = await (
  //       await newQuiz.populate("questions")
  //     ).populate("theme");
  //     socket.emit("created_quiz", {
  //       data: populatedQuiz,
  //       status: true,
  //       message: "Quiz created successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error during quiz creation:", error);
  //     socket.emit("created_quiz", {
  //       message: "Something went wrong during quiz creation",
  //       status: false,
  //     });
  //   }
  // });
  // socket.on("set_question_value", async (data) => {
  //   try {
  //     const quiz = await quizModel
  //       .findOne({ _id: data._id })
  //       .populate("questions")
  //       .populate("theme");

  //     if (!quiz) {
  //       socket.emit("set_question_value", {
  //         status: false,
  //         message: "Quiz not found",
  //       });
  //       return;
  //     }
  //     const question = await questionModel.findOneAndUpdate(
  //       { _id: data.questionId },
  //       { question: data.value },
  //       { new: true }
  //     );

  //     if (!question) {
  //       socket.emit("set_question_value", {
  //         status: false,
  //         message: "Question not found",
  //       });
  //       return;
  //     }

  //     socket.emit("set_question_value", {
  //       status: true,
  //       message: "Question updated successfully",
  //       data: quiz,
  //       question
  //     });
  //   } catch (error) {
  //     console.error("Error updating question:", error);
  //     socket.emit("set_question_value", {
  //       status: false,
  //       message: "An error occurred while updating the question",
  //     });
  //   }
  // });
  // socket.on("fetch_quiz", async (data) => {
  //   try {
  //     console.log("works", data);
  //     if (!data._id) {
  //       socket.emit("fetched_quiz", {
  //         status: false,
  //         message: "Id is required",
  //       });
  //       return;
  //     }

  //     const quiz = await quizModel
  //       .findOne({ _id: data._id })
  //       .populate("questions")
  //       .populate("theme");
  //     if (!quiz) {
  //       socket.emit("feched_quiz", {
  //         status: false,
  //         message: "Quiz not found",
  //       });
  //       return;
  //     }
  //     socket.emit("feched_quiz", {
  //       status: true,
  //       message: "Quiz fetched successfully",
  //       data: quiz,
  //     });
  //   } catch (error) {
  //     socket.emit("feched_quiz", {
  //       status: false,
  //       message: "Something went wrong",
  //     });
  //   }
  // });
  // socket.on("delete_question_in_quiz", async (data) => {
  //   try {
  //     const quiz = await quizModel
  //       .findById(data._id)
  //       .populate("questions")
  //       .populate("theme");

  //     if (!quiz) {
  //       socket.emit("deleted_question_in_quiz", {
  //         message: "Quiz not found",
  //         status: false,
  //       });
  //       return;
  //     }
  //     quiz.questions = quiz.questions.filter(
  //       (question) => question._id.toString() !== data.questionId
  //     );
  //     await quiz.save();
  //     const updatedQuiz = await quiz;
  //     socket.emit("deleted_question_in_quiz", {
  //       data: updatedQuiz,
  //       message: "Question deleted successfully",
  //       status: true,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting question from quiz:", error);
  //     socket.emit("deleted_question_in_quiz", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //   }
  // });
  // socket.on("update_question_media", async (data) => {
  //   try {
  //     // Update the question media and return the updated document
  //     const question = await questionModel.findByIdAndUpdate(
  //       data.questionId,
  //       { media: data.media },
  //       { new: true }
  //     );

  //     if (!question) {
  //       socket.emit("updated_question_media", {
  //         message: "Question not found",
  //         status: false,
  //       });
  //       return;
  //     }

  //     // Emit the updated question data
  //     socket.emit("updated_question_media", {
  //       data: question,
  //       message: "Question media updated successfully",
  //       status: true,
  //     });
  //   } catch (error) {
  //     // Handle errors
  //     socket.emit("updated_question_media", {
  //       message: "Something went wrong",
  //       status: false,
  //       error: error.message, // Include error details for debugging
  //     });
  //   }
  // });
  // socket.on("update_question", async (data) => {
  //   const question = await questionModel.findByIdAndUpdate(data._id, data, {
  //     new: true,
  //   });
  //   if (!question) {
  //     socket.emit("updated_question", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //     return;
  //   }
  //   socket.emit("updated_question", {
  //     data: question,
  //     message: "Updated successfully",
  //     status: true,
  //   });
  // });
  // socket.on("update_theme", async (data) => {
  //   const { id, theme } = data;
  //   const updatedQuiz = await quizModel
  //     .findByIdAndUpdate(id, { theme }, { new: true })
  //     .populate("questions")
  //     .populate("theme");
  //   if (!updatedQuiz) {
  //     socket.emit("updated_theme", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //     return;
  //   }
  //   socket.emit("updated_theme", {
  //     data: updatedQuiz,
  //     message: "Updated successfully",
  //     status: true,
  //   });
  // });
  // socket.on("update_quiz_status", async (data) => {
  //   const { id, status } = data;
  //   const updatedQuiz = await quizModel
  //     .findByIdAndUpdate(id, { status }, { new: true })
  //     .populate("questions")
  //     .populate("theme");
  //   if (!updatedQuiz) {
  //     socket.emit("updated_quiz_status", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //     return;
  //   }
  //   socket.emit("updated_quiz", {
  //     data: updatedQuiz,
  //     message: "Updated successfully",
  //     status: true,
  //   });
  // });
  // socket.on("update_quiz", async (data) => {
  //   try {
  //     const updateQuiz = await quizModel
  //       .findByIdAndUpdate(data._id, data, { new: true })
  //       .populate("questions")
  //       .populate("theme");
  //     if (!updateQuiz) {
  //       socket.emit("updated_quiz", {
  //         message: "Something went wrong",
  //         status: false,
  //       });
  //       return;
  //     }
  //     socket.emit("updated_quiz", {
  //       data: updateQuiz,
  //       status: true,
  //       message: "updated successfully",
  //     });
  //   } catch (error) {
  //     socket.emit("updated_quiz", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //   }
  // });
  // socket.on("delete_quiz", async (data) => {s
  //   try {
  //     const deleteQuiz = await quizModel.findByIdAndDelete(data._id);
  //     if (!deleteQuiz) {
  //       socket.emit("deleted_quiz", {
  //         message: "Something went wrong",
  //         status: false,
  //       });
  //       return;
  //     }
  //     socket.emit("deleted_quiz", {
  //       data: deleteQuiz,
  //       status: true,
  //       message: "deleted successfully",
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     socket.emit("deleted_quiz", {
  //       message: "Something went wrong",
  //       status: false,
  //     });
  //   }
  // });



  socket.on("disconnect", async (reason) => {
    if (socket.teacher) {
      const room = await roomModel.deleteMany({
        teacher: socket.teacher._id,
        status: { $in: ["waiting", "started"] },
        isActive: true,
      });
      io.emit("roomDeleted");
      console.log(room);
      return;
    }

    if (socket.student) {
      try {
        const student = await studentModel.findById(socket.student._id);

        if (!student) {
          console.error("❌ Student not found.");
          return;
        }
        student.isActive = false;
        await student.save();
        const room = await roomModel.findById(student.room);
        if (!room) {
          console.error("❌ Room not found.");
          return;
        }

        if (room.status === "waiting") {
          room.students = room.students.filter(
            (s) => s.toString() !== student._id.toString()
          );
          await room.save();
          await room.populate([
            {
              path: "quiz",
              populate: [{ path: "questions" }, { path: "theme" }],
            },
            {
              path: "students",
              populate: [
                { path: "avatar" },
                { path: "item" },
                {
                  path: "quiz",
                  populate: [{ path: "questions" }, { path: "theme" }],
                },
                { path: "room" },
              ],
            },
          ]);
          socket.emit("inactive", { student: student });
          socket.leave(room._id.toString());
          io.to(room._id.toString()).emit("studentJoined", {
            students: room.students,
          });
          console.log(
            `🚪 Student ${student._id} removed from room ${room._id}`
          );
        } else if (room.status === "started") {
          await room.populate({
            path: "students",
            populate: [{ path: "avatar" }, { path: "item" }, { path: "quiz" }],
          });
          socket.emit("inactive", { student: student });
          socket.leave(room._id.toString());
          io.to(room._id.toString()).emit("studentJoined", {
            data: room,
            students: room.students,
          });
        }
      } catch (error) {
        console.error("❌ Error removing student:", error);
      }
    }
  });
  });
};
