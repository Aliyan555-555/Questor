import mongoose from "mongoose";

const StudentSchema = new  mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Avatar",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  attemptQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  rank: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  activeQuestion:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  socketId:{
    type: String,
    required: true,
  },
  isActive:{
    type:Boolean,
    default:true
  }
});

export const studentModel = mongoose.model("Student", StudentSchema);
