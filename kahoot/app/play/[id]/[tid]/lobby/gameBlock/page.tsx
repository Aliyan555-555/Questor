"use client";
import {
  CancelIcon,
  CircleIcon,
  CorrectIcon,
  DiamondIcon,
  FirstRankIcon,
  QuizIcon,
  SecondRankIcon,
  SquareIcon,
  ThirdRankIcon,
  TriangleIcon,
} from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { useConfetti } from "@stevent-team/react-party";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { PixelArtCard } from "react-pixelart-face-card";
// import { div } from "framer-motion/client";
import { useSocket } from "@/src/hooks/useSocket";
import { update } from "@/src/redux/schema/teacher";

const QuestionSection = ({ question, roomId, questionData, socket,questionIndex }) => {
  useEffect(() => {
    socket?.on("student_waiting", () => {
      socket?.emit("request_question_options_waiting", {
        roomId,
        question: questionData,
        questionIndex,
      });
      setTimeout(() => {
        socket?.emit("request_question_options_stop_waiting", {
          roomId,
          question: questionData,
          questionIndex,
        });
      }, 8000);

      return () => {
        socket?.off("request_question_options_waiting");
        socket?.off("request_question_options_stop_waiting");
      };
    });
  }, []);
  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        animate={{ margin: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full flex items-center m-auto justify-center pt-2"
      >
        <motion.div
          initial={{ scale: 3, rotateY: 0, translateY: "300px" }}
          animate={{
            scale: [3, 3, 2, 1, 1],
            translateY: ["300px", "300px", "300px", "0", "0"],
            rotateY: [0, 0, 0, 0, 360],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            delay: 1,
            times: [0, 0.25, 0.5, 0.75, 1], // Properly spaced timeline
            repeat: 0,
            repeatDelay: 1,
          }}
          className="bg-[#00000071] relative rounded-full flex items-center justify-center w-[70px] h-[70px]"
        >
          <QuizIcon />
          <motion.div
            animate={{ opacity: [1, 1, 0], scale: [1.5, 1, 1.5] }}
            transition={{ duration: 0.3, delay: 2 }}
            className="bg-[#00000071]  px-[100px] py-1 text-lg text-white font-bold absolute top-[120%]"
          >
            Quiz
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.1 }}
        className="w-full font-bold text-center mt-[300px] py-2 opacity-0 text-5xl leading-[60px] bg-white text-black"
      >
        {question}
      </motion.div>
      <div className="w-[90%] h-[25px] m-auto">
        <motion.div
          animate={{ width: "100%" }}
          transition={{ duration: 5, delay: 3.1 }}
          className="bg-purple-600 rounded-[50px] h-full w-0"
        ></motion.div>
      </div>
    </div>
  );
};

const OptionsSection = ({ data, currentQuestionIndex, setStage }) => {
  const question = data.kahoot.questions[currentQuestionIndex];
  const icons = [
    { icon: <TriangleIcon /> },
    { icon: <DiamondIcon /> },
    { icon: <CircleIcon /> },
    { icon: <SquareIcon /> },
  ];
  const colors = ["red", "blue", "#C79200", "green"];
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    // socket?.emit("request_question_options_waiting",question);
    const timer = setInterval(() => {
      setDuration((prev) => {
        if (prev === 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`w-full h-full fixed top-0 left-0 ${
        duration === 0 && " bg-[#000a]"
      } p-4 flex-col flex items-center justify-between`}
    >
      <button
        onClick={() => {
          setStage(3);
        }}
        className="px-6 py-2 text-lg font-black bg-white absolute right-4 top-4"
      >
        {data.students.length === question.attemptStudents.length ?"Next":duration === 0 ? "Next" : "Skip"}
      </button>
      <div className="w-[80%] text-wrap px-4 py-3 text-4xl leading-[60px] font-bold text-center text-black bg-white">
        {question.question}
      </div>
      <div className="w-full flex justify-between">
        <div className="w-[100px] h-[100px] flex items-center justify-center bg-white text-black rounded-full text-4xl font-bold">
          <span>{duration}</span>
        </div>
        <div className="w-[100px] h-[100px] flex items-center justify-center bg-white text-black rounded-full text-4xl font-bold">
          <span>{question.attemptStudents.length}</span>
        </div>

      </div>
      <div className="w-full flex gap-2 flex-wrap">
        {question.options.map((option, i) => (
          <button
            key={i}
            disabled={duration === 0 && i !== question.answerIndex[0]}
            style={{ background: colors[i] }}
            className="w-[49%] cursor-pointer disabled:opacity-35 flex p-5 text-3xl items-center justify-between gap-4 font-semibold text-white"
          >
            <div className="flex gap-4 items-center">
              <span>{icons[i].icon}</span>
              <p>{option}</p>
            </div>
            {duration === 0 &&
              (i === question.answerIndex[0] ? (
                <CorrectIcon />
              ) : (
                <CancelIcon />
              ))}
          </button>
        ))}
      </div>
    </div>
  );
};

const ScoreBoard = ({ data, nextQuestion }) => {
  return (
    <div className="w-full p-4 flex flex-col items-center h-full relative">
      <button
        onClick={nextQuestion}
        className="px-6 py-2 text-lg font-black bg-white absolute right-4 top-4"
      >
        Next
      </button>
      <div className="w-fit bg-white text-black text-4xl font-bold px-6 py-3">
        Scoreboard
      </div>
      <div className="flex w-full flex-col items-center gap-3 justify-center flex-1">
        {data.kahoot.students.map((student, i) => (
          <div
            key={student.id}
            className="bg-white rounded-xl text-2xl flex items-center justify-between font-semibold text-black w-[70%] p-1"
          >
            <div className="flex items-center">
              <PixelArtCard
                key={student.id + i}
                random={true}
                size={60}
                tags={["human-female", "human-male"]}
              />
              <p className="px-2"> {student.nickname}</p>
            </div>
            <p className="px-4"> {student.score.toFixed(0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
const RankSection = ({ data }) => {
  const { createConfetti, canvasProps } = useConfetti({
    count: 300,
    gravity: 11,
    speed: 1.9,
  });

  useEffect(() => {
    setTimeout(() => {
      createConfetti();
    }, 12000);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center  text-white">
      <canvas {...canvasProps} />
      <motion.div
        initial={{ translateY: "200px", scale: 1.1 }}
        animate={{ translateY: "-100px", scale: 1 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="w-fit scale-150 bg-white text-black px-10 py-4 text-4xl font-bold "
      >
        {data.kahoot.name}
      </motion.div>

      <div className="flex">
        <motion.div
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
          }}
          initial={{
            translateY: "600px",
            translateX: "-300px",
            scale: 1,
            opacity: 1,
          }}
          animate={{
            translateY: ["600px", "200px", "200px", "200px"],
            translateX: ["300px", "300px", "300px", "0px"],
            scale: [1, 1.2, 1.2, 1],
            opacity: [1, 1, 1, 0.8],
          }}
          transition={{
            delay: 6,
            duration: 5,
            times: [0, 0.3, 0.6, 1],
            ease: "easeInOut",
          }}
          className="w-[300px] h-[400px] z-[100] bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <SecondRankIcon />
          <h3 className="text-4xl font-bold">{"aliyan"}</h3>
          <p className="text-2xl font-semibold py-4">0</p>
        </motion.div>{" "}
        <motion.div
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
          }}
          initial={{
            translateY: "600px",
            translateX: "0",
            scale: 1.2,
            opacity: 1,
          }}
          animate={{ translateY: ["600px", "150px", "150px", "150px"] }}
          transition={{ delay: 10, duration: 5, ease: "easeInOut" }}
          className="w-[300px] z-[1000] h-[400px] bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <FirstRankIcon />
          <h3 className="text-4xl font-bold">{"aliyan"}</h3>
          <p className="text-2xl font-semibold py-4">0</p>
        </motion.div>
        <motion.div
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
          }}
          initial={{
            translateY: "600px",
            translateX: "-300px",
            scale: 1,
            opacity: 1,
          }}
          animate={{
            translateY: ["600px", "200px", "200px", "200px"],
            translateX: ["-300px", "-300px", "-300px", "0px"],
            scale: [1, 1.2, 1.2, 1],
            opacity: [1, 1, 1, 0.8],
          }}
          transition={{
            delay: 0.5,
            duration: 5,
            times: [0, 0.3, 0.6, 1], // Corrected to match keyframes
            ease: "easeInOut",
          }}
          className="w-[300px] h-[400px] bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <ThirdRankIcon />
          <h3 className="text-4xl font-bold">{"Aliyan"}</h3>
          <p className="text-2xl font-semibold py-4">0</p>
        </motion.div>
      </div>
    </div>
  );
};

const Page = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const [stage, setStage] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  useEffect(() => {
    const url = `/play/${teacher.quizId}/${teacher.teacherId}/lobby/instructions/get-ready`;
    socket?.emit("question_playing", {
      currentQuestionIndex: currentQuestionIndex,
      url,
      roomId: `${teacher.teacherId}-${teacher.quizId}`,
    });

    return () => {
      socket?.off("question_playing");
    };
  }, [socket]);
  useEffect(() => {
    socket?.on("resultsData",(data) => {
      dispatch(update(data.data));
    });
  }, []);
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 === teacher.kahoot.questions.length) {
      setStage(4);
      socket?.emit("ranking_redirection",{roomId:`${teacher.teacherId}-${teacher.quizId}`});
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setStage(1);
      socket?.emit("next_question_redirect",{roomId:`${teacher.teacherId}-${teacher.quizId}`});
    }
  };
  useEffect(() => {
    if (stage === 1) {
      setTimeout(() => setStage(2), 8000);
    }
  }, [stage]);

  return (
    <div className="w-screen h-screen">
      {stage === 1 && (
        <QuestionSection
          questionData={teacher.kahoot.questions[currentQuestionIndex]}
          roomId={`${teacher.teacherId}-${teacher.quizId}`}
          questionIndex={currentQuestionIndex + 1}
          question={teacher.kahoot.questions[currentQuestionIndex].question}
          socket={socket}
        />
      )}
      {stage === 2 && (
        <OptionsSection
          data={teacher}
          // socket={socket}
          currentQuestionIndex={currentQuestionIndex}
          setStage={setStage}
        />
      )}
      {stage === 3 && <ScoreBoard data={teacher} nextQuestion={nextQuestion} />}
      {stage === 4 && <RankSection data={teacher} />}
    </div>
  );
};

export default Page;
