// kahoot/src/socket/gameSocket.ts
import { Server, Socket } from "socket.io";
import { roomModel } from "../model/room.model";
import { studentModel } from "../model/studentModel";
import { questionModel } from "../model/question.model";
import { questionResultModel } from "../model/questionResult.model";
import { avatarModel } from "../model/avatar.model";
import { itemModel } from "../model/item.model";
import jwt from "jsonwebtoken";

// Authentication middleware for game sockets
export const gameAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

// Game socket event handlers
export const setupGameSocket = (io) => {
  const gameIo = io.of("/game");

  // Apply auth middleware to game namespace
  gameIo.use(gameAuthMiddleware);

  gameIo.on("connection", (socket) => {
    // Room management events
    socket.on("createRoom", async ({ quizId, teacherId }) => {
      // ... existing createRoom logic ...
    });

    socket.on("joinRoom", async ({ pin, roomId, studentId, nickname }) => {
      // ... existing joinRoom logic ...
    });

    // Game flow events
    socket.on("checkCurrentStage", async ({ id, index }) => {
      // ... existing checkCurrentStage logic ...
    });

    socket.on("changeStage", async (data) => {
      // ... existing changeStage logic ...
    });

    socket.on("submit_answer", async (data) => {
      // ... existing submit_answer logic ...
    });

    // Student interaction events
    socket.on("student_waiting", () => {
      gameIo.emit("student_waiting");
    });

    socket.on("setCount", (count) => {
      gameIo.to(count.roomId).emit("setCount", {
        duration: count.duration,
        count: count.count,
      });
    });

    socket.on("next_question_redirect", (data) => {
      gameIo.to(data.roomId).emit("next_question_redirection");
    });

    // Character customization events
    socket.on("changeCharacter", async (data) => {
      // ... existing changeCharacter logic ...
    });

    socket.on("changeCharacterAccessories", async (data) => {
      // ... existing changeCharacterAccessories logic ...
    });

    // Disconnect handling
    socket.on("disconnect", async (reason) => {
      // ... existing disconnect logic ...
    });
  });
};
