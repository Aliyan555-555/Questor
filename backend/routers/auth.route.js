import express from "express";
import {
  Login,
  SignUp,
  SocialAuth,
  ForgetPassword,
  UpdatePassword,
  AddOrRemoveFromFavorites,
  EditProfile,
  AuthTokenVerification,
  Logout,
} from "../controller/auth.controller.js";
import upload from "../config/multer.js";

const AuthRouter = express.Router();
AuthRouter.post("/social/login", SocialAuth);
AuthRouter.post("/registration", SignUp);
AuthRouter.post("/login", Login);
AuthRouter.post("/logout", Logout);
AuthRouter.post("/forget", ForgetPassword);
AuthRouter.post("/forget/password", UpdatePassword);
AuthRouter.post("/favorites/:userId/:quizId", AddOrRemoveFromFavorites);
AuthRouter.put("/edit", upload.single("profileImage"), EditProfile);
AuthRouter.post("/verify-token", AuthTokenVerification);
// router.put('/profile', upload.single('profileImage'), EditProfile);

export default AuthRouter;
