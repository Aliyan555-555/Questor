import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import AuthRouter from "./routers/auth.route.js";
import connectToMongodb from "./database/index.js";
import dotenv from "dotenv";
import quizModel from "./model/quiz.model.js";
import ThemeRouter from "./routers/theme.route.js";
import QuizRouter from "./routers/quiz.router.js";
import compression from "compression";
import os from "os";
import jwt from "jsonwebtoken";
// import fs from "fs";
import { avatarModel } from "./model/avatar.model.js";
import { questionModel } from "./model/question.model.js";
import { roomModel } from "./model/room.model.js";
import { itemModel } from "./model/item.model.js";
import { studentModel } from "./model/studentModel.js";
import { questionResultModel } from "./model/questionResult.model.js";
// import cloudinary from "cloudinary";
// import axios from "axios";
import session from "express-session";
import cluster from "cluster";
import ReportsRouter from "./routers/reports.route.js";
import MongoStore from "connect-mongo";
const cpuCount = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🧠 Master ${process.pid} is running with ${cpuCount} CPUs`);

  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else{


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



console.log(cpuCount)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
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
app.use("/api/v1/reports",ReportsRouter)

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
  socket.on("createRoom", async ({ quizId, teacherId }) => {
    try {
      if (!socket.request.session) {
        console.log("Session not available");
        return socket.emit("error", { message: "Session not available" });
      }
      socket.teacher = {
        _id: teacherId,
        socket: socket.id,
        quiz: quizId,
      };
      const activeRooms = await roomModel.find({
        teacher: teacherId,
        status: { $in: ["waiting", "started"] },
        // host: socket.id,
        isActive: true,
      });
      if (activeRooms.length ) {
        console.log(activeRooms);
        return socket.emit("error", {
          message: "This teacher is already hosting a room",
          isReturnToHome:true
        });
      }
      const selectedQuiz = await quizModel
        .findById(socket.teacher.quiz)
        .populate("questions")
        .populate("theme");
      if (!selectedQuiz) {
        return socket.emit("error", { message: "Quiz not found" });
      }
      if (!selectedQuiz.questions.length) {
        return socket.emit("error", { message: "Quiz has no questions" });
      }
      let newRoom = await roomModel.create({
        host: socket.teacher.socket,
        quiz: socket.teacher.quiz,
        teacher: socket.teacher._id,
        status: "waiting",
        pin: generatePin(),
        currentStage: {
          question: selectedQuiz.questions[0]._id,
          stage: 1,
          isLastStage: false,
        },
        students: [],
      });

      newRoom = await newRoom.populate({
        path: "quiz",
        populate: [{ path: "questions" }, { path: "theme" }],
      });
      socket.teacher.room = newRoom._id;
      socket.join(newRoom._id.toString());
      socket.request.session.teacherId = socket.teacher._id;
      socket.request.session.roomId = newRoom._id;
      await socket.request.session.save();
      socket.emit("roomCreated", {
        roomId: newRoom._id,
        pin: newRoom.pin,
        data: newRoom,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", { message: "Server error", error: error.message });
    }
  });
  socket.on("reconnect_refresh_token", async ({ refreshToken }) => {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      console.log("🚀 ~ socket.on ~ decoded:", decoded)
      
      const room = await roomModel.findById(decoded.roomId);
      
      if (!room) {
        console.error("Room not found", decoded);
        return socket.emit("error", { message: "Room not found" });
      }

      // Fetch the student and populate necessary fields
      const student = await studentModel.findById(decoded.studentId).populate([
        { path: "quiz", populate: [{ path: "theme" }, { path: "questions" }] },
        { path: "room", populate: { path: "currentStage", populate: { path: "question" } } },
        { path: "avatar" },
        { path: "item" },
        { path: "activeQuestion" },
      ]);

      if (!student) {
        console.error("Student not found", decoded);
        return socket.emit("error", { message: "Student not found" });
      }

      // Update student status
      student.isActive = true;
      await student.save();

      console.log("Reconnecting request", {
        student: student.nickname,
        room: room._id,
        time: new Date().toLocaleString(),
      });

      // Populate room data
      await room.populate([
        {
          path: "quiz",
          populate: [{ path: "questions" }, { path: "theme" }],
        },
        {
          path: "students",
          populate: [
            { path: "avatar" },
            { path: "item" },
            {
              path: "quiz",
              populate: [{ path: "questions" }, { path: "theme" }],
            },
            { path: "room" },
          ],
        },
      ]);

      // Join the student to the room
      socket.join(room._id.toString());
      socket.student = student;

      // Emit joinedRoom event with updated data
      socket.emit("joinedRoom", {
        roomId: room._id,
        student: student,
        data: room,
        refreshToken: jwt.sign(
          {
            roomId: room._id,
            studentId: student._id,
            nickname: student.nickname,
          },
          process.env.JWT_SECRET
        ),
      });

      // Notify other students in the room
      io.to(room._id.toString()).emit("studentJoined", {
        students: room.students,
        data: room,
      });

      console.log("Reconnected to the server");
    } catch (error) {
      console.error("Error during reconnection:", error);
      socket.emit("error", { message: "Reconnection failed", error: error.message });
    }
  });
  socket.on("joinRoom", async ({ pin, roomId, studentId, nickname }) => {
    try {
      console.log(`🔍 Checking room: ${roomId}`);

      const room = await roomModel.findById(roomId).populate([
        {
          path: "quiz",
          populate: [{ path: "questions" }, { path: "theme" }],
        },
        {
          path: "students",
          populate: [
            { path: "avatar" },
            { path: "item" },
            {
              path: "quiz",
              populate: [{ path: "questions" }, { path: "theme" }],
            },
            { path: "room" },
          ],
        },
      ]);
      if (!room) {
        // console.log("❌ Room not found");
        return socket.emit("error", {
          message: "Room not found or invalid PIN",
        });
      }

      console.log(`✅ Room found: ${room._id}`);

      if (room.status === "started") {
        // console.log("⚠️ Room has already started. Cannot join.");
        return socket.emit("nickname_error", {
          message: "The room has already started. You cannot join.",
        });
      }

      let existingStudentSocket = room.students.find(
        (s) => s.socketId === socket.id
      );

      if (existingStudentSocket) {
        console.log(
          "⚠️ Student with this socket already exists, returning existing student."
        );
        socket.join(room._id.toString());
        socket.student = existingStudentSocket;

        return socket.emit("joinedRoom", {
          roomId: room._id,
          student: existingStudentSocket,
          data: room,
          refreshToken: jwt.sign(
            {
              roomId: room._id,
              studentId: existingStudentSocket._id,
              nickname: existingStudentSocket.nickname,
            },
            process.env.JWT_SECRET
          ),
        });
      }

      const existingStudent = room.students.find(
        (student) => student.nickname === nickname
      );

      if (existingStudent) {
        console.log("❌ Nickname already taken");
        return socket.emit("nickname_error", {
          message: "Nickname is already taken in this room",
        });
      }
      const items = await itemModel.find();
      const avatars = await avatarModel.find();

      const assignedAvatarIds = room.students.map((s) => s.avatar?._id);
      const availableAvatars = avatars.filter(
        (avatar) => !assignedAvatarIds.includes(avatar._id)
      );

      if (availableAvatars.length === 0) {
        // console.log("❌ No avatars available");
        return socket.emit("error", { message: "No avatars available." });
      }

      const randomAvatar =
        availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
      const randomItem = items.length > 0 ? items[2]._id : null;
      const socketExist = room.students.find((s) => s.socketId === socket.id);
      if (socketExist) {
        // console.log("�� Socket already exists");
        return socket.emit("error", { message: "Socket already exists" });
      }

      const newStudent = await studentModel.create({
        nickname,
        avatar: randomAvatar._id,
        item: randomItem,
        quiz: room.quiz._id,
        room: room._id,
        socketId: socket.id,
      });

      await newStudent.save();

      const populatedStudent = await newStudent.populate([
        { path: "quiz", populate: [{ path: "theme" }, { path: "questions" }] },
        { path: "room" },
        { path: "avatar" },
        { path: "item" },
        { path: "activeQuestion" },
      ]);

      room.students.push(newStudent._id);
      await room.save();
      await room.populate({
        path: "students",
        populate: [
          { path: "avatar" },
          { path: "item" },
          {
            path: "quiz",
            populate: [
              {
                path: "questions",
              },
              {
                path: "theme",
              },
            ],
          },
        ],
      });
      const refreshToken = jwt.sign(
        {
          roomId: room._id,
          studentId: newStudent._id,
          nickname: newStudent.nickname,
        },
        process.env.JWT_SECRET
      );
      socket.join(room._id.toString());

      io.to(room._id.toString()).emit("studentJoined", {
        students: room.students,
        data: room,
      });
      socket.student = newStudent;
      if (socket.student) {
        // Store student session information
        socket.request.session.studentId = socket.student._id;
        socket.request.session.roomId = roomId;
        await socket.request.session.save(); // Save the session
      }
      socket.emit("joinedRoom", {
        roomId: room._id,
        student: populatedStudent,
        data: room,
        refreshToken,
      });

      console.log(
        `🎉 Student ${nickname} joined room: ${room._id}, Token: ${refreshToken}`
      );
    } catch (error) {
      console.error("❌ Error joining room:", error);
      socket.emit("error", { message: "Server error", error: error.message });
    }
  });
  socket.on("checkCurrentStage", async ({ id, index }) => {
    const room = await roomModel.findById(id).populate({
      path: "currentStage",
      populate: { path: "question" }, // Populate question inside currentStage
    });
    if (!room) {
      socket.emit("currentStage", { status: false });
      return;
    }
    socket.emit("currentStage", { status: true, data: room.currentStage });
    io.to(room._id.toString()).emit("populateCurrentStage", {
      data: { ...room.currentStage, index },
      status: true,
    });
  });
  socket.on("changeStage", async (data) => {
    try {
      const room = await roomModel.findByIdAndUpdate(
        data.room,
        {
          currentStage: {
            question: data.currentStage.question,
            isLastStage: data.currentStage.isLastStage,
            stage: data.currentStage.stage,
          },
        },
        { new: true }
      );
      await room.populate({
        path: "currentStage",
        populate: { path: "question" },
      });

      if (!room) {
        return socket.emit("currentStage", { status: false });
      }
      console.log(room);
      socket.emit("currentStage", { status: true, data: room.currentStage });

      if (room.currentStage.question._id) {
        io.to(room._id.toString()).emit("populateCurrentStage", {
          data: { ...room.currentStage, index: data.currentStage.index },
          status: true,
        });
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      socket.emit("error", { message: "Server error", error: error.message });
    }
  });
  socket.on("verifyPin", async ({ pin }) => {
    const room = await roomModel.findOne({ pin: pin });
    if (room) {
      socket.emit("pinVerified", {
        status: true,
        message: "PIN verified",
        roomId: room._id,
        teacherId: room.teacher,
      });
    } else {
      socket.emit("pinVerified", { status: false, message: "Invalid PIN" });
    }
  });

  socket.on("tryReconnect", async ({ token, time }) => {
    if (token && time) {
      const decode = jwt.decode(token);
      if (decode) {
        const room = await roomModel.findById(decode.roomId).populate([
          {
            path: "quiz",
            populate: [{ path: "questions" }, { path: "theme" }],
          },
          {
            path: "students",
            populate: [
              { path: "avatar" },
              { path: "item" },
              {
                path: "quiz",
                populate: [{ path: "questions" }, { path: "theme" }],
              },
              { path: "room" },
            ],
          },
        ]);
        if (room) {
          const isStudentExist = room.students.find(
            (s) => s._id.toString() === decode.studentId
          );
          console.log("trying to reconnect", room, isStudentExist);
          if (isStudentExist) {
            const student = await studentModel
              .findById(decode.studentId)
              .populate([
                {
                  path: "avatar",
                },
                {
                  path: "item",
                },
                {
                  path: "room",
                },
                {
                  path: "quiz",
                  populate: [
                    {
                      path: "questions",
                    },
                    {
                      path: "theme",
                    },
                  ],
                },
              ]);
            if (student) {
              student.isActive = true;
              room.students.push(student._id);
              await student.save();
              await room.save();
              await room.populate({
                path: "students",
                populate: [
                  { path: "avatar" },
                  { path: "item" },
                  {
                    path: "quiz",
                    populate: [
                      {
                        path: "questions",
                      },
                      {
                        path: "theme",
                      },
                    ],
                  },
                ],
              });
              socket.join(room._id.toString());
              io.to(room._id.toString()).emit("studentJoined", {
                students: room.students,
                data: room,
              });
              socket.emit("reconnectionAttempt", {
                status: true,
                currentStage: room.currentStage,
                roomStatus: room.status,
                student,
              });
              console.log({
                status: true,
                currentStage: room.currentStage,
                join: {
                  roomId: room._id,
                  student,
                  refreshToken: token,
                },
              });
            } else {
              socket.emit("reconnectionAttempt", {
                status: false,
                message: "student not exist",
              });
              console.log("student not exist");
            }
          }
        } else {
          socket.emit("reconnectionAttempt", {
            status: false,
            message: "Room already completed",
          });
          console.log("Room already completed");
        }
      } else {
        socket.emit("reconnectionAttempt", {
          status: false,
          message: "user token not perfect",
        });
        console.log("user token not perfect");
      }
    } else {
      socket.emit("reconnectionAttempt", {
        status: false,
        message: "token or time not provided",
      });
      console.log("token or time not provided");
    }
  });
  socket.on("calculate_ranks", async (data) => {
    const room = await roomModel.findById(data.roomId).populate([
      {
        path: "quiz",
        populate: [{ path: "questions" }, { path: "theme" }],
      },
      {
        path: "students",
        populate: [
          { path: "avatar" },
          { path: "item" },
          {
            path: "quiz",
            populate: [{ path: "questions" }, { path: "theme" }],
          },
          { path: "room" },
        ],
      },
    ]);

    const sortedStudents = room.students
      .sort((a, b) => b.score - a.score)
      .map((student, index) => student._id);
    // sortedStudents.forEach((student, index) => {
    //   student.rank = index + 1;
    // });

    // room.students = sortedStudents;
    // room.status = "completed";
    // await room.save();
    await roomModel.findByIdAndUpdate(
      room._id,
      { status: "completed", students: sortedStudents },
      { new: true, runValidators: true }
    );
    await room.populate([
      {
        path: "students",
        populate: [
          {
            path: "avatar",
          },
          {
            path: "item",
          },
        ],
      },
      {
        path: "quiz",
      },
      {
        path: "teacher",
      },
    ]);
    io.to(room._id.toString()).emit("calculate_ranks_student", {
      students: room.students,
      data: room,
    });
  });
  socket.on("start", async (roomId) => {
    console.log(roomId);
    const room = await roomModel.findByIdAndUpdate(
      roomId,
      { status: "started" },
      { new: true }
    );
    // const result = await ResultModel.create
    io.to(room._id.toString()).emit("started", { data: room });
  }); 
  socket.on("submit_answer", async (data) => {
    try {
      const room = await roomModel.findById(data.room).populate({
        path: "students",
        populate: [{ path: "avatar" }, { path: "item" }],
      });

      if (!room) {
        console.error(`Room with ID ${data.room} not found.`);
        return;
      }

      const question = await questionModel.findById(data.question);
      if (!question) {
        console.error(`Question with ID ${data.question} not found.`);
        return;
      }

      const student = await studentModel.findById(data.student);
      if (!student) {
        console.error(`Student with ID ${data.student} not found.`);
        return;
      }
      let getScore = 0;
      let isCorrect = false;
      const isAttempted = await questionResultModel.findOne({
        room: room._id,
        student: data.student,
        question: data.question,
      });
      if (isAttempted) {
        console.log(
          `Student ${student._id} has already attempted this question.`
        );
        return;
      }
      if (data.isTimeUp) {
        console.log(
          `Student ${student._id} ran out of time for question ${question._id}.`
        );
        await questionResultModel.create({
          room: room._id,
          quiz: room.quiz,
          student: data.student,
          question: data.question,
          score: getScore,
          totalScore: student.score,
          status: "timeUp",
        });
        getScore = 0;
      } else {
        student.attemptQuestions.push(question._id);
        isCorrect = question.answerIndex.every((index) =>
          data.options.includes(question.options[index])
        );
        if (isCorrect) {
          const totalMarks = question.maximumMarks;
          const perSecondMarks = totalMarks / question.duration;
          getScore = data.timeSpent * perSecondMarks;
          student.score += getScore;
          await questionResultModel.create({
            room: room._id,
            quiz: room.quiz,
            student: data.student,
            question: data.question,
            score: getScore,
            totalScore: student.score,
            status: "correct",
          });
        } else {
          await questionResultModel.create({
            room: room._id,
            quiz: room.quiz,
            student: data.student,
            question: data.question,
            score: getScore,
            totalScore: student.score,
            status: "wrong",
          });
        }
        await student.save();

      }
      const assignRanks = (students) => {
        return students
          .sort((a, b) => b.score - a.score)
          .map((student, index, sortedArray) => ({
            ...student.toObject(),
            rank:
              index > 0 && student.score === sortedArray[index - 1].score
                ? sortedArray[index - 1].rank
                : index + 1,
          }));
      };

      const rankedStudents = assignRanks(room.students);
      console.log(
        "🚀 ~ socket.on ~ rankedStudents:",
        rankedStudents.map((s) => s.nickname + "__" + s.rank)
      );
      const currentStudentRank = rankedStudents.find(
        (s) => s._id.toString() === student._id.toString()
      )?.rank;
      console.log("🚀 ~ socket.on ~ rankedStudents:", rankedStudents);
      io.to(room._id.toString()).emit("receiveStudentResult", {
        student: student._id,
        score: student.score,
        question: question._id,
        rank: currentStudentRank,
      });

      socket.emit("result", {
        question: question._id,
        isCorrect,
        isTimeUp: data.isTimeUp,
        rank: currentStudentRank,
        currentScore: getScore,
        score: student.score,
      });
    } catch (error) {
      console.error("❌ Error processing answer submission:", error);
    }
  });
  socket.on("student_waiting", () => {
    // console.log("student_waiting")
    io.emit("student_waiting");
  });
  socket.on("setCount", (count) => {
    io.to(count.roomId).emit("setCount", {
      duration: count.duration,
      count: count.count,
    });
  });
  socket.on("next_question_redirect", (data) => {
    io.to(data.roomId).emit("next_question_redirection");
  });
  socket.on("checkUserInRoom",
    async ({ roomId, studentData, token, stage = 0 }) => {
      const room = await roomModel.findById(roomId);
      if (!room) {
        socket.emit("userInRoom", { status: false });
        console.error(`Room with ID ${roomId} not found.`);
        return;
      }

      const studentExist = room.students.includes(studentData.student._id);
      if (studentExist) {
        socket.emit("userInRoom", { status: true });
      } else {
        socket.emit("userInRoom", { status: false });
      }
    }
  );
  socket.on("changeCharacter", async (data) => {
    const avatar = await avatarModel.findById(data.selectedAvatarId);
    const room = await roomModel.findById(data.roomId).populate({
      path: "quiz",
      populate: [{ path: "questions" }, { path: "theme" }],
    });
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    if (!avatar) return;
    const student = await studentModel.findByIdAndUpdate(
      data.student._id,
      {
        avatar: avatar._id,
      },
      { new: true }
    );
    if (!student) return;
    (await (await student.populate("avatar")).populate("item")).populate(
      "quiz"
    );
    await room.populate({
      path: "students",
      populate: [{ path: "avatar" }, { path: "item" }],
    });
    io.to(room._id.toString()).emit("changedStudentCharacter", {
      students: room.students,
      room,
      student: student,
    });
    socket.emit("changedYourCharacter", {
      student: student,
      room,
    });
  });
  socket.on("changeCharacterAccessories", async (data) => {
    const selectedAccessories = await itemModel.findById(
      data.selectedAccessoriesId
    );
    const room = await roomModel.findById(data.roomId).populate([
      { path: "quiz", populate: [{ path: "theme" }, { path: "questions" }] },
      { path: "students", populate: [{ path: "avatar" }, { path: "item" }] },
    ]);
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    if (!selectedAccessories) {
      console.error(`Accessories with ID ${data.selectedAvatarId} not found.`);
      return;
    }
    const student = await studentModel
      .findByIdAndUpdate(
        data.student._id,
        { item: data.selectedAccessoriesId },
        { new: true }
      )
      .populate([
        {
          path: "avatar",
        },
        {
          path: "item",
        },
      ]);
    io.to(room._id.toString()).emit("changedStudentCharacterAccessories", {
      students: room.students,
      room,
      student: student,
    });
    socket.emit("changedYourCharacterAccessories", {
      student: student,
      room,
    });
  });
  socket.on("add_question", async (data) => {
    try {
      const { id, type } = data;
      const question = await questionModel.create({
        duration: 30,
        type: type,
        showQuestionDuration: 2000,
        media: "",
        options: ["", "", "", ""],
        answerIndex: [],
        attemptStudents: [],
        results: [],
        maximumMarks: 1000,
        question: "",
      });
      const updatedQuiz = await quizModel
        .findByIdAndUpdate(
          id,
          { $push: { questions: question._id } },
          { new: true }
        )
        .populate("questions")
        .populate("theme");

      socket.emit("question_added", {
        data: updatedQuiz,
        status: true,
        message: "added question successfully",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      socket.emit("question_added", {
        message: "Failed to add question",
        status: false,
      });
    }
  });
  socket.on("create_quiz", async (data) => {
    try {
      // Create a question
      const question = await questionModel.create({
        duration: 30,
        type: "quiz",
        showQuestionDuration: 2000,
        media: "",
        options: ["", "", "", ""],
        answerIndex: [],
        attemptStudents: [],
        results: [],
        maximumMarks: 1000,
        question: "",
      });

      if (!question) {
        socket.emit("created_quiz", {
          message: "Failed to create question",
          status: false,
        });
        return;
      }
      const newQuiz = await quizModel.create({
        ...data,
        questions: [question._id],
      });

      if (!newQuiz) {
        socket.emit("created_quiz", {
          message: "Failed to create quiz",
          status: false,
        });
        return;
      }
      const populatedQuiz = await (
        await newQuiz.populate("questions")
      ).populate("theme");
      socket.emit("created_quiz", {
        data: populatedQuiz,
        status: true,
        message: "Quiz created successfully",
      });
    } catch (error) {
      console.error("Error during quiz creation:", error);
      socket.emit("created_quiz", {
        message: "Something went wrong during quiz creation",
        status: false,
      });
    }
  });
  socket.on("set_question_value", async (data) => {
    try {
      const quiz = await quizModel
        .findOne({ _id: data._id })
        .populate("questions")
        .populate("theme");

      if (!quiz) {
        socket.emit("set_question_value", {
          status: false,
          message: "Quiz not found",
        });
        return;
      }
      const question = await questionModel.findOneAndUpdate(
        { _id: data.questionId },
        { question: data.value },
        { new: true }
      );

      if (!question) {
        socket.emit("set_question_value", {
          status: false,
          message: "Question not found",
        });
        return;
      }

      socket.emit("set_question_value", {
        status: true,
        message: "Question updated successfully",
        data: quiz,
        question
      });
    } catch (error) {
      console.error("Error updating question:", error);
      socket.emit("set_question_value", {
        status: false,
        message: "An error occurred while updating the question",
      });
    }
  });
  socket.on("fetch_quiz", async (data) => {
    try {
      console.log("works", data);
      if (!data._id) {
        socket.emit("fetched_quiz", {
          status: false,
          message: "Id is required",
        });
        return;
      }

      const quiz = await quizModel
        .findOne({ _id: data._id })
        .populate("questions")
        .populate("theme");
      if (!quiz) {
        socket.emit("feched_quiz", {
          status: false,
          message: "Quiz not found",
        });
        return;
      }
      socket.emit("feched_quiz", {
        status: true,
        message: "Quiz fetched successfully",
        data: quiz,
      });
    } catch (error) {
      socket.emit("feched_quiz", {
        status: false,
        message: "Something went wrong",
      });
    }
  });
  socket.on("delete_question_in_quiz", async (data) => {
    try {
      const quiz = await quizModel
        .findById(data._id)
        .populate("questions")
        .populate("theme");

      if (!quiz) {
        socket.emit("deleted_question_in_quiz", {
          message: "Quiz not found",
          status: false,
        });
        return;
      }
      quiz.questions = quiz.questions.filter(
        (question) => question._id.toString() !== data.questionId
      );
      await quiz.save();
      const updatedQuiz = await quiz;
      socket.emit("deleted_question_in_quiz", {
        data: updatedQuiz,
        message: "Question deleted successfully",
        status: true,
      });
    } catch (error) {
      console.error("Error deleting question from quiz:", error);
      socket.emit("deleted_question_in_quiz", {
        message: "Something went wrong",
        status: false,
      });
    }
  });
  socket.on("update_question_media", async (data) => {
    try {
      // Update the question media and return the updated document
      const question = await questionModel.findByIdAndUpdate(
        data.questionId,
        { media: data.media },
        { new: true }
      );

      if (!question) {
        socket.emit("updated_question_media", {
          message: "Question not found",
          status: false,
        });
        return;
      }

      // Emit the updated question data
      socket.emit("updated_question_media", {
        data: question,
        message: "Question media updated successfully",
        status: true,
      });
    } catch (error) {
      // Handle errors
      socket.emit("updated_question_media", {
        message: "Something went wrong",
        status: false,
        error: error.message, // Include error details for debugging
      });
    }
  });
  socket.on("update_question", async (data) => {
    const question = await questionModel.findByIdAndUpdate(data._id, data, {
      new: true,
    });
    if (!question) {
      socket.emit("updated_question", {
        message: "Something went wrong",
        status: false,
      });
      return;
    }
    socket.emit("updated_question", {
      data: question,
      message: "Updated successfully",
      status: true,
    });
  });
  socket.on("update_theme", async (data) => {
    const { id, theme } = data;
    const updatedQuiz = await quizModel
      .findByIdAndUpdate(id, { theme }, { new: true })
      .populate("questions")
      .populate("theme");
    if (!updatedQuiz) {
      socket.emit("updated_theme", {
        message: "Something went wrong",
        status: false,
      });
      return;
    }
    socket.emit("updated_theme", {
      data: updatedQuiz,
      message: "Updated successfully",
      status: true,
    });
  });
  socket.on("update_quiz_status", async (data) => {
    const { id, status } = data;
    const updatedQuiz = await quizModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate("questions")
      .populate("theme");
    if (!updatedQuiz) {
      socket.emit("updated_quiz_status", {
        message: "Something went wrong",
        status: false,
      });
      return;
    }
    socket.emit("updated_quiz", {
      data: updatedQuiz,
      message: "Updated successfully",
      status: true,
    });
  });
  socket.on("update_quiz", async (data) => {
    try {
      const updateQuiz = await quizModel
        .findByIdAndUpdate(data._id, data, { new: true })
        .populate("questions")
        .populate("theme");
      if (!updateQuiz) {
        socket.emit("updated_quiz", {
          message: "Something went wrong",
          status: false,
        });
        return;
      }
      socket.emit("updated_quiz", {
        data: updateQuiz,
        status: true,
        message: "updated successfully",
      });
    } catch (error) {
      socket.emit("updated_quiz", {
        message: "Something went wrong",
        status: false,
      });
    }
  });
  socket.on("delete_quiz", async (data) => {
    try {
      const deleteQuiz = await quizModel.findByIdAndDelete(data._id);
      if (!deleteQuiz) {
        socket.emit("deleted_quiz", {
          message: "Something went wrong",
          status: false,
        });
        return;
      }
      socket.emit("deleted_quiz", {
        data: deleteQuiz,
        status: true,
        message: "deleted successfully",
      });
    } catch (error) {
      console.error(error);
      socket.emit("deleted_quiz", {
        message: "Something went wrong",
        status: false,
      });
    }
  });
  socket.on("disconnect", async (reason) => {
    if (socket.teacher) {
      const room = await roomModel.deleteMany({
        teacher: socket.teacher._id,
        status: { $in: ["waiting", "started"] },
        isActive: true,
      });
      io.emit("roomDeleted");
      console.log(room);
      return;
    }

    if (socket.student) {
      try {
        const student = await studentModel.findById(socket.student._id);

        if (!student) {
          console.error("❌ Student not found.");
          return;
        }
        student.isActive = false;
        await student.save();
        const room = await roomModel.findById(student.room);
        if (!room) {
          console.error("❌ Room not found.");
          return;
        }

        if (room.status === "waiting") {
          room.students = room.students.filter(
            (s) => s.toString() !== student._id.toString()
          );
          await room.save();
          await room.populate([
            {
              path: "quiz",
              populate: [{ path: "questions" }, { path: "theme" }],
            },
            {
              path: "students",
              populate: [
                { path: "avatar" },
                { path: "item" },
                {
                  path: "quiz",
                  populate: [{ path: "questions" }, { path: "theme" }],
                },
                { path: "room" },
              ],
            },
          ]);
          socket.emit("inactive", { student: student });
          socket.leave(room._id.toString());
          io.to(room._id.toString()).emit("studentJoined", {
            students: room.students,
          });
          console.log(
            `🚪 Student ${student._id} removed from room ${room._id}`
          );
        } else if (room.status === "started") {
          await room.populate({
            path: "students",
            populate: [{ path: "avatar" }, { path: "item" }, { path: "quiz" }],
          });
          socket.emit("inactive", { student: student });
          socket.leave(room._id.toString());
          io.to(room._id.toString()).emit("studentJoined", {
            data: room,
            students: room.students,
          });
        }
      } catch (error) {
        console.error("❌ Error removing student:", error);
      }
    }
  });
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on link http://localhost:${PORT}`);
});


}