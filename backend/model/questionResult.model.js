import mongoose from "mongoose";

const QuestionResultSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "room",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "quizzes",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "questions",
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  status:{
    type: String,
    enum: ["correct", "wrong","timeUp"]
  }
  // result: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "result",
  //   required: true,
  // },
}, { timestamps: true });

export const questionResultModel = mongoose.model("QuestionResult", QuestionResultSchema);
