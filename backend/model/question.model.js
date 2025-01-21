import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  duration: { type: Number },
  showQuestionDuration: { type: Number},
  type: { type: String, enum: ["quiz", "other"], default: "quiz" },
  media: { type: String, default: "" },
  maximumMarks: { type: Number },
  question: { type: String},
  options: [{ type: String}],
  answerIndex: [],
  attemptStudents: [],
  results: [],
});

export const questionModel =  mongoose.model("question", questionSchema);