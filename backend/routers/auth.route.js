import express from 'express';
import { SocialAuth } from '../controller/auth.controller.js';

const AuthRouter  = express.Router();
AuthRouter.post("/social/login",SocialAuth)


export default AuthRouter