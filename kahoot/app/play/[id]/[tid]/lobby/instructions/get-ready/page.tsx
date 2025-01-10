"use client";
import { useSocket } from "@/src/hooks/useSocket";
import {
  CircleIcon,
  DiamondIcon,
  KahootIcon,
  SquareIcon,
  TriangleIcon,
} from "@/src/lib/svg";
import { disconnect, update } from "@/src/redux/schema/student";
import { RootState } from "@/src/redux/store";
import { Question } from "@/src/types";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


interface CurrentQuestion {
  question: Question;
  questionIndex: number;
}

const Page = () => {
  const socket = useSocket();
  const params = useParams();
  const teacherId = params.tid;
  const quizId = params.id;
  const dispatch = useDispatch();
  const student = useSelector((root: RootState) => root.student.currentGame);
  const [loading, setLoading] = useState(true);
  const navigation = useRouter();
  const [timeCount, setTimeCount] = useState(30);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] =
    useState<CurrentQuestion | null>(null);

  const icons = [
    { icon: <TriangleIcon width={130} height={130} /> },
    { icon: <DiamondIcon width={130} height={130} /> },
    { icon: <CircleIcon width={130} height={130} /> },
    { icon: <SquareIcon width={130} height={130} /> },
  ];
  const colors = ["red", "blue", "#C79200", "green"];

  useEffect(() => {
    socket?.emit("student_waiting");
    const handleQuestionStart = (data: CurrentQuestion) => {
      setCurrentQuestion(data);
      setLoading(true);
      setQuestionIndex(data.questionIndex);
      console.log(data);
    };

    const handleQuestionStop = () => {
      setLoading(false);
      console.log(currentQuestion);
    };
    console.log(student);
    socket?.on("question_options_waiting", handleQuestionStart);
    socket?.on("question_options_stop_waiting", handleQuestionStop);
    socket?.on("error", ({ message }) => {
      console.log(message);
    });
    socket?.on("recreation", () => {
      navigation.push(`/play/${quizId}/${teacherId}/lobby`);
      setTimeout(() => {
        dispatch(disconnect());
      }, 2000);
    });
    socket?.on("results", (data) => {
      dispatch(update({ student: data.student }));
      console.log(data);
      setScore(data.student.score);
      navigation.push(
        `/play/${quizId}/${teacherId}/lobby/instructions/get-ready/answer/result?r=${encodeURIComponent(
          JSON.stringify(data.question)
        )}`
      );
    });
    // const handleBeforeUnload = (event) => {
    //   const message = "Are you sure you want to leave? Any unsaved progress might be lost.";
    //   event.returnValue = message;
    //   return message;
    // };

    // window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // window.addEventListener("beforeunload", handleBeforeUnload);
      socket?.off("results");
      socket?.off("error");
      socket?.off("recreation");
      socket?.off("question_options_waiting", handleQuestionStart);
      socket?.off("question_options_stop_waiting", handleQuestionStop);
    };
  }, [socket]);

  useEffect(() => {
  if (!loading){
    const timer = setInterval(() => {
      setTimeCount((prev) => {
        if (prev === 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
  });

  const handleSubmitQuestionAnswer = (answer:string) => {
    socket?.emit("submit_question_answer", {
      answer,
      studentId: student?.student._id,
      question: currentQuestion,
      duration: 30,
      timeTaken: timeCount,
    });
  };

  useEffect(() => {
    if (timeCount === 0){
      // handleSubmitQuestionAnswer('wrong');
      navigation.push(`/play/${quizId}/${teacherId}/lobby/instructions/get-ready/answer/result?action=timeUp&r=${encodeURIComponent(
        JSON.stringify({...currentQuestion,resultStatus:"Time's up",studentRank:0,studentTakenMarks:0})
      )}`);
    }
  })

  return (
    <div className="w-screen h-screen flex flex-col relative">
      <div className="w-full flex px-[10px] relative justify-center p-3">
        <div className="bg-white absolute flex items-center left-3 justify-center rounded-full w-[40px] h-[40px] text-xl">
          <p>{timeCount}</p>
        </div>
        <div className="bg-white  rounded-[50px] w-[120px] flex items-center px-2 h-[40px] text-xl">
          <KahootIcon w={30} h={30} />
          <p className="text-lg font-bold ml-3">Quiz</p>
        </div>
      </div>
      <div className="w-full h-[90%] flex items-center justify-center ">
        {loading ? (
          <div className="w-full flex items-center flex-col justify-center gap-5 ">
            <h3 className="text-4xl font-bold text-white">
              Question {Number(questionIndex) +1}
            </h3>
            <svg
              className="animate-spin w-32 h-32"
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
          </div>
        ) : (
          <div className="w-full pb-14 md:pb-16 px-2 md:px-6 h-full grid grid-cols-2 grid-rows-2 gap-2">
            {currentQuestion?.question.options.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleSubmitQuestionAnswer(answer)}
                style={{ backgroundColor: colors[index] }}
                className="flex items-center border-b-8 border-l-4 border-r-8 border-t-4  border-[#0000003e] justify-center w-full h-[99%] md:h-full"
              >
                {icons[index]?.icon}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="w-full flex items-center justify-between px-4 text-xl font-bold h-[60px] bg-slate-50 absolute bottom-0">
        <p>{student?.student.nickname}</p>
        <p className="bg-black text-white px-8 py-2 rounded-lg">
          {score.toFixed(0)}
        </p>
      </div>
    </div>
  );
};

export default Page;
