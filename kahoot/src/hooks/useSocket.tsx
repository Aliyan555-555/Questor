"use client"
// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// const useSocket = () => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const socketIo = io('http://localhost:8000');
//     setSocket(socketIo);

//     return () => {
//       socketIo.disconnect();
//     };
//   }, []);

//   return socket;
// };

// export default useSocket;


// SocketContext.js
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8000"); // Update with your server URL
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
