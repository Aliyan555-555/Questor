"use client"
import { useSocket } from "@/src/hooks/useSocket";
import { StudentFirstPosition } from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const page = () => {
  const student = useSelector((root: RootState) => root.student.currentGame);
  const socket = useSocket();
  const [studentResult, setStudentResult] = useState<{
    nickname: string;
    score: number;
    rank: number;
  } | null>(null);
  useEffect(() => {
    socket?.emit("calculate_ranks", {
      roomId: student?.roomId,
    });
    socket?.on("calculate_ranks_student", (data) => {
      setStudentResult(
        data.students.map(
          (s, i) =>
            s.nickname === student?.student.nickname && { ...s, rank: i + 1 }
        )
      );
    });
  }, []);
  return (
    <div className="w-screen h-screen flex items-center text-white font-bold justify-center">
      <div className="flex flex-col">
        <h2 className="drop-shadow-2xl">{studentResult?.nickname}</h2>
        {studentResult?.rank === 1 && <StudentFirstPosition />}
        <h3 className="drop-shadow-2xl">Rank: {studentResult?.rank}</h3>
        <h3 className="drop-shadow-2xl">Score: {studentResult?.score}</h3>
        {studentResult?.rank === 1 && (
          <p className="drop-shadow-2xl">Remarkable win</p>
        )}
      </div>
    </div>
  );
};

export default page;
