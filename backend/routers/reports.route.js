import express from "express"
import { EditReportName, GetAllReports } from "../controller/reports.controller.js";


const ReportsRouter = express.Router();


ReportsRouter.get('/:id',GetAllReports)
ReportsRouter.put('/:id',EditReportName)




export default ReportsRouter;