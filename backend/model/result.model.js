import mongoose from "mongoose";

const ResultSchema = mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"StudentResult"
    },
  ],
});

export const ResultModel = mongoose.model("result", ResultSchema);
