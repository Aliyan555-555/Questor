"use client";
import { useSocket } from '@/src/hooks/useSocket';
import { CircleIcon, ClockIcon, DiamondIcon, IsCorrectIcon, IsWrongIcon, SquareIcon, StudentSideRankIcon, TriangleIcon } from '@/src/lib/svg';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import AnimatedAvatar from '@/src/components/animated/AnimatedAvatar';
import { setScore, update } from '../../../../../../../src/redux/schema/student';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';
import { IoExitOutline } from 'react-icons/io5';

const InitialLoading = () => {

  return (
    <div className="w-screen overflow-hidden px-4 gap-4 flex-col h-screen flex bg-black/15 items-center justify-center ">
      <div className=' bg-blue_1 text-center text-white text-4xl md:text-6xl font-bold rounded-[10px] max-sm:w-full md:px-16 py-5'>
        Get Ready!
      </div>
    </div>
  )
};

const WaitingForQuestion = ({ index }) => {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (count <= 0) return;

    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1100);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="h-screen w-screen flex flex-col bg-black/15">

      <div className="w-full flex h-[60px] justify-center items-center py-2 relative">
        <div className="h-[50px] absolute left-4 bg-white text-black font-semibold w-[50px] rounded-full flex items-center justify-center text-xl">
          {index !== null ? index : "1"}
        </div>

      </div>

      {/* Countdown Section */}
      <div className="flex flex-1 gap-4 flex-col w-full items-center justify-center">
        <h2 className="text-4xl [text-shadow:_0_4px_0_rgb(0_0_0_/_50%)] font-black text-slate-100">
          Question {index}
        </h2>

        {/* Animated Countdown Circle */}
        <div className="w-[100px] flex items-center  justify-center h-[100px] relative">
          <div className="w-full top-0 z-0 left-0 flex items-center justify-center absolute h-full animate-spin">
            <div className="h-full w-1/2 bg-white rounded-tl-[50px] rounded-bl-[50px]" />
            <div className="h-full w-1/2 bg-gray-300 rounded-tr-[50px] rounded-br-[50px]" />
          </div>
          <div className="text-4xl z-50 relative font-black text-black">{count > 0 ? count : "Go!"}</div>
        </div>

        <h2 className="text-3xl [text-shadow:_0_4px_0_rgb(0_0_0_/_50%)] font-black text-slate-100">
          {count > 0 ? "Ready!" : "Start!"}
        </h2>
      </div>
    </div>
  );
};

const QuestionOptionSection = ({ socket, options, question, student, result }) => {
  const [count, setCount] = useState<number | null>(null);
  const [isResult, setIsResult] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [stopCount, setStopCount] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedOption, setSelectedOption] = useState([]);

  useEffect(() => {
    if (socket) {
      if (!stopCount) {
        socket.on("setCount", ({ count, duration }) => {
          setCount(count);
          setDuration(duration);
        });
      }
    }

    if (count === 0 && !isResult) {
      setIsTimeUp(true);

      socket.emit("submit_answer", {
        question: question._id,
        options: selectedOption,
        student: student._id,
        room: student.room._id,
        timeSpent: duration,
        timeRemaining: 0,
        isTimeUp: true,
      });
      setStopCount(true);
      setIsResult(true);
    }

    return () => {
      socket?.off("setCount");
    };
  }, [socket, count]);

  const handleSubmitAnswer = (option) => {
    setSelectedOption([option]);
    setIsResult(true);
    setStopCount(true);
    socket.emit("submit_answer", {
      question: question._id,
      options: [option],
      student: student._id,
      room: student.room._id,
      timeSpent: count,
      timeRemaining: duration - count,
      isTimeUp: false,
    });
  };

  const icons = [
    { icon: <TriangleIcon width={130} height={130} /> },
    { icon: <DiamondIcon width={130} height={130} /> },
    { icon: <CircleIcon width={130} height={130} /> },
    { icon: <SquareIcon width={130} height={130} /> },
  ];
  const colors = ["#9B059C", "#FD9800", "#1B3BA0", "#036100"];

  return (
    <div className="w-screen h-screen flex flex-col ">
      <div className="w-full flex h-[60px] justify-center items-center py-2 relative">
        <div className="bg-white flex font-bold gap-5 w-fit px-5 py-2 text-xl items-center justify-center rounded-[100px] ">
          <ClockIcon w={30} h={30} />
          <p>{count}</p>
        </div>
      </div>

      {!isResult && count !== null && count > 0 && (
        <React.Fragment>
          <div className='w-full px-2 md:px-6  py-2'>
            <div className="w-full text-white text-xl text-center bg-blue_1 py-6 rounded-[10px] ">
              {question.question}
            </div>
          </div>
          <div className="w-full pb-4  px-2 md:px-6 flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSubmitAnswer(option)}
                style={{ backgroundColor: colors[index] }}
                className="flex items-center border-b-8 border-l-4 border-r-8 border-t-4 border-[#0000003e] justify-center w-full h-[99%] md:h-full"
              >
                {icons[index]?.icon}
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
      {isResult && (
        <div className="w-full h-full flex items-center justify-center">
          {isTimeUp ? (
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-black text-red-500">Time&lsquo;s Up!</h2>
              <IsWrongIcon />
              <div className="w-[250px] bg-black/60 rounded-md py-3 text-xl text-white font-bold text-center">
                No answer selected
              </div>
            </div>
          ) : !result ? (
            <svg
              id="spinner_svg__Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 140 140"
              color="#fff"
              aria-label="Please wait"
              className="animate-spin w-[130px] h-[130px]"
            >
              <g>
                <circle opacity="0" fill="#FFFFFF" cx="70" cy="70" r="70"></circle>
                <path fill="#FFFFFF" d="M70,0C31.3,0,0,31.3,0,70h35c0-19.3,15.7-35,35-35s35,15.7,35,35h35C140,31.3,108.7,0,70,0z"></path>
              </g>
            </svg>
          ) : result.isCorrect ? (
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-black text-slate-100">Correct</h2>
              <IsCorrectIcon />
              {/* <div className="flex text-center justify-end">
                <p className="text-xl font-semibold">Answer Streak</p>
                <div className="w-[24px] h-[24px] flex items-center justify-center relative">
                  <span className="text-lg z-10 relative font-bold text-white">{result.rank}</span>
                  <StudentSideRankIcon />
                </div>
              </div> */}
              <div className="w-[250px] bg-black/60 rounded-md py-3 text-xl text-white font-bold text-center">
                +{result.currentScore.toFixed(0)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-black text-red-500">Incorrect</h2>
              <IsWrongIcon />
              <div className="w-[24px] h-[24px] flex items-center justify-center relative">
                <span className="text-lg z-10 relative font-bold text-white">0</span>
                <StudentSideRankIcon />
              </div>
              <div className="w-[250px] bg-black/60 rounded-md py-3 text-xl text-white font-bold text-center">
                Wrong answer
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RankStage = ({ student }) => {
  const navigation = useRouter();
  return (
    <div className={"w-screen h-screen flex flex-col text-white items-center justify-center relative"}>
      <div className="w-full  absolute top-2 right-2 flex justify-end ">
        <IconButton onClick={() => navigation.push('/')} className="!bg-red-500 !p-5">
          <IoExitOutline color="white" fontSize={30} />
        </IconButton>
      </div>
      <div className='flex px-8 flex-col min-w-[350px] items-center gap-2 justify-center bg-blue_1 rounded-[10px] py-6 '>
        <h1 className="text-3xl font-semibold text-white">{student.nickname}</h1>
        <AnimatedAvatar avatarData={student.avatar} avatarItems={student.item} bg='#4686EC' h='120px' w='120px' chin={false} />
        <h2 className="text-xl font-semibold text-white">Score: {student.score.toFixed(0) ?? 0}</h2>
        <h2 className="text-xl font-semibold text-white">Rank: {student.rank}</h2>
        <h2 className="text-xl font-semibold text-white">Remarkable Win!</h2>
      </div>
    </div>
  )
};

const Page = () => {
  const student = useSelector((root: RootState) => root.student.currentGame);
  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [index, setIndex] = useState(1);
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const navigation = useRouter();
  const { socket, isConnected } = useSocket();
  const [question, setQuestion] = useState(student.student.room.currentStage.question ?? null);
  const [stage, setStage] = useState<null | number>(student.student.room.currentStage.stage ?? null);


  const handlePopulateCurrentStage = (data) => {
    if (data.status) {
      if (data.data.isLastStage) {
        setQuestion(data.data.question);
        setIndex(data.data.index + 1);
        setStage(4);
      } else {
        setQuestion(data.data.question);
        setStage(data.data.stage);
        setIndex(data.data.index + 1);
      }
    }
  };
  const handleResult = (data) => {
    setResult({ question: data.question, isCorrect: data.isCorrect, score: data.score, currentScore: data.currentScore, rank: data.rank });
    dispatch(setScore({ score: data.score, rank: data.rank }));
  };
  useEffect(() => {
    console.log(socket ? "Socket is connected" : "Socket is not connected");
    if (socket) {
      socket?.on("roomDeleted", () => {
        navigation.push(`/play/connect/to/game`);
      })
      socket.on("populateCurrentStage", handlePopulateCurrentStage)
      socket.on("result", handleResult)
      socket?.on('inactive', (data) => {
        console.log("🚀 ~ socket?.on Inactive ~ data:", data)
        dispatch(update(data));
        socket?.emit('tryReconnect', { token: student.refreshToken, time: new Date().toTimeString() });
      });
      socket.on("userInRoom", (data) => {
        if (!data.status) {
          if (stage !== 4 && stage !== 3) {
            navigation.push('/play/connect/to/game');
          }
        }
      });
    }


    return () => {
      socket?.off("populateCurrentStage");
      socket?.off("result");
      socket?.off("userInRoom");
      socket?.off("inactive");
      socket?.off("reconnect_refresh_token");
      socket?.off("roomDeleted");
    }
  }, [socket, currentTime, stage, student]);


  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    if (socket && student?.student?.room?._id) {
      if (stage !== 4) {
        socket.emit("checkUserInRoom", {
          roomId: student.student.room._id,
          studentData: student,
          token: student?.refreshToken ?? null,
          stage
        });
      }
    }
  }, [socket]);

  useEffect(() => {
    if (!isConnected) {
      socket?.emit("reconnect_refresh_token", { refreshToken: student.refreshToken });
      console.log("send Reconnecting request to the server on :" + currentTime);
      console.log("socket status :" + socket);
    }
  })
  return (
    <div className={"w-screen h-screen flex flex-col items-center justify-center"}>
      {!stage && <InitialLoading />}
      {stage === 1 && <WaitingForQuestion index={index} />}
      {stage === 2 && question && typeof question !== 'string' && (
        <QuestionOptionSection 
          result={result} 
          student={student.student} 
          question={question} 
          socket={socket} 
          options={question.options} 
        />
      )}
      {stage === 4 && <RankStage student={student.student} />}
      <div className='w-full bg-white flex relative justify-between p-1 h-[50px]'>
        <div className=" items-center relative flex">
          <div className="absolute bottom-0">
            <AnimatedAvatar avatarItems={student.student.item} chin={false} bg='#0000' h='60px' w='60px' avatarData={student.student.avatar} />
          </div>
          <h4 className="text-lg pl-[70px] font-bold">{student.student.nickname}</h4>
        </div>
        <div className="h-full w-[60px] rounded-md bg-gray-700 text-white flex items-center justify-center text-lg font-semibold">
          {student.student.score.toFixed(0)}
        </div>
      </div>
    </div>
  )
};

export default Page;
