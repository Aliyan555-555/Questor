import mongoose from "mongoose";

// Sub-schema for colors
const ColorsSchema = new mongoose.Schema({
  lipColor: {
    type: String,
    required: true,
    match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, // Hex color validation
  },
  bodyColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  chinColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  teethType: { type: String, required: true }, // Assuming this is a type, not a color
  mouthColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  pupilColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  teethColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  tongueColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  eyeballColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  eyebrowColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
  eyeBorderColor: { type: String, required: true, match: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/ },
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
