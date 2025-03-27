"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { join } from "../redux/schema/student";

// Define the context with a type for socket state
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const student = useSelector((root: RootState) => root.student.currentGame);

  useEffect(() => {
    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SERVER as string, {
      transports: ["websocket", "long-polling", "callback-polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      withCredentials: true,
    });

    // Handle connection events
    newSocket.on("joinedRoom", ({ roomId,
      student,
      refreshToken }) => {
      console.log("Socket connected on :" + currentTime);
      console.log("Socket configuration:", {
        isConnected: isConnected,
        isReconnecting: isReconnecting,
        connectionError: connectionError,
        socket: newSocket,
      });
      console.log(roomId, student, refreshToken)
      dispatch(join({
        roomId,
        student,
        refreshToken
      }))
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected on :" + currentTime, reason);
      setIsConnected(false);
      setConnectionError("Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error on :" + currentTime, error);
      setConnectionError(error.message);
    });

    newSocket.on("reconnecting", () => {
      console.log("Attempting to reconnect on :" + currentTime);
      setIsReconnecting(true);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after" + attemptNumber + "attempts on :" + currentTime);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
    });

    if (!isConnected && student && student.refreshToken) {
      // newSocket.emit("reconnect_refresh_token",{refreshToken:student.refreshToken});
    }

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isReconnecting, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
