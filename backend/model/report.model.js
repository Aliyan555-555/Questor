import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    excelFile:{type:String,default:null},
    room: { type: String, required: true },
    quiz: { type: String, required: true },
    student: { type: String, required: true },
    question: { type: String, required: true },
    score: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    timeSpend: { type: Number, default: 0 },
    answer: { type: String, required: true },
    status: { type: String, required: true }, // e.g. 'timeUp'
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const StudentQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: { type: String, required: true },
    result: ResultSchema,
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    nickname: { type: String },
    score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    unansweredQuestions: { type: String, default: 0 },
    questions: [StudentQuestionSchema],
  },
  { _id: false }
);

const QuestionStudentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    room: { type: String, required: true },
    quiz: { type: String, required: true },
    student: {
      _id: { type: String, required: true },
      nickname: { type: String, required: true },
    },
    question: { type: String, required: true },
    score: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    timeSpend: { type: Number, default: 0 },
    answer: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: String, required: true },
    correctAnswersPercentage: { type: Number, default: 0 },
    studentAnswers: [{ type: String }],
    students: [QuestionStudentSchema],
    duration: { type: Number, default: 5 },
    showQuestionDuration: { type: Number, default: 0 },
    media: { type: String },
    isMultiSelect: { type: Boolean, default: false },
    maximumMarks: { type: Number, default: 0 },
    options: [{ type: String }],
    answerIndex: [{ type: Number }],
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    roomId: { type: String },
    name: { type: String, required: true },
    status: { type: String, required: true },
    endTime: { type: String, required: true },
    numberOfParticipants: { type: Number, default: 0 },
    hostName: { type: String, required: true },
    students: [StudentSchema],
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
