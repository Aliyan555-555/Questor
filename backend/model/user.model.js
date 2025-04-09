import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    default:"",
  },
  providerId:{
    type: String,
  },
  providerName:{
    type: String,
  },
  profileImage:{
    type: String,
    default: "https://asset.cloudinary.com/dtupoan8j/e155e87bd3a792bd964970dd61e6f693",
  },
  favorites:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Quiz",
    }
  ]
});

UserSchema.path("email").validate(async (value) => {
  const emailCount = await mongoose.models.User.countDocuments({
    email: value,
  });
  return !emailCount;
}, "Email already exists");

UserSchema.index({ email: 1, providerId: 1 });

export const userModel = mongoose.model("User", UserSchema);
