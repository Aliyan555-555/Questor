import mongoose from "mongoose";
import { Schema } from "mongoose";
const roomSchema = new Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    status: {
      type: String,
      enum: ["waiting", "started", "completed"],
      default: "waiting",
    },
    host: {
      type: String,
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pin: { type: String, required: true, unique: true },
    currentStage:{
      question:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "question",
      },
      stage: {
        type: Number,
        default: 1,
      },
      isLastStage:{
        type: Boolean,
        default: false,
      }
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: "Student",
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ quiz: 1, teacher: 1, createdAt: -1 });


export const roomModel = mongoose.model("Room", roomSchema);
