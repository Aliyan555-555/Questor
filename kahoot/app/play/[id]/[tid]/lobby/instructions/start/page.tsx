"use client";
import { useSocket } from "@/src/hooks/useSocket";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const socket = useSocket();
  const navigation = useRouter();
  useEffect(() => {
    socket?.on("question_playing_student_process", ({url}) => {
      navigation.push(url);
    });

    

  }, []);
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center ">
      <h3 className="text-7xl font-black text-white mb-6">Get Ready!</h3>
      <svg
        className="animate-spin w-48 h-48"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        fill="none"
      >
        <circle
          className="opacity-50"
          cx="50"
          cy="50"
          r="40"
          stroke="white"
          strokeWidth="20"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="white"
          strokeWidth="20"
          strokeDasharray="157 157"
          strokeDashoffset="0"
        />
      </svg>
      <h4 className="text-white text-3xl font-bold mt-6">Loading...</h4>
    </div>
  );
};

export default Page;
