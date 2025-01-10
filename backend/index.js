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
        maximumMarks: 1000,
        question:
          "What is the name of the programming language that is used for web development?",
        options: ["Java", "Python", "JavaScript", "C++"],
        answerIndex: [2], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 2,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question:
          "Which language is primarily used for statistical computing and graphics?",
        options: ["Java", "R", "Python", "C++"],
        answerIndex: [1], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 3,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question:
          "Which programming language is known as the backbone of web development?",
        options: ["Ruby", "JavaScript", "C#", "Java"],
        answerIndex: [1], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 4,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question:
          "Which programming language is used for Android app development?",
        options: ["C#", "Swift", "Kotlin", "Java"],
        answerIndex: [2], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 5,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which of these is not a programming language?",
        options: ["Swift", "Rust", "JavaScript", "Google"],
        answerIndex: [3], // index start with 0
        attemptStudents: [],
        results: [],
      },
    ],
  },
  {
    _id: 23,
    name: "Web Development",
    questions: [
      {
        _id: 6,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which HTML tag is used for the largest heading?",
        options: ["<h1>", "<h3>", "<h6>", "<h2>"],
        answerIndex: [0], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 7,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which CSS property is used to change the text color?",
        options: ["color", "font-color", "text-color", "background-color"],
        answerIndex: [0], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 8,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "What does CSS stand for?",
        options: [
          "Cascading Style Sheets",
          "Coded Style Sheets",
          "Creative Style Sheets",
          "Computer Style Sheets",
        ],
        answerIndex: [0], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 9,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which of these is a JavaScript framework?",
        options: ["React", "HTML", "CSS", "MySQL"],
        answerIndex: [0], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 10,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which of these is used to style a website?",
        options: ["HTML", "CSS", "JavaScript", "PHP"],
        answerIndex: [1], // index start with 0
        attemptStudents: [],
        results: [],
      },
    ],
  },
  {
    _id: 24,
    name: "Data Structures and Algorithms",
    questions: [
      {
        _id: 11,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        answerIndex: [2], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 12,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which data structure is used for implementing recursion?",
        options: ["Stack", "Queue", "Array", "Linked List"],
        answerIndex: [0], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 13,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "What is the time complexity of a linear search?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        answerIndex: [1], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 14,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "Which data structure is used to implement a priority queue?",
        options: ["Queue", "Heap", "Stack", "Array"],
        answerIndex: [1], // index start with 0
        attemptStudents: [],
        results: [],
      },
      {
        _id: 15,
        duration: 4000,
        showQuestionDuration: 2000,
        type: "quiz",
        media: "",
        maximumMarks: 1000,
        question: "What does a hash function do?",
        options: [
          "Sorts data",
          "Searches data",
          "Converts data into a fixed size",
          "Filters data",
        ],
        answerIndex: [2], // index start with 0
        attemptStudents: [],
        results: [],
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
    console.log(rooms);
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

    const pin = generatePin();
    rooms[roomId] = {
      teacherId,
      hostId: socket.id,
      quizId,
      kahoot: {
        ...demoData.filter((d) => d._id == quizId)[0],
        questions: demoData
          .filter((d) => d._id == quizId)[0]
          .questions.map((q) => {
            return { ...q, attemptStudents: [], results: [] };
          }),
        students: [],
        results: [],
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

  socket.on("joinRoom", ({ pin, studentId, nickname }) => {
    const roomId = roomPins[pin]; // Get roomId using the pin
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

      // Add student to the room if the nickname////// is unique
      const student = {
        _id: studentId,
        nickname,
        totalQuestions: [],
        attemptQuestions: [],
        rank: 0,
        score: 0,
        activeQuestion: null,
      };
      rooms[roomId].students = [...rooms[roomId].students,student]
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
  socket.on("verifyPin", ({ roomId, pin }) => {
    if (rooms[roomId] && rooms[roomId].pin === pin) {
      socket.emit("pinVerified", { status: true, roomId });
    } else {
      socket.emit("pinVerified", { status: false, message: "Invalid PIN" });
    }
  });

  socket.on("calculate_ranks", (data) => {
    const sortedStudents = [...rooms[data.roomId].kahoot.students].sort(
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
    if (
      rooms[data.question.roomId].kahoot.questions
        .find((q) => q._id === data.question.question._id)
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
      
      console.log("question", data.question.question._id);
      rooms[data.question.roomId].kahoot.questions
        .find((q) => q._id === data.question.question._id)
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
        .find((question) => question._id === data.question.question._id)
        .attemptStudents.push(data.studentId);
    const results = rooms[data.question.roomId].kahoot.questions.find(
      (q) => q._id === data.question.question._id
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
          (q) => q._id === data.question.question._id
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

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Remove the student from the room they were in

    for (const roomId in rooms) {
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
