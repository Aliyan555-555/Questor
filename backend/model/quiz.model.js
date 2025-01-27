import mongoose from "mongoose";

// const questionSchema = new mongoose.Schema({
//   _id: { type: Number, required: true },
//   duration: { type: Number, required: true }, // Question duration in milliseconds
//   showQuestionDuration: { type: Number, required: true }, // Time to display the question
//   type: { type: String, required: true, enum: ["quiz", "other"], default: "quiz" },
//   media: { type: String, default: "" }, // Media URL (optional)
//   maximumMarks: { type: Number, required: true },
//   question: { type: String, required: true },
//   options: [{ type: String, required: true }], // List of answer options
//   answerIndex: [], // Indices of correct answers
//   attemptStudents: [], // List of attempts by students
//   results: [], // Results for this question
// });

const quizSchema = new mongoose.Schema({
  name: { type: String},
  description: {
    type: String,

  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   
  },
  coverImage: {
    type: String,
    default: "/images/defaultCover.png",
  },
  isPrivet: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "draft"],
    default: "draft",
  },
  theme:{
    type:mongoose.Types.ObjectId,
    ref: "Theme",
    
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
      required: true,
    },
  ],
});

const quizModel = mongoose.model("Quiz", quizSchema);

export default quizModel;
