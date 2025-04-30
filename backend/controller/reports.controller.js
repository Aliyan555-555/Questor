import { roomModel } from "../model/room.model.js";
import quizModel from "../model/quiz.model.js";
import { questionResultModel } from "../model/questionResult.model.js";
import generateExcel from "../lib/generateExcel.js";
import reportModel from "../model/report.model.js";

export const GetAllReports = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const rooms = await roomModel
      .find({ teacher: teacherId, status: "completed" })
      .sort({ updatedAt: -1 })
      .populate([
        {
          path: "quiz",
          populate: { path: "questions" },
        },
        { path: "teacher" },
        { path: "students" },
      ])
      .lean();

    if (!rooms.length) {
      return res.status(404).json({
        message: "No completed rooms found for the given teacher",
        status: false,
      });
    }
    const reports = await reportModel.find({
      roomId: { $in: rooms.map(r => r._id) }
    });
    

    // const reports = await Promise.all(
    //   rooms.map(async (room) => {
    //     const quiz = room.quiz;
    //     const roomId = room._id;
    //     const quizId = quiz?._id;

    //     const students = await Promise.all(
    //       room.students.map(async (student) => {
    //         const results = await questionResultModel
    //           .find({ room: roomId, quiz: quizId, student: student._id })
    //           .lean();
    //         const totalQuestions = quiz?.questions?.length || 0;
    //         const correctAnswersCount = results.filter(
    //           (r) => r.status === "correct"
    //         ).length;
    //         const unansweredQuestionsCount = results.filter(
    //           (r) => r.status === "timeUp"
    //         ).length;
    //         const correctAnswersPercentage =
    //           totalQuestions > 0
    //             ? Math.round((correctAnswersCount / totalQuestions) * 100)
    //             : 0;

    //         const questionsWithResults = quiz?.questions?.map((q) => {
    //           const resultForQuestion = results.filter(
    //             (r) => r.question?.toString() === q._id?.toString()
    //           );

    //           return {
    //             question: q.question || "Unknown",
    //             type: q.type || "Unknown",
    //             result: resultForQuestion[0] ?? null,
    //           };
    //         });

    //         return {
    //           nickname: student.nickname || "Unknown",
    //           score: Number(student.score).toFixed(0) || 0,
    //           rank: student.rank || 0,
    //           correctAnswers: correctAnswersPercentage,
    //           unansweredQuestions:
    //             unansweredQuestionsCount === 0 ? "_" : unansweredQuestionsCount,
    //           questions: questionsWithResults || [],
    //         };
    //       })
    //     );

    //     return {
    //       roomId: room._id,
    //       name: quiz?.name || "Unknown Quiz",
    //       status: room.status,
    //       endTime: room.updatedAt,
    //       numberOfParticipants: room.students?.length || 0,
    //       hostName: room.teacher.name,
    //       students,
    //       questions: await Promise.all(
    //         quiz?.questions?.map(async (q) => {
    //           const totalStudents = room.students?.length || 0;
    //           const correctCount = await questionResultModel.countDocuments({
    //             room: roomId,
    //             quiz: quizId,
    //             question: q._id,
    //             status: "correct",
    //           });

    //           const studentResults = await questionResultModel
    //             .find({
    //               room: roomId,
    //               quiz: quizId,
    //               question: q._id,
    //             })
    //             .populate("student", "nickname");
    //           const studentAnswers = studentResults.map((s) => s.answer);
    //           const correctAnswersPercentage =
    //             totalStudents > 0
    //               ? Math.round((correctCount / totalStudents) * 100)
    //               : 0;
    //           return {
    //             question: q.question || "Unknown Question",
    //             type: q.type || "Unknown Type",
    //             correctAnswersPercentage,
    //             studentAnswers,
    //             students: studentResults,
    //             ...q,
    //             options: [...q.options, "No answer"],
    //           };
    //         }) || []
    //       ),
    //     };
    //   })
    // );

    res.status(200).json({
      message: "Successfully fetched all reports",
      status: true,
      reports: reports,
    });
  } catch (error) {
    console.error("Error in GetAllReports:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      status: false,
    });
  }
};

export const GetReportDataWithId = async (id) => {
  const room = await roomModel.findById(id).populate([
    {
      path: "quiz",
      populate: { path: "questions" },
    },
    { path: "teacher" },
    { path: "students" },
  ])
  const quiz = room.quiz;
  const roomId = room._id;
  const quizId = quiz?._id;

  const students = await Promise.all(
    room.students.map(async (student) => {
      const results = await questionResultModel
        .find({ room: roomId, quiz: quizId, student: student._id })
        .lean();
      const totalQuestions = quiz?.questions?.length || 0;
      const correctAnswersCount = results.filter(
        (r) => r.status === "correct"
      ).length;
      const unansweredQuestionsCount = results.filter(
        (r) => r.status === "timeUp"
      ).length;
      const correctAnswersPercentage =
        totalQuestions > 0
          ? Math.round((correctAnswersCount / totalQuestions) * 100)
          : 0;

      const questionsWithResults = quiz?.questions?.map((q) => {
        const resultForQuestion = results.filter(
          (r) => r.question?.toString() === q._id?.toString()
        );

        return {
          question: q.question || "Unknown",
          type: q.type || "Unknown",
          result: resultForQuestion[0] ?? null,
        };
      });

      return {
        nickname: student.nickname || "Unknown",
        score: Number(student.score).toFixed(0) || 0,
        rank: student.rank || 0,
        correctAnswers: correctAnswersPercentage,
        unansweredQuestions:
          unansweredQuestionsCount === 0 ? "_" : unansweredQuestionsCount,
        questions: questionsWithResults || [],
      };
    })
  );
  return {
    roomId: room._id,
    name: quiz?.name || "Unknown Quiz",
    status: room.status,
    endTime: room.updatedAt,
    numberOfParticipants: room.students?.length || 0,
    hostName: room.teacher.name,
    students,
    questions: await Promise.all(
      quiz?.questions?.map(async (q) => {
        const totalStudents = room.students?.length || 0;
        const correctCount = await questionResultModel.countDocuments({
          room: roomId,
          quiz: quizId,
          question: q._id,
          status: "correct",
        });

        const studentResults = await questionResultModel
          .find({
            room: roomId,
            quiz: quizId,
            question: q._id,
          })
          .populate("student", "nickname");
        const studentAnswers = studentResults.map((s) => s.answer);
        const correctAnswersPercentage =
          totalStudents > 0
            ? Math.round((correctCount / totalStudents) * 100)
            : 0;
        return {
          question: q.question || "Unknown Question",
          type: q.type || "Unknown Type",
          correctAnswersPercentage,
          studentAnswers,
          students: studentResults,
          ...q,
          options: [...q.options, "No answer"],
        };
      }) || []
    ),
  };
};
export const EditReportName = async (req, res) => {
  try {
    const reportId = req.params.id;
    const newName = req.body.name;

    if (!newName || typeof newName !== "string") {
      return res.status(400).json({
        message: "Invalid or missing 'name' in request body",
        status: false,
      });
    }

    const updatedReport = await reportModel.findByIdAndUpdate(
      reportId,
      { name: newName },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        message: "Report not found",
        status: false,
      });
    }

    res.status(200).json({
      message: "Report name updated successfully",
      status: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error in EditReportName:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      status: false,
    });
  }
};