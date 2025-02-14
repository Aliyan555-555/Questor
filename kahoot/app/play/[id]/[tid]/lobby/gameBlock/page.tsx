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
import React, {  useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/src/hooks/useSocket";
import { updateStudentScore } from "@/src/redux/schema/teacher";
import { Socket } from "socket.io-client";
import { Question, Student, Teacher } from "@/src/types";
import { MdFullscreen } from "react-icons/md";
import AnimatedAvatar from "@/src/components/animated/AnimatedAvatar";
import Image from "next/image";
import imageLoader from "@/src/components/ImageLoader";
import { useRouter } from "next/navigation";

const QuestionSection = React.memo(
  ({
    question,
    questionData,
  }: {
    question: string | undefined;
    questionData: Question | undefined;
   
  }) => {
  
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
  }  
)
QuestionSection.displayName = "QuestionSection";
const OptionsSection = React.memo(({
    data,
    currentQuestionIndex,
    setStage,
    socket
  }: {
    data: Teacher | null;
    currentQuestionIndex: number;
    setStage: React.Dispatch<React.SetStateAction<number>>;
    socket:Socket
  }) => {
    const question = data?.quiz.questions[currentQuestionIndex];
    const icons = [
      { icon: <TriangleIcon width={50} height={50} /> },
      { icon: <DiamondIcon width={50} height={50} /> },
      { icon: <CircleIcon width={50} height={50} /> },
      { icon: <SquareIcon width={50} height={50} /> },
    ];
    const colors = ["red", "blue", "#C79200", "green"];
    const [duration, setDuration] = useState(data?.quiz.questions[currentQuestionIndex].duration);
    const [isTimesUp, setIsTimesUp] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for audio element
  
    const playAudio = (fileName: string, loop: boolean) => {
      if (audioRef.current) {
        audioRef.current.src = `/audios/${fileName}`;
        audioRef.current.loop = loop;
        audioRef.current.play().catch((err) => {
          console.log("Audio play error:", err);
        });
      }
    };
  
    console.log(data)
    useEffect(() => {
      if (!socket || !data) return;
  
      const timer = setInterval(() => {
        setDuration((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsTimesUp(true);
            return 0;
          }
          const newCount = prev - 1;
          socket.emit("setCount", { roomId: data._id, count: newCount,duration:data?.quiz.questions[currentQuestionIndex].duration });
          return newCount;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [socket, data]);
    // useEffect(() => {
    //  if (socket){
    //   const handleSetCount = ({ count }: { count: number }) => {
    //     setDuration(count);
    //     if (count === 0) setIsTimesUp(true);
    //   };

    //  }
    //   return () => socket?.off("setCount");
    // }, [socket]);
    console.log(data)
    // useEffect(() => {
    //   // if (data.students.length === question?.attemptStudents.length) {
    //     // setIsTimesUp(true);
    //   // }
    // }, [data]);
    useEffect(() => {
      if (isTimesUp) {
        playAudio("GameOver.mp3", false);
      } else {
        playAudio("lobby-halloween.webm", true);
      }
    }, [isTimesUp]);
    return (
      <div
        className={`w-full h-full fixed top-0 left-0 ${isTimesUp && " bg-[#000a]"
          } p-2 md:p-4 flex-col flex relative items-center justify-between`}
      >
        <button
          onClick={() => {
            setStage(3);
          }}
          disabled={!isTimesUp}
          className="px-6 py-2 disabled:bg-slate-100 text-lg font-black bg-white absolute right-4 top-4"
        >
          {/* {data?.students.length === question?.attemptStudents.length
            ? "Next"
            : duration === 0
              ? "Next"
              : "Next"} */}
              Next
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
  }
);
OptionsSection.displayName = "OptionsSection"

const ScoreBoard = React.memo(({
  data,
  nextQuestion,
}: {
  data: Teacher | null;
  nextQuestion: () => void;
}) => {
  if (!data || !data.students) {
    return <p className="text-white text-2xl">No data available</p>;
  }
  const students = [...data.students]
    .filter((student) => typeof student.score === "number" && !isNaN(student.score))
    .sort((a, b) => Number(b.score.toFixed(0)) - Number(a.score.toFixed(0)));
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
        {students.length === 0 ? (
          <p className="text-white text-2xl">No students available</p>
        ) : (
          students.map((student) => (
            <div
              key={student._id || Math.random()} // Ensure unique keys
              className="bg-white rounded-xl text-2xl flex items-center justify-between font-semibold text-black w-[70%] p-1"
            >
              <div className="flex items-center">
                <AnimatedAvatar
                  avatarData={student.avatar}
                  avatarItems={student.item}
                  w="50px"
                  h="50px"
                />
                <p className="px-2">{student.nickname || "Unknown"}</p>
              </div>
              <p className="px-4">{student.score?.toFixed(0) || "0"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
ScoreBoard.displayName = "ScoreBoard"
const RankSection = React.memo(
  ({
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
        roomId: data._id,
      });
      socket?.on("calculate_ranks_student", (data) => {
        console.log(data)
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
          {data?.quiz.name}
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
  }
);
RankSection.displayName = "RankSection"

const Page = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const [stage, setStage] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigation = useRouter();
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  const [submittedLength, setSubmittedLength] = useState(0);
  const [isAllStudentsSubmitted, setIsAllPlayersSubmitted] = useState(false)


  useEffect(() => {
    if (socket) {
      socket.emit('checkCurrentStage', { id: teacher._id });
      socket.on('currentStage', (data) => {
        if (!data.status) {
          navigation.push(`/play/${teacher.quiz._id}`);
          return;
        }
        const index = teacher.quiz.questions.findIndex(
          (question) => question._id === data.data.question._id
        );
        setCurrentQuestionIndex(index);
        setStage(data.data.isLastStage ? 4 : data.data.stage);
      });

      socket.on("receiveStudentResult",(data)=>{
        dispatch(updateStudentScore({student:data.student,score:data.score}));
        const currentQuestionId = teacher.quiz.questions[currentQuestionIndex]._id;
        if (currentQuestionId === data.question ){
          setSubmittedLength((prev) => prev + 1);
          if (submittedLength === teacher.students.length){
            setIsAllPlayersSubmitted(true);
          }
        }
      })
    }
    return () => {
      socket?.off('checkCurrentStage');
      socket?.off('currentStage');
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Standard way to trigger a warning
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    const isLastQuestion = nextIndex >= teacher?.quiz.questions.length;

    if (isLastQuestion) {
      setStage(4);
      socket?.emit('changeStage', {
        room: teacher._id,
        currentStage: {
          stage: 4,
          question: teacher?.quiz.questions[currentQuestionIndex]._id,
          isLastStage: true, // Ensure no further questions appear
        },
      });
    } else {
      setCurrentQuestionIndex(nextIndex);
      setStage(1);
      socket?.emit('changeStage', {
        room: teacher._id,
        currentStage: {
          stage: 1,
          question: teacher?.quiz.questions[nextIndex]._id, // Use updated index
          isLastStage: nextIndex + 1 === teacher?.quiz.questions.length,
        },
      });
    }
  };

  useEffect(() => {
    if (stage === 1) {
      setTimeout(() => {
        socket?.emit('changeStage', {
          room: teacher._id,
          currentStage: {
            stage: 2,
            question: teacher?.quiz.questions[currentQuestionIndex]._id,
            isLastStage: currentQuestionIndex + 1 === teacher?.quiz.questions.length,
          },
        });
      }, 8000);
    }
  }, [stage, currentQuestionIndex]); // Depend on `currentQuestionIndex` to ensure correct behavior

  return (
    <div
      style={{ backgroundImage: `url(${teacher?.quiz.theme.image})` }}
      className="w-screen h-screen bg-cover bg-top overflow-hidden"
    >
      {stage === 1 && (
        <QuestionSection
          question={teacher?.quiz.questions[currentQuestionIndex].question}
          questionData={teacher?.quiz.questions[currentQuestionIndex]}
        />
      )}
      {stage === 2 && (
        <OptionsSection
        submittedLength={submittedLength}
        isAllStudentsSubmitted={isAllStudentsSubmitted}
          data={teacher}
          currentQuestionIndex={currentQuestionIndex}
          setStage={setStage}
          socket={socket}
        />
      )}
      {stage === 3 && <ScoreBoard data={teacher} nextQuestion={nextQuestion} />}
      {stage === 4 && <RankSection data={teacher} socket={socket} />}
    </div>
  );
};

export default Page;
