import { roomModel } from "../model/room.model.js";

export const GetAllReports = async (req, res) => {
  try {
    const teacher = req.params.id;
    const reportCount = parseInt(req.query.count, 10) || 0;

    // Fetch rooms for the teacher
    const rooms = await roomModel
      .find({ teacher })
      .populate([
        { path: "quiz", populate: { path: "questions" } },
        { path: "teacher" },
        { path: "students",populate:[] },
      ]);

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        message: "No rooms found for the given teacher",
        status: false,
      });
    }

    // Generate reports
    const reports = rooms.map((room) => ({
      name: room.quiz?.name || "Unknown Quiz",
      endTime: room.updatedAt,
      numberOfParticipants: room.students?.length || 0,
      questions:
        room.quiz?.questions?.map((q) => ({
          question: q._doc.question,
          type: q._doc.type,
        })) || [],
    }));

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
