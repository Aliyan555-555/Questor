import mongoose from "mongoose";

const StudentResult = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
  },
  questionsResults: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"QuestionResult"
    },
  ],
});


export const StudentResultModel = mongoose.model("StudentResult",StudentResult);
