import mongoose from "mongoose";

const QuestionResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true, // Ensure a student is always associated
    },
    hasAttempted: {
        type: Boolean,
        default: false, // Default value for whether the question was attempted
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true, // Ensure a question is always associated
    },
    timeTaken: {
        type: Number,
        default: 0, // Default to 0 if no time is recorded
        min: 0, // Ensure time taken cannot be negative
    },
    score: {
        type: Number,
        default: 0, // Default score is 0
        min: 0, // Ensure score cannot be negative
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

export const QuestionResultModel = mongoose.model(
    "QuestionResult",
    QuestionResultSchema
);
