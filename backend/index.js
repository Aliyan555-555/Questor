import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import { ObjectId } from "mongodb";
import AuthRouter from "./routers/auth.route.js";
import connectToMongodb from "./database/index.js";
import dotenv from "dotenv";
import quizModel from "./model/quiz.model.js";
import { questionModel } from "./model/question.model.js";
import ThemeRouter from "./routers/theme.route.js";
dotenv.config();
const app = express();
connectToMongodb();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  "http://dev.meteoricsolutions.com:8000",
  "http://dev.meteoricsolutions.com:9000",
  process.env.FRONTEND_URL, // Ensure you have this environment variable set
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: [process.env.FRONTEND_BASE_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const getAvatars = async () => {
  try {
    const res = await axios.get(
      "https://apis.kahoot.it/game-reward-service/api/v1/config/avatar"
    );
    return res.data;
  } catch (error) {
    console.log("Error fetching avatars:", error);
    return { avatars: [], items: [] }; // Return empty arrays on error to avoid breaking the code
  }
};

app.get("/api/v1/avatars", async (req, res) => {
  try {
    const response = await getAvatars();
    res.status(200).json({ ...response, status: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching avatars", error, status: false });
  }
});
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1", ThemeRouter);
const rooms = {};
const roomPins = {};
// const demoData = [
//   {
//     _id: 22,
//     name: "Programming Languages",
//     questions: [
//       {
//         _id: 1,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question:
//           "What is the name of the programming language that is used for web development?",
//         options: ["Java", "Python", "JavaScript", "C++"],
//         answerIndex: [2], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 2,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question:
//           "Which language is primarily used for statistical computing and graphics?",
//         options: ["Java", "R", "Python", "C++"],
//         answerIndex: [1], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 3,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question:
//           "Which programming language is known as the backbone of web development?",
//         options: ["Ruby", "JavaScript", "C#", "Java"],
//         answerIndex: [1],
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 4,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question:
//           "Which programming language is used for Android app development?",
//         options: ["C#", "Swift", "Kotlin", "Java"],
//         answerIndex: [2], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 5,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which of these is not a programming language?",
//         options: ["Swift", "Rust", "JavaScript", "Google"],
//         answerIndex: [3], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//     ],
//   },
//   {
//     _id: 23,
//     name: "Web Development",
//     questions: [
//       {
//         _id: 6,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which HTML tag is used for the largest heading?",
//         options: ["<h1>", "<h3>", "<h6>", "<h2>"],
//         answerIndex: [0], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 7,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which CSS property is used to change the text color?",
//         options: ["color", "font-color", "text-color", "background-color"],
//         answerIndex: [0], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 8,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "What does CSS stand for?",
//         options: [
//           "Cascading Style Sheets",
//           "Coded Style Sheets",
//           "Creative Style Sheets",
//           "Computer Style Sheets",
//         ],
//         answerIndex: [0], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 9,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which of these is a JavaScript framework?",
//         options: ["React", "HTML", "CSS", "MySQL"],
//         answerIndex: [0], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 10,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which of these is used to style a website?",
//         options: ["HTML", "CSS", "JavaScript", "PHP"],
//         answerIndex: [1], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//     ],
//   },
//   {
//     _id: 24,
//     name: "Data Structures and Algorithms",
//     questions: [
//       {
//         _id: 11,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "What is the time complexity of binary search?",
//         options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
//         answerIndex: [2], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 12,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which data structure is used for implementing recursion?",
//         options: ["Stack", "Queue", "Array", "Linked List"],
//         answerIndex: [0], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 13,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "What is the time complexity of a linear search?",
//         options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
//         answerIndex: [1], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 14,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "Which data structure is used to implement a priority queue?",
//         options: ["Queue", "Heap", "Stack", "Array"],
//         answerIndex: [1], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//       {
//         _id: 15,
//         duration: 4000,
//         showQuestionDuration: 2000,
//         type: "quiz",
//         media: "",
//         maximumMarks: 1000,
//         question: "What does a hash function do?",
//         options: [
//           "Sorts data",
//           "Searches data",
//           "Converts data into a fixed size",
//           "Filters data",
//         ],
//         answerIndex: [2], // index start with 0
//         attemptStudents: [],
//         results: [],
//       },
//     ],
//   },
// ];

const generatePin = () => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (roomPins[pin]); // Ensure the pin is unique
  return pin;
};
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("createRoom", async ({ quizId, teacherId }) => {
    // console.log(rooms);
    const question = await questionModel.find();
    console.log(question);
    const roomId = `${teacherId}-${quizId}`;
    if (rooms[roomId]) {
      socket.emit("roomCreated", {
        roomId,
        pin: rooms[roomId].pin,
        data: rooms[roomId],
      });
      socket.emit("error", { message: "Room already exists" });
      return;
    }
    const selectedQuiz = await quizModel.findById(quizId).populate("questions");
    const pin = generatePin();
    rooms[roomId] = {
      teacherId,
      hostId: socket.id,
      quizId,
      status: "waiting",
      kahoot: {
        // ...demoData.filter((d) => d._id == quizId)[0],
        ...selectedQuiz._doc,
        questions: selectedQuiz._doc.questions // .filter((d) => d._id == quizId)[0]
          .map((q) => {
            return { ...q._doc, attemptStudents: [], results: [] };
          }),
        students: [],
        results: [],
      },
      currentStage: {
        status: "waiting",
        quizId: quizId,
        currentQuestionIndex: 0,
        currentQuestionStage: 1,
      },
      students: [],
      pin,
    };
    roomPins[pin] = roomId; // Map pin to roomId
    io.to(roomId).emit("recreation", {
      roomId,
      pin: rooms[roomId].pin,
      data: rooms[roomId],
    });
    socket.join(roomId);
    console.log(rooms);
    socket.emit("roomCreated", { roomId, pin, data: rooms[roomId] });
    console.log(`Room created: ${roomId} with PIN: ${pin}`);
  });

  socket.on("joinRoom", async ({ pin, studentId, nickname }) => {
    const roomId = roomPins[pin];
    console.log(rooms[roomId]);
    if (rooms[roomId].status === "started") {
      socket.emit("nickname_error", {
        message: "The room has already started. You cannot join.",
      });
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
      const { avatars, items } = await getAvatars();
      const assignedAvatarIds = rooms[roomId].students.map((s) => s.avatar?.id);

      // Filter out already assigned avatars
      const availableAvatars = avatars.filter(
        (avatar) => !assignedAvatarIds.includes(avatar.id)
      );

      if (availableAvatars.length === 0) {
        socket.emit("error", { message: "No avatars available." });
        return;
      }

      // Randomly select an avatar and item
      // console.log(items);
      const randomAvatar =
        availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
      const randomItem = items.length > 0 ? await items[2] : null;

      // Add student to the room
      const student = {
        _id: studentId,
        nickname,
        avatar: randomAvatar || null,
        item: randomItem || null,
        totalQuestions: [],
        attemptQuestions: [],
        rank: 0,
        score: 0,
        activeQuestion: null,
      };
      rooms[roomId].students = [...rooms[roomId].students, student];
      rooms[roomId].kahoot = {
        ...rooms[roomId].kahoot,
        status: "waiting",
        students: [
          ...rooms[roomId].kahoot.students,
          {
            ...student,
            totalQuestions: [],
            attemptQuestions: [],
            rank: 0,
            score: 0,
            activeQuestion: null,
          },
        ],
      };
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId, student, data: rooms[roomId] });
      io.to(roomId).emit("studentJoined", {
        students: rooms[roomId].students,
        data: { ...rooms[roomId] },
      });
      console.log(`Student ${nickname} joined room: ${roomId}`);
    } else {
      socket.emit("error", { message: "Room not found or invalid PIN" });
    }
  });
  socket.on("verifyPin", ({ pin }) => {
    let roomFound = false;

    // Iterate through all rooms to find a match
    for (const id in rooms) {
      if (rooms[id].pin === pin) {
        roomFound = true;
        socket.emit("pinVerified", { status: true, roomId: id });
        break;
      }
    }

    if (!roomFound) {
      socket.emit("pinVerified", { status: false, message: "Invalid PIN" });
    }
  });

  socket.on("calculate_ranks", (data) => {
    const sortedStudents = [...rooms[data.roomId].students].sort(
      (a, b) => b.score - a.score
    );
    sortedStudents.forEach((student, index) => {
      student.rank = index + 1;
    });
    // console.log(sortedStudents);
    io.to(data.roomId).emit("calculate_ranks_student", {
      students: sortedStudents,
      data: rooms[data.roomId],
    });
    rooms[data.roomId].status = "ended";
  });

  socket.on("start", (roomId) => {
    rooms[roomId].status = "started";
    io.to(roomId).emit("started", { data: rooms[roomId] });
  });
  socket.on("question_playing", (data) => {
    io.to(data.roomId).emit("question_playing_student_process", data);
  });
  socket.on("request_question_options_waiting", (data) => {
    // console.log("request_question_options_waiting kkkkk",data)
    io.to(data.roomId).emit("question_options_waiting", data);
  });
  socket.on("request_question_options_stop_waiting", (data) => {
    // console.log("request_question_options_stop_waiting",data)
    io.to(data.roomId).emit("question_options_stop_waiting", data);
  });
  socket.on("ranking_redirection", (data) => {
    io.to(data.roomId).emit("ranking_redirection_student_process");
  });

  socket.on("submit_question_answer", (data) => {
    const optionArray = data.question.question.options;
    const answerIndex = data.answer
      ? optionArray.findIndex((option) => option === data.answer)
      : null;
    const questionObjectId = new ObjectId(data.question.question._id);
    data.question.question._id = questionObjectId;
    console.log(data.question.question._id.toHexString());
    console.log(questionObjectId.toHexString());
    console.log(
      questionObjectId.toHexString() ===
        data.question.question._id.toHexString()
    );
    console.log(
      rooms[data.question.roomId].kahoot.questions.filter(
        (q) => q._id.toHexString() === data.question.question._id.toHexString()
      )
    );
    if (!rooms[data.question.roomId]) {
      return socket.emit("error", { message: "Room not found" });
    }
    if (
      !rooms[data.question.roomId].kahoot.students.find(
        (s) => s._id === data.studentId
      )
    ) {
      return socket.emit("error", { message: "Student not found in room" });
    }
    // console.log("Question Array",rooms[data.question.roomId].kahoot.questions)
    // console.log("Question ID",data.question.question._id)
    // console.log(rooms[data.question.roomId].kahoot.questions.filter((q) => q._id === data.question.question._id))
    if (
      rooms[data.question.roomId].kahoot.questions
        .filter(
          (q) =>
            q._id.toHexString() === data.question.question._id.toHexString()
        )[0]
        .attemptStudents.includes(data.studentId)
    ) {
      return socket.emit("error", {
        message: "Student already attempted this question",
      });
    }
    console.log(rooms[data.question.roomId]);
    const scorePerSecond = data.question.question.maximumMarks / data.duration;
    const score = scorePerSecond * data.timeTaken;
    if (data.question.question.answerIndex.includes(answerIndex)) {
      rooms[data.question.roomId].kahoot.students.find(
        (student) => student._id === data.studentId
      ).score += score;
      rooms[data.question.roomId].students.find(
        (student) => student._id === data.studentId
      ).score += score;

      // console.log("question", data.question.question._id);
      rooms[data.question.roomId].kahoot.questions
        .find(
          (q) =>
            q._id.toHexString() === data.question.question._id.toHexString()
        )
        .results.push({
          studentId: data.studentId,
          questionId: data.question.question._id,
          score: score,
          answerIndex: answerIndex,
          timeTaken: data.timeTaken,
        });
    } else {
    }
    rooms[data.question.roomId].kahoot.questions
      .find(
        (q) => q._id.toHexString() === data.question.question._id.toHexString()
      )
      .attemptStudents.push(data.studentId);
    const results = rooms[data.question.roomId].kahoot.questions.find(
      (q) => q._id.toHexString() === data.question.question._id.toHexString()
    ).results;
    const sortedResults = [...results].sort((a, b) => b.score - a.score);
    const studentPosition = sortedResults.findIndex(
      (result) => result.studentId === data.studentId
    );
    const studentRank = studentPosition + 1;

    const currentStudent = rooms[data.question.roomId].students.find(
      (student) => student._id === data.studentId
    );
    const resultStatus =
      data.answer === null
        ? "Time's up"
        : data.question.question.answerIndex.includes(answerIndex)
        ? "correct"
        : "incorrect";
    socket.emit("results", {
      question: {
        ...data.question.question,
        resultStatus,
        studentRank,
        studentTakenMarks: score.toFixed(0),
        questionIndex: rooms[data.question.roomId].kahoot.questions.findIndex(
          (q) =>
            q._id.toHexString() === data.question.question._id.toHexString()
        ),
      },
      student: currentStudent,
    });
    io.to(data.question.roomId).emit("resultsData", {
      data: rooms[data.question.roomId],
      question: data.question.question,
      student: rooms[data.question.roomId].students.find(
        (student) => student._id === data.studentId
      ),
    });
  });
  socket.on("student_waiting", () => {
    // console.log("student_waiting")
    io.emit("student_waiting");
  });

  socket.on("next_question_redirect", (data) => {
    io.to(data.roomId).emit("next_question_redirection");
  });

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

  socket.on("changeCharacter", async (data) => {
    const { avatars, items } = await getAvatars();
    const room = rooms[data.roomId];
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    // console.log(avatars)
    const selectedAvatar = avatars.filter(
      (a) => a.id === data.selectedAvatarId
    )[0];
    if (!selectedAvatar) {
      console.error(`Avatar with ID ${data.selectedAvatarId} not found.`);
      return;
    }
    const studentIndex = room.students.findIndex(
      (s) => s._id === data.student._id
    );
    const studentKahootIndex = room.kahoot.students.findIndex(
      (s) => s._id === data.student._id
    );
    if (studentIndex === -1) {
      console.error(
        `Student with ID ${data.student._id} not found in room ${data.roomId}.`
      );
      return;
    }
    room.kahoot.students[studentKahootIndex] = {
      ...room.kahoot.students[studentKahootIndex],
      avatar: selectedAvatar,
    };
    room.students[studentIndex] = {
      ...room.students[studentIndex],
      avatar: selectedAvatar,
    };
    io.to(data.roomId).emit("changedStudentCharacter", {
      students: room.students,
      room,
      student: room.students[studentIndex],
    });
    socket.emit("changedYourCharacter", {
      student: room.students[studentIndex],
      room,
    });
  });

  socket.on("changeCharacterAccessories", async (data) => {
    const { avatars, items } = await getAvatars();
    const room = rooms[data.roomId];
    if (!room) {
      console.error(`Room with ID ${data.roomId} not found.`);
      return;
    }
    // console.log(avatars)
    const selectedAccessories = items.filter(
      (a) => a.id === data.selectedAccessoriesId
    )[0];
    if (!selectedAccessories) {
      console.error(`Accessories with ID ${data.selectedAvatarId} not found.`);
      return;
    }
    const studentIndex = room.students.findIndex(
      (s) => s._id === data.student._id
    );
    const studentKahootIndex = room.kahoot.students.findIndex(
      (s) => s._id === data.student._id
    );
    if (studentIndex === -1) {
      console.error(
        `Student with ID ${data.student._id} not found in room ${data.roomId}.`
      );
      return;
    }
    room.kahoot.students[studentKahootIndex] = {
      ...room.kahoot.students[studentKahootIndex],
      item: selectedAccessories,
    };
    room.students[studentIndex] = {
      ...room.students[studentIndex],
      item: selectedAccessories,
    };
    io.to(data.roomId).emit("changedStudentCharacterAccessories", {
      students: room.students,
      room,
      student: room.students[studentIndex],
    });
    socket.emit("changedYourCharacterAccessories", {
      student: room.students[studentIndex],
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
        options: ["","","",""],
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
  
      socket.emit("question_added", {data:updatedQuiz,status:true,message:"added question successfully"});
    } catch (error) {
      console.error("Error adding question:", error);
      socket.emit("question_added", { message: "Failed to add question",status:false });
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
        options: ["","","",""],
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
      const question = quiz.questions.find(
        (q) => q._id.toString() === data.questionId
      );
      if (!question) {
        socket.emit("set_question_value", {
          status: false,
          message: "Question not found",
        });
        return;
      }

      question.question = data.value;
      await question.save();

      socket.emit("set_question_value", {
        status: true,
        message: "Question updated successfully",
        data: quiz,
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
        message: "Something want wrong",
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
    const updatedQuiz = await quizModel.findByIdAndUpdate(id, { theme },{new:true}).populate('questions').populate('theme');
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

  socket.on("update_quiz", async (data) => {
    try {
      const updateQuiz = await quizModel.findByIdAndUpdate(data._id, data).populate('questions').populate('theme');
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

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove the student from the room they were in

    for (const roomId in rooms) {
      console.log(rooms[roomId].hostId, socket.id);
      if (rooms[roomId].hostId === socket.id) {
        delete rooms[roomId];
        // delete roomPins[rooms[roomId].pin];
        // console.log(`Room deleted: ${roomId}`);
        // console.log(rooms)
        io.to(roomId).emit("roomDeleted", { roomId });
        return;
      }
      const students = rooms[roomId].students;
      const index = students.findIndex((student) => student._id === socket.id);
      if (index !== -1) {
        students.splice(index, 1);
        io.to(roomId).emit("studentJoined", { students });
        rooms[roomId].kahoot.students = rooms[roomId].kahoot.students.filter(
          (s) => s._id !== socket.id
        );
        // room
        console.log(`Student removed from room: ${roomId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
