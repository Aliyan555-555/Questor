"use client";

import { useState, useEffect } from "react";

import { useParams, usePathname, useRouter } from "next/navigation";
import { MdFullscreen } from "react-icons/md";
import { MemberIcon } from "@/src/lib/svg";
import QRCode from "react-qr-code";
import { Button, IconButton } from "@mui/material";
import { useSocket } from "@/src/hooks/useSocket";
// import { toast } from "react-toastify";
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from "react-redux";
import { created, disconnect, update, setStudents, changeStudentCharacter, changeStudentCharacterAccessories } from "@/src/redux/schema/teacher";
import { RootState } from "@/src/redux/store";
import AudioPlayer from "@/src/components/audios/audioPlayer";
import AnimatedAvatar from "@/src/components/animated/AnimatedAvatar";
import Image from "next/image";
const Teacher = () => {
  const user = useSelector((root: RootState) => root.student)
  const { socket } = useSocket();
  const path = usePathname()
  // const [loading, setLoading] = useState(true);
  const game = useSelector((root: RootState) => root.teacher.currentGame);
  const params = useParams();
  const [studentListDrawer, setStudentListDrawer] = useState(false)
  const navigation = useRouter();
  const quizId = params.id;
  const teacherId = user.user?._id ?? '1';
  const [pin, setPin] = useState("");
  const dispatch = useDispatch();
  const [QRUrl, setQRUrl] = useState("");
  const [roomId, setRoomId] = useState("");
  const drawerItemColor = [
    "#50C3ED",
    "#D62829",
    "#FBA732",
    "#E9E2B6",
    "#3A7CDF",
    "#FCBF4A",
  ]
  useEffect(() => {
    if (!user.isAuthenticated) {
      navigation.push(`/auth/login?redirect=true&redirect_url=${window.location.origin}${path}`);
      return
    }
    if (socket) {
      socket.on("studentJoined", ({ students, data, currentStudent }) => {

        if (currentStudent) {
          const studentExist = game.students.find(students => students._id === currentStudent._id);
          if (!studentExist) {
            dispatch(update({ ...data }));
            dispatch(setStudents(students))
          }

        } else {
          dispatch(update({ ...data }));
          console.log(data);
          dispatch(setStudents(students))
          console.log('data', students)
          console.log('game', game)
        }

      });
      socket.on("error", (data) => {
        if (data.isReturnToHome) {
          navigation.push("/")
          return
        }
      })



      socket.on("roomCreated", ({ roomId, pin, data }) => {
        setRoomId(roomId);
        setPin(pin);
        console.log("Room Data", data)
        dispatch(created(data));
      });
      socket.on("changedStudentCharacter", (data) => {
        console.log(data)
        dispatch(changeStudentCharacter(data.student))
      })
      socket.on("changedStudentCharacterAccessories", (data) => {
        dispatch(changeStudentCharacterAccessories(data.student))
      })
      socket.on("started", (data) => {
        dispatch(update(data));
      });

      socket.on("roomDeleted", () => {
        dispatch(disconnect())
      })
      return () => {
        socket.off("error");
        socket.off("started");
        socket.off("roomDeleted");
        socket.off("studentJoined");
        socket.off("roomCreated");
      };
    }
  }, [socket]);

  const createRoom = () => {
    if (!user.isAuthenticated) {
      navigation.push(`/auth/login?redirect=true&redirect_url=${window.location.origin}${path}`);
      return
    }
    socket?.emit("createRoom", { quizId, teacherId });
  };
  useEffect(() => {
    if (socket) {
      createRoom();
    }
  }, [socket]);
  const enterFullscreen = () => {
    console.log(socket);
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }

  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }

  };

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement

    ) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQRUrl(
        `${window.location.origin}/play/connect/to/game?pin=${pin}&qr=true`
      );
      // setLoading(false);
    }
  });

  const handleCopyClick = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard
        .writeText(pin)
        .then(() => {
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = pin;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0"; // Makes it invisible
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        if (successful) {

        } else {
          throw new Error("Fallback copy failed");
        }
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Fallback copy failed: ", err);

      }
    }
  };

  const handleStart = () => {
    if (socket) {
      socket.emit("start", roomId);
      navigation.push(`/play/${game?.quiz._id}/${game?.teacher}/lobby/start`);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${game?.quiz?.theme?.image})` }} className="w-screen bg-opacity-65 h-screen bg-cover p-2 flex flex-col items-center justify-center  relative bg-no-repeat bg-top">

      <div className="md:w-[40%] lg:w-[40%] flex flex-col h-full max-h-[92%] overflow-hidden">
        <div className="w-full bg-blue_1 rounded-tl-[10px] rounded-tr-[10px] flex px-10 py-2 items-center justify-between">
          <div className="p-2 border border-white bg-white rounded-[10px]">
            <QRCode
              size={125}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={QRUrl}
              bgColor="white"
              fgColor={"black"}
              viewBox={`0 0 256 256`}
            />
          </div>
          <div className="flex flex-col gap-3 h-full py-4 justify-center">
            <div className="bg-white rounded-[10px] text-blue_1 font-bold text-xl px-4 py-2">
              Join at : www.questor.io
            </div>
            <div onClick={handleCopyClick} className="flex gap-4 items-center justify-center">
              <p className="text-blue_1 bg-white font-bold text-xl rotate-[-90deg] px-2 py-1 rounded-[10px]">
                PIN
              </p>
              <div className="font-black text-white text-6xl">{pin ? pin : "Loading PIN..."}</div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col flex-grow py-4 items-center bg-white rounded-bl-[10px] rounded-br-[10px] overflow-hidden">
          <h2 className="text-lg sm:2xl lg:text-3xl text-blue_1 text-center  font-semibold">Waiting for players...</h2>
          <div className="flex-1 w-full flex justify-center items-center overflow-hidden">
            <Image
              alt="Waiting"
              width={100}
              height={300}
              className="w-auto h-[200px] md:h-[250px] lg:h-[300px] object-contain"
              src={"/images/animatedPNG.png"}
            />
          </div>
        </div>

        {/* Start Button */}
        <Button onClick={handleStart} disabled={game?.students.length === 0} className="!bg-red_1 z-50 disabled:opacity-80 !mt-3 !rounded-[10px] !w-full !py-3 !uppercase !font-black !text-3xl !text-white ">
          Start
        </Button>
      </div>

      <div className="absolute bottom-2 w-screen left-0 flex items-center justify-end gap-2">
        {pin !== "" && <AudioPlayer fileName={'lobby-classic-game.webm'} />}
        <div onClick={() => setStudentListDrawer((prev) => !prev)} className="bg-[#0000009a] flex w-[90px] rounded-lg px-1 py-[8px] items-center text-[30px] text-white font-bold">
          <MemberIcon />
          {game?.students.length}
        </div>
        <div
          onClick={toggleFullscreen}
          className="bg-[#0000009a] flex mr-2  rounded-lg px-1 p-[8px]  text-3xl text-white font-black"
        >
          <MdFullscreen fontSize={40} />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: "100%" }}
        animate={{
          opacity: studentListDrawer ? 1 : 0,
          scale: studentListDrawer ? 1 : 0.8,
          y: studentListDrawer ? 0 : '120%',
        }}
        transition={{ duration: 0.2, type: "keyframes", stiffness: 120 }}
        className="w-[80%] h-[90%] bg-blue_1 z-[100000] fixed inset-0 m-auto rounded-[10px] p-10 gap-10 flex flex-wrap items-start justify-start "
      >
        <IconButton
          className="!p-4 !bg-white !absolute !top-[-20px] !right-[-20px]"
          onClick={() => setStudentListDrawer(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L2 22" stroke="#D62829" strokeWidth="4" strokeLinecap="round" />
            <path d="M22 22L2.00001 2" stroke="#D62829" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </IconButton>
        {
          game?.students.length === 0 && (
            <div className="w-full h-full flex items-center text-4xl font-semibold text-white justify-center">
              <h3>Waiting for students...</h3>
            </div>
          )
        }
        {/* hello */}
        {
          game?.students.map((student, index) => (

            <div key={student._id} className="flex flex-col items-center justify-center">
              <div
                className="rounded-full p-2"
                style={{ backgroundColor: drawerItemColor[index % drawerItemColor.length] }} // Cycles through colors
              >
                <AnimatedAvatar avatarData={student.avatar} bg="transparent" avatarItems={student.item} chin={false} h="100px" w="100px" />
              </div>
              <h4 className="text-white text-xl ">{student.nickname}</h4>

            </div>
          ))
        }
      </motion.div>
    </div>
  );
};

export default Teacher;
