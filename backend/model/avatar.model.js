import mongoose from "mongoose";

// Sub-schema for colors
const ColorsSchema = new mongoose.Schema({
  lipColor: {
    type: String,
    required: true,
  },
  bodyColor: { type: String, required: true },
  chinColor: { type: String, required: true },
  teethType: { type: String, required: true }, // Assuming this is a type, not a color
  mouthColor: { type: String, required: true },
  pupilColor: { type: String, required: true },
  teethColor: { type: String, required: true },
  tongueColor: { type: String, required: true },
  eyeballColor: { type: String, required: true },
  eyebrowColor: { type: String, required: true },
  eyeBorderColor: { type: String, required: true },
});

// Main Avatar Schema
const AvatarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Removes leading and trailing spaces
      minlength: 2,
    },
    colors: {
      type: ColorsSchema,
      required: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const avatarModel = mongoose.model("Avatar", AvatarSchema);
