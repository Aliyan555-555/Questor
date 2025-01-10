"use client";
import { useSocket } from "@/src/hooks/useSocket";
// import { StudentFirstPosition } from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { Student } from "@/src/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Ranking = () => {
  const params = useParams();
  const teacherId = params.tid;
  const quizId = params.id;
  
  const student = useSelector((root: RootState) => root.student.currentGame);
  const socket = useSocket();
  
  const [studentResult, setStudentResult] = useState<{
    nickname: string;
    score: number;
    rank: number;
  } | null>(null);

  useEffect(() => {
    if (student?.student.nickname) {
      socket?.emit("calculate_ranks", {
        roomId: `${teacherId}-${quizId}`,
      });

      socket?.on("calculate_ranks_student", (data) => {
        // Find the student with the matching nickname
        const result = data.students.find((s:Student) => s.nickname === student?.student.nickname);
        
        if (result) {
          // Find the rank of the student
          const rank = data.students.indexOf(result) + 1;
          setStudentResult({
            ...result,
            rank,
          });
        }
      });
    }
    
    // Clean up socket listener
    return () => {
      socket?.off("calculate_ranks_student");
    };
  }, [socket, student?.student.nickname, teacherId, quizId]);

  return (
    <div className="w-screen h-screen flex  items-center text-white font-bold justify-center">
      <div className="flex flex-col items-center">
        <h2 className="drop-shadow-2xl text-3xl">{studentResult?.nickname}</h2>
        {/* {studentResult?.rank === 1 && <StudentFirstPosition />} */}
        <h3 className="drop-shadow-2xl text-xl">Rank: {studentResult?.rank}</h3>
        <h3 className="drop-shadow-2xl text-xl">Score: {studentResult?.score.toFixed(0)}</h3>
        {studentResult?.rank === 1 && (
          <p className="drop-shadow-2xl text-xl">Remarkable win</p>
        )}
      </div>
    </div>
  );
};

export default Ranking;
