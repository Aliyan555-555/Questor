import { userModel } from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const SocialAuth = async (req, res) => {
  try {
    const user = req.body;

    // Check if the user already exists
    const userExists = await userModel.findOne({ email: user.email });
    if (userExists) {
      return res.status(409).json({ status: false, message: "User already exists" });
    }

    // Create a new user
    const newUser = await userModel.create(user);

    // Generate a JWT token
    const token = jwt.sign(
      { email: newUser.email, providerId: newUser.providerId },
      "helloDev", // Use a secure key in a real environment, stored in an environment variable
      { expiresIn: "1d" } // Token expiration
    );

    // Set the token as a cookie
    res.cookie("session", token, {
      httpOnly: true, // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures cookies are sent over HTTPS in production
      sameSite: "lax", // Helps with CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Respond with success
    res.status(201).json({
      status: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name, // Assuming your model has a `name` field
        providerId: newUser.providerId,
      },
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ status: false, message: error.message });
  }
};
