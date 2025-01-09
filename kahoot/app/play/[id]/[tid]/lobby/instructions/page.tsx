"use client";
import Loader from "@/src/components/Loader";
import { useSocket } from "@/src/hooks/useSocket";
import { disconnect } from "@/src/redux/schema/student";
import { RootState } from "@/src/redux/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PixelArtCard } from "react-pixelart-face-card";
import { useDispatch, useSelector } from "react-redux";

const Page = () => {
  const socket = useSocket();
  const navigation = useRouter();
  const [loading, setLoading] = useState(true);
  const student = useSelector((root: RootState) => root.student.currentGame);
  const dispatch = useDispatch() 

  const getQuizIdFromRoomId = (roomId,get) => {
    if (get === "teacher"){
       const [teacherId,quizId] = roomId.split('-');
    return teacherId;
    }else{
      const [teacherId,quizId] = roomId.split('-');
      return quizId;
    }
   
  };

  useEffect(() => {
    const handleStudentJoined = (students) => {
      console.log(students);
    };

    const handleUserInRoom = (status) => {
      console.log(status)
      if (!status) {
        navigation.push(`/play/${getQuizIdFromRoomId(student.roomId,'quiz')}/${getQuizIdFromRoomId(student.roomId,'teacher')}/lobby`);
      }
    };

    socket?.on("started",() =>{
      navigation.push(`/play/${getQuizIdFromRoomId(student.roomId,'quiz')}/${getQuizIdFromRoomId(student.roomId,'teacher')}/lobby/instructions/start`);
    })

    socket?.on("studentJoined", handleStudentJoined);
    socket?.emit("checkUserInRoom", {roomId:student.roomId,studentData:student.student });
    socket?.on("userInRoom", handleUserInRoom);
    socket?.on('recreation',() =>{
          navigation.push(`/play/${getQuizIdFromRoomId(student.roomId,'quiz')}/${getQuizIdFromRoomId(student.roomId,'teacher')}/lobby`)
         setTimeout(() => {
          dispatch(disconnect());
         }, 2000);
        })
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave? Any unsaved progress might be lost.";
      event.returnValue = message;  // Required for some browsers
      return message;  // Show the confirmation dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket?.off("studentJoined", handleStudentJoined);
      socket?.off("userInRoom", handleUserInRoom);
    };
  }, [socket, navigation, student]);

  return (
    <div className="w-screen flex-col text-4xl font-semibold text-white h-screen flex items-center justify-center">
      {loading ? (
        <Loader h={100} w={100} />
      ) : (
        <PixelArtCard
          key={student.student._id}
          random={true}
          size={100}
          tags={["human-female", "human-male"]}
        />
      )}
      {student.student.nickname}
      <p className="text-center">You're in! See your nickname on screen?</p>
    </div>
  );
};

export default Page;
