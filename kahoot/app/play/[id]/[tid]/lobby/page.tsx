"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { join } from "@/src/redux/schema/student";
import { useSocket } from "@/src/hooks/useSocket";
import { Student as StudentDate} from "@/src/types";
import Image from "next/image";

const Student = () => {
  const params = useParams();
  const query = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { tid, id } = params;
  const [roomId] = useState(`${tid}-${id}`);
  const [nickname, setNickname] = useState("");
  const isQR = query.get('qr');
  const [pin, setPin] = useState(query.get("pin") || "");
  const [pinVerified, setPinVerified] = useState(false);

  const joinRoom = () => {
    if (!nickname.trim()) {
      toast.error("Please enter a nickname");
      return;
    }

    if (socket) {
      const studentId = socket.id; // Using socket ID as student ID
      socket.emit("joinRoom", { pin, roomId, studentId, nickname });
    }
  };

  const verifyPin = () => {
    if (!pin.trim()) {
      toast.error("Please enter a PIN");
      return;
    }

    if (socket) {
      socket.emit("verifyPin", { roomId, pin });
    }
  };

  useEffect(() => {
    if (socket) {
      const handleJoinedRoom = ({
        roomId,
        student,
      }: {
        roomId: string;
        student: StudentDate;
      }) => {
        dispatch(join({ roomId, student }));
        router.push(`/play/${id}/${tid}/lobby/instructions`);
      };

      const handleNicknameError = (error: { message: string }) => {
        toast.error(error.message);
      };

      const handlePinVerified = (data: { status: boolean }) => {
        if (data.status) {
          setPinVerified(true);
        } else {
          toast.error("Invalid PIN");
        }
      };

      // Attach socket event listeners
      socket.on("joinedRoom", handleJoinedRoom);
      socket.on("nickname_error", handleNicknameError);
      socket.on("pinVerified", handlePinVerified);

      return () => {
        // Cleanup event listeners
        socket.off("joinedRoom", handleJoinedRoom);
        socket.off("nickname_error", handleNicknameError);
        socket.off("pinVerified", handlePinVerified);
      };
    }
  }, [socket, dispatch, id, tid, router, roomId]);

  useEffect(() => {
    if (isQR && pin != ""){
      verifyPin()
    
    }
  });

  return (
    <div
      className="w-screen h-screen relative flex-col bg-cover bg-center bg-no-repeat flex items-center justify-center gap-10"
      // style={{ backgroundImage: "url()" }}
    >
      <Image src={'/images/NKbg.png'} alt="bg" width={1000} height={1000} className="absolute z-0 object-cover object-center top-0 left-0 w-screen h-screen" />
      <h2 className="text-3xl relative z-10 font-black text-white">Kahoot</h2>
      <div className="md:w-[400px]  relative z-10 flex flex-col p-4 gap-2 bg-white">
        {pinVerified ? (
          <>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border-2 border-gray-300 p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold"
              placeholder="Your Nickname"
            />
            <Button
              onClick={joinRoom}
              className="!w-full !p-4 !rounded-lg !text-white !bg-gray-800 !text-xl !font-semibold"
            >
              Enter
            </Button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-gray-300 p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold"
              placeholder="Game PIN"
            />
            <Button
              onClick={verifyPin}
              className="!w-full !p-4 !rounded-lg !text-white !bg-gray-800 !text-xl !font-semibold"
            >
              Enter
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Student;
