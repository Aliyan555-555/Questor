import express from 'express';
import { Login, SignUp, SocialAuth,ForgetPassword,UpdatePassword } from '../controller/auth.controller.js';

const AuthRouter  = express.Router();
AuthRouter.post("/social/login",SocialAuth)
AuthRouter.post("/registration",SignUp);
AuthRouter.post("/login",Login);
AuthRouter.post("/forget",ForgetPassword);
AuthRouter.post("/forget/password",UpdatePassword);


export default AuthRouter