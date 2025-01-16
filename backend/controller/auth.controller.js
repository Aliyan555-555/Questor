import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const SocialAuth = async (req, res) => {
  try {
    const user = req.body;
    let existingUser = await userModel.findOne({ email: user.email });
    if (!existingUser) {
      existingUser = await userModel.create(user);
    }

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
      message: existingUser.isNew ? "User created and logged in successfully" : "User logged in successfully",
      data: {
        ...existingUser._doc
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
