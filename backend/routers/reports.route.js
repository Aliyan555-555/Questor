import express from "express"
import { GetAllReports } from "../controller/reports.controller.js";


const ReportsRouter = express.Router();


ReportsRouter.get('/:id',GetAllReports)




export default ReportsRouter;