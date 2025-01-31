"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

// Define the context with a type for socket, initially null
const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SERVER as string,{
      // reconnection:true,
      // reconnectionAttempts: Infinity,
      // transports: ['websocket']
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
