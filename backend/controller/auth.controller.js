import nodemailer from "nodemailer";
import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import streamifier from "streamifier"
import { sendOTPEmail } from "../nodemilar.js";
export const SocialAuth = async (req, res) => {
  try {
    const user = req.body;
    let existingUser = await userModel.findOne({ email: user.email });
    if (!existingUser) {
      existingUser = await userModel.create(user);
    }

    await existingUser.populate("favorites");

    const token = jwt.sign(
      { email: existingUser.email, providerId: existingUser.providerId },
      "helloDev",
      { expiresIn: "1d" }
    );

    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: true,
      message: existingUser.isNew
        ? "User created and logged in successfully"
        : "User logged in successfully",
      data: {
        ...existingUser._doc,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const JWT_SECRET = "helloDev"; // Move this to environment variables in production

// User Signup
export const SignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .json({ status: false, message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT Token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set token as cookie
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// User Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    user.populate("favorites");
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: true,
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const ForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found with this email" });
    }
    const otp = await sendOTPEmail(email);
    res
      .status(200)
      .json({ status: true, message: "opt send successfully", otp: otp });
  } catch (error) {
    res.status(500).json({ status: false, message: "" });
  }
};

export const UpdatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOneAndUpdate(
      { email },
      { password: bcrypt.hashSync(password, 10) },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found with this email" });
    }
    res
      .status(200)
      .json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const AddOrRemoveFromFavorites = async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.favorites.includes(quizId)) {
      // If quiz is already in favorites, remove it
      const updatedUser = await userModel
        .findByIdAndUpdate(
          userId,
          { $pull: { favorites: quizId } },
          { new: true }
        )
        .populate("favorites");
      return res.status(200).json({
        status: true,
        message: "Removed from favorites successfully",
        favorites: updatedUser.favorites,
      });
    } else {
      // If quiz is not in favorites, add it
      const updatedUser = await userModel
        .findByIdAndUpdate(
          userId,
          { $push: { favorites: quizId } },
          { new: true }
        )
        .populate("favorites");
      return res.status(200).json({
        status: true,
        message: "Added to favorites successfully",
        favorites: updatedUser.favorites,
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message, error });
  }
};


// controllers/userController.js
import cloudinary from '../config/cloudinary.js';

export const EditProfile = async (req, res) => {
  try {
    const { email, name, prevEmail } = req.body;
    let profileImageUrl = req.body.profileImage;

    const userExist = await userModel.findOne({ email: prevEmail });
    if (!userExist) {
      return res.status(404).json({ message: 'Not found', status: false });
    }

    // If a new image is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'profile_pictures' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Upload failed', status: false });
          }

          const updatedUser = await userModel.findByIdAndUpdate(
            userExist._id,
            {
              email,
              name,
              profileImage: result.secure_url,
            },
            { new: true }
          );

          return res.status(200).json({
            message: 'User successfully updated',
            status: true,
            user: updatedUser,
          });
        }
      );

      // Convert buffer to stream for Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(result);
    } else {
      const updatedUser = await userModel.findByIdAndUpdate(
        userExist._id,
        { email, name, profileImage: profileImageUrl },
        { new: true }
      );

      return res.status(200).json({
        message: 'User successfully updated',
        status: true,
        user: updatedUser,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', status: false,error:error.message});
  }
};
