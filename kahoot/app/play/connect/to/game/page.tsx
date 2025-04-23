"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { join } from "@/src/redux/schema/student";
import { useSocket } from "@/src/hooks/useSocket";
import { Student as StudentDate } from "@/src/types";
import Image from "next/image";

const Student = () => {
  // const params = useParams();
  const query = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const {socket} = useSocket();
  const [roomId, setRoomId] = useState<null | string>(null);
  const [teacherId,setTeacherId] = useState<null | string>(null)
  const [nickname, setNickname] = useState("");
  const isQR = query.get("qr");
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
      socket.emit("verifyPin", { pin });
    }else {
    }
  };

  useEffect(() => {
    if (socket) {
      console.log("connected");
      const handleJoinedRoom = ({
        roomId,
        student,
        refreshToken,
      }: {
        roomId: string;
        student: StudentDate;
        refreshToken: string;
      }) => {
        dispatch(join({ roomId, student, refreshToken }));
        router.push(`/play/${roomId}/${teacherId}/lobby/instructions`);
      };

      const handleNicknameError = (error: { message: string }) => {
        toast.error(error.message);
      };

      const handlePinVerified = (data: { status: boolean; roomId: string;teacherId:string }) => {
        if (data.status) {
          setRoomId(data.roomId);
          setTeacherId(data.teacherId)
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
  });

  useEffect(() => {
    if (isQR && pin != "") {
      verifyPin();
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (pinVerified) {
          joinRoom();
        } else {
          verifyPin();
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pinVerified, pin, nickname]);

  // useEffect(() => {
  //  if (socket?.id){ 
  //   // socket?.disconnect();
  //  }else {
  //   socket?.connect();
  //  }
  // },[])

  return (
    <div
      className="w-screen overflow-hidden bg-[#E9E2B6] px-4 h-screen relative flex-col bg-cover bg-center bg-no-repeat flex items-center justify-center"    >
    

    <div className="bg-white max-sm:w-full px-4 md:px-8 py-10 flex items-center justify-start gap-10 flex-col rounded-[10px]">
      
      <Image src={'/images/UI/fullLogo.png'} alt="Quester" width={200} height={100}  />
      <div className="md:w-[400px] w-full  relative z-10 flex flex-col gap-4 bg-white">
        {pinVerified ? (
          <>
            <input
              type=""
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border-2 border-[#FBA732] p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold"
              placeholder="Your Nickname"
            />
            <Button
              onClick={joinRoom}
              className="!w-full !p-4 !rounded-lg !text-black !bg-[#FBA732] !text-xl !font-semibold"
            >
              Go!
            </Button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-[#FBA732] p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold"
              placeholder="Game PIN"
            />
            <Button
              onClick={verifyPin}
              className="!w-full !p-4 !rounded-lg !text-black !bg-[#FBA732] !text-xl !font-semibold"
            >
              Go!
            </Button>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default Student;
