import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  duration: { type: Number },
  showQuestionDuration: { type: Number},
  type: { type: String, enum: ["quiz", "true/false",'slider','typeanswer'], default: "quiz" },
  media: { type: String, default: "" },
  isMultiSelect:{type: Boolean, default:false},
  maximumMarks: { type: Number },
  question: { type: String},
  options: [{ type: String}],
  answerIndex: [],
  attemptStudents: [],
  results: [],
});

export const questionModel =  mongoose.model("question", questionSchema);