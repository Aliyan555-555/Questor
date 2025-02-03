"use client";
import {
  CancelIcon,
  CircleIcon,
  CorrectIcon,
  DiamondIcon,
  FirstRankIcon,
  QuizIcon,
  SecondRankIcon,
  SliderIcon,
  SquareIcon,
  ThirdRankIcon,
  TriangleIcon,
  TrueFalseIcon,
  TypeAnswerIcon,
} from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { useConfetti } from "@stevent-team/react-party";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/src/hooks/useSocket";
import { update } from "@/src/redux/schema/teacher";
import { Socket } from "socket.io-client";
import { Question, Student, Teacher } from "@/src/types";
import { MdFullscreen } from "react-icons/md";
import AnimatedAvatar from "@/src/components/animated/AnimatedAvatar";
import Image from "next/image";
import imageLoader from "@/src/components/ImageLoader";

const QuestionSection = ({
  question,
  roomId,
  questionData,
  socket,
  questionIndex,
}: {
  question: string | undefined;
  roomId: string;
  questionData: Question | undefined;
  socket: Socket | null;
  questionIndex: string;
}) => {
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
         {questionData.type === 'quiz' && <QuizIcon />}
         {questionData.type === "true/false" && <TrueFalseIcon h={80} w={80} />}
         {questionData.type === "slider" && <SliderIcon w={80} h={80} />}
         {questionData.type === "typeanswer" && <TypeAnswerIcon h={80} w={80} />}

          <motion.div
            animate={{ opacity: [1, 1, 0], scale: [1.5, 1, 1.5] }}
            transition={{ duration: 0.3, delay: 2 }}
            className="bg-[#00000071]  px-[100px] py-1 text-lg text-white font-bold absolute top-[120%]"
          >
            {questionData.type}
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

const OptionsSection = ({
  data,
  currentQuestionIndex,
  setStage,
}: {
  data: Teacher | null;
  currentQuestionIndex: number;
  setStage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const question = data?.kahoot.questions[currentQuestionIndex];
  const icons = [
    { icon: <TriangleIcon width={50} height={50} /> },
    { icon: <DiamondIcon width={50} height={50} /> },
    { icon: <CircleIcon width={50} height={50} /> },
    { icon: <SquareIcon width={50} height={50} /> },
  ];
  const colors = ["red", "blue", "#C79200", "green"];
  const [duration, setDuration] = useState(data?.kahoot.questions[currentQuestionIndex].duration);
  const [isTimesUp, setIsTimesUp] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element

  // Function to play the audio based on the state
  const playAudio = (fileName: string, loop: boolean) => {
    if (audioRef.current) {
      audioRef.current.src = `/audios/${fileName}`;
      audioRef.current.loop = loop;
      audioRef.current.play().catch((err) => {
        console.log("Audio play error:", err);
      });
    }
  };

  // Handle timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev:SetStateAction<number | undefined>) => {
        if (prev === 0) {
          setIsTimesUp(true);
          clearInterval(timer);
          return 0;
        }
        if (prev === undefined || prev === null) {
          return 0;
        }
        return typeof prev === 'number' ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if all students have attempted the question
  useEffect(() => {
    if (data?.kahoot.students.length === question?.attemptStudents.length) {
      setIsTimesUp(true);
    }
  }, [data, question?.attemptStudents.length]);

  // Effect to control audio based on time
  useEffect(() => {
    if (isTimesUp) {
      playAudio("GameOver.mp3", false); // Play Game Over audio when time is up
    } else {
      playAudio("lobby-halloween.webm", true); // Play lobby music when the timer is running
    }
  }, [isTimesUp]);

  return (
    <div
      className={`w-full h-full fixed top-0 left-0 ${
        isTimesUp && " bg-[#000a]"
      } p-2 md:p-4 flex-col flex relative items-center justify-between`}
    >
      <button
        onClick={() => {
          setStage(3);
        }}
        disabled={!isTimesUp}
        className="px-6 py-2 disabled:bg-slate-100 text-lg font-black bg-white absolute right-4 top-4"
      >
        {data?.kahoot.students.length === question?.attemptStudents.length
          ? "Next"
          : duration === 0
          ? "Next"
          : "Next"}
      </button>
      <div className="w-[80%] text-wrap px-4 py-3 text-4xl leading-[60px] font-bold text-center text-black bg-white">
        {question?.question}
      </div>
      <div className="w-full flex justify-between">
        <div className="w-[100px] h-[100px] flex items-center justify-center bg-white text-black rounded-full text-4xl font-bold">
          <span>{duration}</span>
        </div>

       {question.media !== "" && (
         <div className="w-[400px] h-[300px] bg-white">
         <Image
         src={question.media}
         alt={question.question}
         className="w-full h-full object-cover"
         loader={imageLoader}
         width={400}
         height={300}
         />

       </div>
       )}
        <div className="w-[100px] h-[100px] flex items-center justify-center bg-white text-black rounded-full text-4xl font-bold">
          <span>{question?.attemptStudents.length}</span>
        </div>
      </div>
      
      <div className="w-full flex gap-2  flex-wrap">
        {question?.options.map((option, i) => (
          <button
            key={i}
            disabled={isTimesUp && i !== question.answerIndex[0]}
            style={{ background: colors[i] }}
            className="w-[49%] cursor-pointer disabled:opacity-35 flex p-4 text-3xl items-center justify-between gap-4 font-semibold text-white"
          >
            <div className="flex gap-4 items-center">
              <span>{icons[i].icon}</span>
              <p>{option}</p>
            </div>
            {isTimesUp &&
              (i === question.answerIndex[0] ? (
                <CorrectIcon />
              ) : (
                <CancelIcon />
              ))}
          </button>
        ))}
      </div>
      <div className="absolute bottom-2 w-screen left-0 flex items-center justify-end gap-2">
        <div className="bg-[#0000009a] flex mr-2 rounded-lg px-1 p-[6px] text-3xl text-white font-black">
          <MdFullscreen fontSize={40} />
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} hidden />
    </div>
  );
};

const ScoreBoard = ({
  data,
  nextQuestion,
}: {
  data: Teacher | null;
  nextQuestion: () => void;
}) => {
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
        {data?.kahoot.students
          // .sort((a, b) => b.score - a.score) // Sort by score, descending order
          .map((student) => (
            <div
              key={student._id}
              className="bg-white rounded-xl text-2xl flex items-center justify-between font-semibold text-black w-[70%] p-1"
            >
              <div className="flex items-center">
                <AnimatedAvatar
                  avatarData={student.avatar}
                  avatarItems={student.item}
                  w="50px"
                  h="50px"
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
const RankSection = ({
  data,
  socket,
}: {
  data: Teacher | null;
  socket: Socket | null;
}) => {
  const { createConfetti, canvasProps } = useConfetti({
    count: 500,
    gravity: 11,
    speed: 1.9,
  });
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    socket?.emit("calculate_ranks", {
      roomId: `${data?.teacherId}-${data?.quizId}`,
    });
    socket?.on("calculate_ranks_student", (data) => {
      setStudents(data.students);
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      createConfetti();
    }, 12000);
  }, []);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center  text-white">
      <canvas
        ref={canvasProps.ref as React.RefObject<HTMLCanvasElement>}
        style={canvasProps.style as React.CSSProperties}
      />
      <motion.div
        initial={{ translateY: "200px", scale: 1.1 }}
        animate={{ translateY: "-100px", scale: 1 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="w-fit scale-150 bg-white text-black px-10 py-4 text-4xl font-bold "
      >
        {data?.kahoot.name}
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
          className="w-[300px] h-[400px] z-[100] relative bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            className="absolute top-0 "
            animate={{ translateY: -125, opacity: 1 }}
            transition={{ delay: 7.5, duration: 0.8 }}
          >
            {students.length >= 2 && (
              <AnimatedAvatar
                avatarData={students[1].avatar}
                avatarItems={students[1].item}
                bg="#0000"
              />
            )}
          </motion.div>
          <SecondRankIcon />
          <h3 className="text-4xl font-bold">
            {students.length >= 2 && students[1].nickname}
          </h3>
          <p className="text-2xl font-semibold py-4">
            {students.length >= 2 && students[1].score.toFixed(0)}
          </p>
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
          className="w-[300px] z-[1000] h-[400px] relative bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            className="absolute top-0 "
            animate={{ translateY: -150, opacity: 1 }}
            transition={{ delay: 11, duration: 0.8 }}
          >
            {students.length >= 1 && (
              <AnimatedAvatar
                avatarData={students[0].avatar}
                avatarItems={students[0].item}
                bg="#0000"
                w="150px"
                chin={true}
                h="150px"
              />
            )}
          </motion.div>
          <FirstRankIcon />
          <h3 className="text-4xl font-bold">
            {students.length >= 1 && students[0].nickname}
          </h3>
          <p className="text-2xl font-semibold py-4">
            {students.length >= 1 && students[0].score.toFixed(0)}
          </p>
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
          className="w-[300px] h-[400px] relative bg-purple-700 flex items-center flex-col rounded-lg text-white py-10"
        >
          <ThirdRankIcon />
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            className="absolute top-0 "
            animate={{ translateY: -125, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            {students.length >= 3 && (
              <AnimatedAvatar
                avatarData={students[2].avatar}
                avatarItems={students[2].item}
                bg="#0000"
              />
            )}
          </motion.div>
          <h3 className="text-4xl font-bold">
            {students.length >= 3 && students[2].nickname}
          </h3>
          <p className="text-2xl font-semibold py-4">
            {students.length >= 3 && students[2].score.toFixed(0)}
          </p>
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
    const url = `/play/${teacher?.quizId}/${teacher?.teacherId}/lobby/instructions/get-ready`;
    socket?.emit("question_playing", {
      currentQuestionIndex: currentQuestionIndex + 1,
      url,
      roomId: `${teacher?.teacherId}-${teacher?.quizId}`,
    });

    return () => {
      socket?.off("question_playing");
    };
  }, [socket]);
  useEffect(() => {
    socket?.on("resultsData", (data) => {
      dispatch(update(data.data));
    });
  }, []);
  console.log(teacher);
  const nextQuestion = () => {
    if (currentQuestionIndex + 1 === teacher?.kahoot.questions.length) {
      setStage(4);
      socket?.emit("ranking_redirection", {
        roomId: `${teacher.teacherId}-${teacher.quizId}`,
      });
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setStage(1);
      socket?.emit("next_question_redirect", {
        roomId: `${teacher?.teacherId}-${teacher?.quizId}`,
      });
    }
  };
  useEffect(() => {
    if (stage === 1) {
      setTimeout(() => setStage(2), 8000);
    }
  }, [stage]);

  return (
    <div style={{backgroundImage:`url(${teacher?.kahoot.theme.image})`}} className="w-screen h-screen bg-cover bg-top overflow-hidden">
      {stage === 1 && (
        <QuestionSection
          question={teacher?.kahoot.questions[currentQuestionIndex].question}
          roomId={`${teacher?.teacherId}-${teacher?.quizId}`}
          questionData={teacher?.kahoot.questions[currentQuestionIndex]}
          socket={socket}
          questionIndex={`${currentQuestionIndex}`}
        />
      )}
      {stage === 2 && (
        <OptionsSection
          data={teacher}
          currentQuestionIndex={currentQuestionIndex}
          setStage={setStage}
        />
      )}
      {stage === 3 && <ScoreBoard data={teacher} nextQuestion={nextQuestion} />}
      {stage === 4 && <RankSection data={teacher} socket={socket} />}
    </div>
  );
};

export default Page;
