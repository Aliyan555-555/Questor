"use client";
import {
  CancelIcon,
  CircleIcon,
  ClockIcon,
  CoinIcon,
  CorrectIcon,
  DiamondIcon,
  FirstRankIcon,
  SecondRankIcon,
  SquareIcon,
  ThirdRankIcon,
  TriangleIcon,
} from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { useConfetti } from "@stevent-team/react-party";
import { IoExitOutline } from "react-icons/io5";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/src/hooks/useSocket";
import { updateStudentScore } from "@/src/redux/schema/teacher";
import { Socket } from "socket.io-client";
import { Question, Student, Teacher } from "@/src/types";
import { MdFullscreen } from "react-icons/md";
import AnimatedAvatar from "@/src/components/animated/AnimatedAvatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, IconButton } from "@mui/material";
import { truncateString } from "@/src/lib/services";

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
            className="bg-white relative rounded-full flex items-center justify-center w-[70px] h-[70px] p-3"
          >
            <svg width="80" height="80" viewBox="0 0 132 151" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M121.796 31.7099L85.2677 4.75711C78.3522 -0.385204 69.2202 -1.44913 61.2407 2.00863L19.6589 20.0954C11.7681 23.5532 6.27112 30.912 5.29586 39.5121L0.153538 84.6403C-0.821728 93.2404 2.90202 101.663 9.81754 106.805L46.3457 133.758C53.2612 138.901 62.3933 139.965 70.3727 136.507L73.2986 135.177C64.6098 131.808 56.0984 127.818 48.2962 123.296C24.8012 114.076 8.39898 93.7724 11.6794 63.6278C15.1372 32.2419 34.5539 7.94889 74.0965 12.2933C98.4782 14.9531 122.771 36.7636 118.87 72.2278C115.767 100.511 100.34 111.593 85.711 114.962C89.6121 116.913 97.5916 119.307 105.748 121.08L111.955 118.42C119.845 114.962 125.342 107.603 126.318 99.0033L131.46 53.8751C132.435 45.275 128.711 36.8523 121.796 31.7099Z" fill="#D62829" />
              <path d="M67.6242 36.3203C51.8426 34.547 43.5085 47.4028 41.6466 63.805C38.8982 88.63 47.6756 100.688 63.6345 102.461C74.7171 103.702 86.4203 93.7723 88.8141 72.0505C91.5626 46.7822 83.2285 38.0935 67.6242 36.3203Z" fill="#D62829" />
              <path d="M107.345 126.932C106.724 127.109 106.103 127.286 105.394 127.552C101.936 128.793 98.4786 130.035 95.0208 131.276C90.8538 132.783 86.6868 134.29 82.5197 135.709C81.1011 136.152 81.0125 138.103 82.3424 138.812C92.2724 143.688 102.646 147.589 113.108 149.895C118.782 151.136 124.279 147.501 125.786 140.408L126.318 138.014C127.027 134.822 125.431 131.808 122.683 130.123C121.087 129.148 119.225 128.793 117.541 128.173C115.324 127.463 113.108 126.754 110.802 126.666C109.561 126.666 108.497 126.666 107.433 127.02L107.345 126.932Z" fill="#D62829" />
            </svg>

            <motion.div
              animate={{ opacity: [1, 1, 0], scale: [1.5, 1, 1.5] }}
              transition={{ duration: 0.3, delay: 2 }}
              className="bg-white uppercase  px-[100px] py-1 text-lg text-blue_1 font-bold absolute top-[120%]"
            >
              {questionData.type}
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.1 }}
          className="w-full font-semibold text-center mt-[300px] py-6 opacity-0 text-4xl bg-blue_1 text-white"
        >
          {question}
        </motion.div>
        <div className="w-[90%] h-[25px] m-auto">
          <motion.div
            animate={{ width: "100%" }}
            transition={{ duration: 5, delay: 3.1 }}
            className="bg-red_1 rounded-[50px] h-full w-0"
          ></motion.div>
        </div>
      </div>
    );
  }
)
QuestionSection.displayName = "QuestionSection";
const OptionsSection = React.memo(({
  submittedLength,
  data,
  currentQuestionIndex,
  setStage,
  socket
}: {
  data: Teacher | null;
  submittedLength: number;
  currentQuestionIndex: number;
  setStage: React.Dispatch<React.SetStateAction<number>>;
  socket: Socket
}) => {
  const question = data?.quiz.questions[currentQuestionIndex];
  const icons = [
    { icon: <TriangleIcon width={50} height={50} /> },
    { icon: <DiamondIcon width={50} height={50} /> },
    { icon: <CircleIcon width={50} height={50} /> },
    { icon: <SquareIcon width={50} height={50} /> },
  ];
  const colors = ["#9D069C", "#FD9800", "#1B3BA0", "#046000"];
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

  useEffect(() => {
    if (!socket || !data) return;

    let timer: NodeJS.Timeout;

    if (!isTimesUp) {
      timer = setInterval(() => {
        setDuration((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsTimesUp(true);
            return 0;
          }
          const newCount = prev - 1;
          socket.emit("setCount", {
            roomId: data._id,
            count: newCount,
            duration: data?.quiz.questions[currentQuestionIndex].duration
          });
          return newCount;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [socket, data, isTimesUp]);
  useEffect(() => {
    if (data?.students.length === submittedLength) {
      setIsTimesUp(true);
    }
  }, [submittedLength, data]); // Runs when `submittedLength` updates

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
      {/* <div className="w-full flex gap-10"> */}
      <div className="w-full flex justify-center gap-10">
        <div className="bg-white flex font-bold gap-5 w-fit px-5 py-2 text-xl items-center justify-center rounded-[100px] ">
          <CoinIcon w={20} h={30} />
          <p>{question.maximumMarks}</p>
        </div>

        <div className="bg-white flex font-bold gap-5 w-fit px-5 py-2 text-xl items-center justify-center rounded-[100px] ">
          <ClockIcon w={30} h={30} />
          <p>{duration}</p>
        </div>

        <Button disabled={!isTimesUp} onClick={() => setStage(3)} className="!bg-yalow_1 disabled:opacity-70 !px-8 !text-xl !rounded-[100px] !font-semibold !text-black !py-2">
          Next
        </Button>
      </div>

      <div className="w-full flex-1 flex flex-col py-6 px-10">
        <div className="w-full mb-2 flex-1 max-h-[300px] flex items-center justify-center">
          {question.media && <Image src={question.media} className="h-full" alt="" width={400} height={400} />}
        </div>
        <div className="w-full text-white text-xl text-center bg-blue_1 py-6 rounded-[10px] ">
          {question.question}
        </div>
      </div>
      <div className="w-full flex gap-2 px-10 flex-wrap">
        {question?.options.map((option, i) => (
          <button
            key={i}
            disabled={isTimesUp && i !== question.answerIndex[0]}
            style={{ background: colors[i] }}
            className="w-[49%] cursor-pointer disabled:opacity-35 flex p-5 rounded-[10px] text-3xl items-center justify-between gap-4 font-semibold text-white"
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
      {/* <button
        onClick={nextQuestion}
        className="px-6 py-2 text-lg font-black bg-white absolute right-4 top-4"
      >
        Next
      </button>
      <div className="w-fit bg-white text-black text-4xl font-bold px-6 py-3">
        Scoreboard
      </div> */}
      <div className="w-full flex items-center justify-center py-8">
        <div className="w-[30%] text-center justify-center flex items-center  bg-white text-black text-2xl font-semibold relative py-[6px] px-6 rounded-[100px] ">
          Scoreboard
          <Button onClick={nextQuestion} className="!bg-yalow_1 !absolute !top-0 !right-[-50px] disabled:opacity-70 !px-8 !text-xl !rounded-[100px] !font-semibold !text-black !h-full !py-2">
            Next
          </Button>
        </div>

      </div>
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="flex w-[60%] h-fit max-h-[400px] overflow-y-auto bg-[#E9E2B6] flex-col p-4 rounded-[10px]  gap-3 ">
          {students.map((student, index) => (
            <div
              key={student._id || Math.random()} // Ensure unique keys
              className="rounded-xl text-2xl flex items-center justify-between font-semibold text-black w-full p-1"
              style={{
                backgroundColor: index % 2 === 0 ? "#0C0211" : "#002F49", // Alternating colors
              }}
            >
              <div className="flex items-center">
                <AnimatedAvatar
                  avatarData={student.avatar}
                  avatarItems={student.item}
                  w="50px"
                  h="50px"
                />
                <p className="px-2 text-white">{student.nickname || "Unknown"}</p> {/* Ensure text is visible */}
              </div>
              <p className="px-4 text-white">{student.score?.toFixed(0) || "0"}</p>
            </div>
          ))}
        </div>

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
    const navigation = useRouter()
    useEffect(() => {
      socket?.emit("calculate_ranks", {
        roomId: data._id,
      });
      socket?.on("calculate_ranks_student", (data) => {
        console.log(data)
        setStudents(data.students);
      });
    }, []);

    const firstRankStudent = students.find(students => students.rank === 1)
    console.log("🚀 ~ firstRankStudent:", firstRankStudent)
    const secondRankStudent = students.find(students => students.rank === 2)
    console.log("🚀 ~ secondRankStudent:", secondRankStudent)
    const thirdRankStudent = students.find(students => students.rank === 3)
    console.log("🚀 ~ thirdRankStudent:", thirdRankStudent)

    useEffect(() => {
      setTimeout(() => {
        createConfetti();
      }, 12000);
    }, []);

    return (
      <div className="w-full h-full relative flex flex-col items-center justify-center  text-white">
        <div className="w-full flex justify-end px-3">
          <IconButton onClick={() => navigation.push('/')} className="!bg-red-500 !p-5">
          <IoExitOutline color="white" fontSize={30}  />
          </IconButton>
        </div>
        <canvas
          ref={canvasProps.ref as React.RefObject<HTMLCanvasElement>}
          style={canvasProps.style as React.CSSProperties}
        />
        <motion.div
          initial={{ translateY: "200px", scale: 1.1 }}
          animate={{ translateY: "-100px", scale: 1 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
          className="w-fit scale-150 bg-white text-black px-10 py-2 font-semibold text-2xl rounded-[100px] "
        >
          {data?.quiz.name}
        </motion.div>

        <div className="flex">
          <motion.div
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
              backgroundImage: 'url(/images/UI/secondPosition.png)'
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
              opacity: [1, 1, 1, 0.9],
            }}
            transition={{
              delay: 6,
              duration: 5,
              times: [0, 0.3, 0.6, 1],
              ease: "easeInOut",
            }}
            className="w-[300px] px-6 h-[400px] z-[100] relative bg-fill bg-center flex items-center flex-col rounded-lg text-white "
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
            <SecondRankIcon className="w-[50%] " />
            <h3 className="text-2xl leading-8 text-center font-bold">
              {students.length >= 2 && truncateString(students[1].nickname, 20)}
            </h3>
            <p className="text-2xl font-semibold py-4">
              {students.length >= 2 && students[1].score.toFixed(0)}
            </p>
          </motion.div>{" "}
          <motion.div
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
              backgroundImage: "url(/images/UI/firstPosition.png)"
            }}
            initial={{
              translateY: "600px",
              translateX: "0",
              scale: 1.2,
              opacity: 1,
            }}
            animate={{ translateY: ["600px", "150px", "150px", "150px"] }}
            transition={{ delay: 10, duration: 5, ease: "easeInOut" }}
            className="w-[300px] px-6 z-[1000] bg-fill bg-center h-[400px] relative  flex items-center flex-col rounded-lg text-white "
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
            <FirstRankIcon className="w-[50%] " />
            <h3 className="text-2xl leading-8 text-center font-bold">
              {students.length >= 1 && truncateString(students[0].nickname, 20)}
            </h3>
            <p className="text-2xl font-semibold py-4">
              {students.length >= 1 && students[0].score.toFixed(0)}
            </p>
          </motion.div>
          <motion.div
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
              backgroundImage: 'url(/images/UI/secondPosition.png)'
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
              opacity: [1, 1, 1, 0.9],
            }}
            transition={{
              delay: 0.5,
              duration: 5,
              times: [0, 0.3, 0.6, 1], // Corrected to match keyframes
              ease: "easeInOut",
            }}
            className="w-[300px] px-6 h-[400px] relative bg-fill bg-center flex items-center flex-col rounded-lg text-white "
          >
            <ThirdRankIcon className="w-[50%] " />
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
            <h3 className="text-2xl leading-8 text-center font-bold">
              {students.length >= 3 && truncateString(students[2].nickname, 20)}
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
  const [stage, setStage] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigation = useRouter();
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  const [submittedLength, setSubmittedLength] = useState(0);
  const [isAllStudentsSubmitted, setIsAllPlayersSubmitted] = useState(false);

  console.log(isAllStudentsSubmitted);

  useEffect(() => {
    if (socket) {
      // socket.emit('isRoomPlayable',{room:teacher._id});
      socket.emit('checkCurrentStage', { id: teacher._id, index: currentQuestionIndex });
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
      socket.on("receiveStudentResult", (data) => {
        const currentQuestionId = teacher.quiz.questions[currentQuestionIndex]._id;
        if (currentQuestionId === data.question) {
          let a = 1
          if (a === 1) {
            console.log("Score", data.score);
            dispatch(updateStudentScore({ student: data.student, score: data.score, rank: data.score }));
            a = 0;
          }

          setSubmittedLength((prev) => {
            const newSubmittedLength = prev + 1;
            console.log("Student submitted answer", data.student, teacher.students.length, newSubmittedLength);

            if (Number(newSubmittedLength) === Number(teacher.students.length)) {
              setIsAllPlayersSubmitted(true);
            }

            return newSubmittedLength; // Ensure correct state update
          });
        }
      });
    }
    return () => {
      socket?.off("receiveStudentResult");
      socket?.off('checkCurrentStage');
      socket?.off('currentStage');
    };
  }, [socket, currentQuestionIndex,]);

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
    console.log(teacher?.quiz.questions.length, isLastQuestion, nextIndex
    );

    if (isLastQuestion && stage === 3) {
      setStage(4);
      socket?.emit('changeStage', {
        room: teacher._id,
        currentStage: {
          stage: 4,
          index: currentQuestionIndex,
          question: teacher?.quiz.questions[currentQuestionIndex]._id,
          isLastStage: true,
        },
      });
    } else {
      setCurrentQuestionIndex(nextIndex);
      setStage(1);
      setSubmittedLength(0);
      setIsAllPlayersSubmitted(false);
      socket?.emit('changeStage', {
        room: teacher._id,
        currentStage: {
          stage: 1,
          index: currentQuestionIndex,

          question: teacher?.quiz.questions[nextIndex]._id, // Use updated index
          isLastStage: isLastQuestion,
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
            index: currentQuestionIndex,
            question: teacher?.quiz.questions[currentQuestionIndex]._id,
            isLastStage: currentQuestionIndex + 1 === teacher?.quiz.questions.length && Number(stage) === 3,
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
