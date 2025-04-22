import { roomModel } from "../model/room.model.js";
import quizModel from "../model/quiz.model.js";
import { questionResultModel } from './../model/questionResult.model.js';

export const GetAllReports = async (req, res) => {
  try {
    const teacher = req.params.id;
    const reportCount = parseInt(req.query.count, 10) || 0;

    // Fetch rooms for the teacher
    const rooms = await roomModel.find({ teacher,status:"completed" }).populate([
      { path: "quiz", populate: { path: "questions" } },
      { path: "teacher" },
      { path: "students" },
    ]);

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        message: "No rooms found for the given teacher",
        status: false,
      });
    }

    // Generate reports
    const reports = await Promise.all(
      rooms.map(async (room) => {
        const students = await Promise.all(
          room.students.map(async (student) => {
            const quiz = student.quiz
              ? await quizModel.findById(student.quiz).populate("questions")
              : null;

            return {
              nickname: student.nickname || "Unknown",
              score: student.score || 0,
              questions: quiz?.questions.map(async(q) =>{
                const result = await questionResultModel.find({

                });
                return {
                  _id:q._id,
                  question:q.question
                }
              } ) || [],
            };
          })
        );

        return {
          name: room.quiz?.name || "Unknown Quiz",
          endTime: room.updatedAt,
          numberOfParticipants: room.students?.length || 0,
          students,
          questions:
            room.quiz?.questions?.map((q) => ({
              question: q.question || "Unknown Question",
              type: q.type || "Unknown Type",
            })) || [],
        };
      })
    );

    // Limit the number of reports if `count` is provided
    const limitedReports =
      reportCount > 0 ? reports.slice(0, reportCount) : reports;

    res.status(200).json({
      message: "Successfully fetched all reports",
      status: true,
      reports: limitedReports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      status: false,
    });
  }
};
