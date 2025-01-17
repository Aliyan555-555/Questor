import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  showQuestionDuration: { type: Number, required: true },
  type: { type: String, required: true, enum: ["quiz", "other"], default: "quiz" },
  media: { type: String, default: "" },
  maximumMarks: { type: Number, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: [],
  attemptStudents: [],
  results: [],
});

export const questionModel =  mongoose.model("question", questionSchema);