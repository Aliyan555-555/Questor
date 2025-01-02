import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/api/v1", (req, res) => {
  res.send("Hello from Express with Socket.io!");
});

const rooms = {};
const roomPins = {};
const demoData = [
  {
    _id: 22,
    name: "Programming Languages",
    questions: [
      {
        _id: 1,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 100,
        question:
          "What is the name of the programming language that is used for web development?",
        options: ["Java", "Python", "JavaScript", "C++"],
        answerIndex: [2], // index start with 0,
      },
    ],
  },
];

const generatePin = () => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (roomPins[pin]); // Ensure the pin is unique
  return pin;
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("createRoom", ({ quizId, teacherId }) => {
    const roomId = `${teacherId}-${quizId}`;
    const pin = generatePin();
    rooms[roomId] = {
      teacherId,
      quizId,
      kahoot: { ...demoData[0], students: [], results: [] },
      students: [],
      pin,
    };
    roomPins[pin] = roomId; // Map pin to roomId

    socket.join(roomId);
    socket.emit("roomCreated", { roomId, pin,data:rooms[roomId] });
    console.log(`Room created: ${roomId} with PIN: ${pin}`);
  });

  socket.on("joinRoom", ({ pin, studentId, nickname }) => {
    const roomId = roomPins[pin]; // Get roomId using the pin
    if (rooms[roomId].status === 'started'){
      socket.emit("nickname_error",{
        message: "The room has already started. You cannot join.",
      })
      return;
    }
    if (roomId && rooms[roomId]) {
      // Check if the nickname already exists in the room
      const existingStudent = rooms[roomId].students.find(
        (student) => student.nickname === nickname
      );

      if (existingStudent) {
        socket.emit("nickname_error", {
          message: "Nickname is already taken in this room",
        });
        return;
      }

      // Add student to the room if the nickname////// is unique
      const student = { id: studentId, nickname };
      rooms[roomId].students.push(student);
      rooms[roomId].kahoot = {
        ...rooms[roomId].kahoot,status:'waiting',
        students: [
          ...rooms[roomId].kahoot.students,
          { ...student, totalQuestions: [], attemptQuestions: [],rank:0,score:0,activeQuestion:null,},
        ],
      };
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId, student,data:rooms[roomId] });
      io.to(roomId).emit("studentJoined", { students: rooms[roomId].students,data:rooms[roomId] });
      console.log(`Student ${nickname} joined room: ${roomId}`);
    } else {
      socket.emit("error", { message: "Room not found or invalid PIN" });
    }
  });
  socket.on("verifyPin", ({ roomId, pin }) => {
    if (rooms[roomId] && rooms[roomId].pin === pin) {
      socket.emit("pinVerified", { status: true, roomId });
    } else {
      socket.emit("pinVerified", { status: false, message: "Invalid PIN" });
    }
  });

  socket.on("start",(roomId) => {
    rooms[roomId].status = 'started';
    io.to(roomId).emit('started', {data:rooms[roomId]});
  })

  socket.on("checkUserInRoom", ({ roomId, studentData }) => {
    // console.log(st)
    if (rooms[roomId]) {
      const userInRoom = rooms[roomId].students.find(
        (student) => student.id === studentData.id
      );
      if (userInRoom) {
        socket.emit("userInRoom", true);
      } else {
        socket.emit("userInRoom", false);
      }
    } else {
      socket.emit("userInRoom", false);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove the student from the room they were in
    for (const roomId in rooms) {
      const students = rooms[roomId].students;
      const index = students.findIndex((student) => student.id === socket.id);
      if (index !== -1) {
        students.splice(index, 1);
        io.to(roomId).emit("studentJoined", { students });
        console.log(`Student removed from room: ${roomId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
