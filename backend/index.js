import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import AuthRouter from "./routers/auth.route.js";
import connectToMongodb from "./database/index.js";
import dotenv from "dotenv";
// import quizModel from "./model/quiz.model.js";
import ThemeRouter from "./routers/theme.route.js";
import QuizRouter from "./routers/quiz.router.js";
import compression from "compression";
// import os from "os";
// import jwt from "jsonwebtoken";
// import fs from "fs";
import { avatarModel } from "./model/avatar.model.js";
// import { questionModel } from "./model/question.model.js";
// import { roomModel } from "./model/room.model.js";
import { itemModel } from "./model/item.model.js";
// import { studentModel } from "./model/studentModel.js";
// import { questionResultModel } from "./model/questionResult.model.js";
// import cloudinary from "cloudinary";
// import axios from "axios";
import session from "express-session";
// import cluster from "cluster";
import ReportsRouter from "./routers/reports.route.js";
import MongoStore from "connect-mongo";
// import { GetReportDataWithId } from "./controller/reports.controller.js";
// import reportModel from "./model/report.model.js";
// import generateStyledExcel from "./lib/generateExcel.js";
// import { setupQuizSocket } from "./handler/setupQuizSocket.js";
import { setupGameSocket } from "./handler/setupGameSocket.js";
// const cpuCount = os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`🧠 Master ${process.pid} is running with ${cpuCount} CPUs`);

//   for (let i = 0; i < cpuCount; i++) {
//     cluster.fork();
//   }
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else{

// import { ResultModel } from "./model/result.model.js";

dotenv.config();
const app = express();
connectToMongodb();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://localhost:8000",
  "http://dev.meteoricsolutions.com:8000",
  "http://dev.meteoricsolutions.com:9000",
  "http://questor.meteoricsolutions.com",
  "https://questor.meteoricsolutions.com",
  process.env.FRONTEND_URL,
];

// console.log(cpuCount)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(compression());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  pingInterval: 25000,
  pingTimeout: 50000,
});

app.get("/api/v1/avatars", async (req, res) => {
  try {
    const avatars = await avatarModel.find();
    const items = await itemModel.find();
    res.status(200).json({ items, avatars, status: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching avatars", error, status: false });
  }
});
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1", ThemeRouter);
app.use("/api/v1/reports", ReportsRouter);

app.use("/api/v1/quiz", QuizRouter);
const roomPins = {};
const generatePin = () => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (roomPins[pin]);
  return pin;
};

io.use((socket, next) => {
  // Use the session middleware for socket connections
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })(socket.request, {}, next);
});

io.on("connection", (socket) => {

setupGameSocket(io)
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on link http://localhost:${PORT}`);
});

// }
