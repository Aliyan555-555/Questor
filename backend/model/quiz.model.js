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
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  }],
});

const quizModel = mongoose.model("Quiz", quizSchema);

export default quizModel;
