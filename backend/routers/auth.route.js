import express from 'express';
import { Login, SignUp, SocialAuth,ForgetPassword,UpdatePassword, AddOrRemoveFromFavorites } from '../controller/auth.controller.js';

const AuthRouter  = express.Router();
AuthRouter.post("/social/login",SocialAuth)
AuthRouter.post("/registration",SignUp);
AuthRouter.post("/login",Login);
AuthRouter.post("/forget",ForgetPassword);
AuthRouter.post("/forget/password",UpdatePassword);
AuthRouter.post("/favorites/:userId/:quizId",AddOrRemoveFromFavorites);


export default AuthRouter