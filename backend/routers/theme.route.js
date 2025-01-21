import express from 'express';
import { GetAllThemes } from '../controller/theme.controller.js';

const ThemeRouter = express.Router();

ThemeRouter.get('/themes',GetAllThemes)

export default ThemeRouter;