"use client";

import { useState, useEffect } from "react";

import { useParams, usePathname, useRouter } from "next/navigation";
import { MdFullscreen } from "react-icons/md";
import { MemberIcon } from "@/src/lib/svg";
import QRCode from "react-qr-code";
import { PixelArtCard } from "react-pixelart-face-card";

import { div } from "framer-motion/client";
import Loader from "@/src/components/Loader";
import { Button } from "@mui/material";
import { useSocket } from "@/src/hooks/useSocket";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { created, update } from "@/src/redux/schema/teacher";
import { RootState } from "@/src/redux/store";

const Teacher = () => {
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const game = useSelector((root:RootState) => root.teacher.currentGame)
  const params = useParams();
  const url = usePathname();
  const navigation = useRouter();
  const quizId = params.id;
  const teacherId = "1";
  const [pin, setPin] = useState("");
  const dispatch = useDispatch()
  const [QRUrl, setQRUrl] = useState("");
  const [roomId, setRoomId] = useState("");
  const [students, setStudents] = useState([]);
console.log(game)
  useEffect(() => {
    console.log(socket)
    if (socket) {
      
      socket.on("studentJoined", ({ students,data }) => {
        setStudents(students);
        dispatch(update(data))
      });

      socket.on("roomCreated", ({ roomId, pin,data}) => {
        setRoomId(roomId);
        setPin(pin);
        dispatch(created(data))
        
      });
      socket.on("started",(data) =>{
        dispatch(update(data))
        toast.success("Quiz started!");
      })
      // Clean up event listeners on component unmount
      return () => {
        socket.off("studentJoined");
        socket.off("roomCreated");
      };
    }
  }, [socket]);

  const createRoom = () => {
    socket.emit("createRoom", { quizId, teacherId });
  };
  console.log(url);

  useEffect(() => {
    if (socket) {
      createRoom();
    }
  }, [socket]);
  const enterFullscreen = () => {
    const element = document.documentElement; // Fullscreen the entire page
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQRUrl(`${window.location.origin}/play/${quizId}/${teacherId}/lobby?pin=${pin}`);
      setLoading(false);
    }
  });

  const handleCopyClick = () => {
    const textToCopy = pin; // Replace with the actual text you want to copy
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Text copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
    });
  };

  const handleStart = () => {
    if (socket) {
      socket.emit("start", roomId);
      navigation.push(`/play/${game.quizId}/${game.teacherId}/lobby/start`)
      
    }
  }
  return (
    <div className="w-screen  h-screen bg-cover p-2 flex flex-col items-center justify-center  relative bg-no-repeat bg-center">
      <div className="w-[50%] absolute top-2   h-[130px] flex gap-2 ">
        <div className="flex-1 flex items-center h-full bg-white">
          <div className="w-[50%] p-2 h-full flex items-center text-2xl font-semibold text-black justify-center">
            Join at www.kahoot.it or with the Kahoot! app
          </div>
        <div className="flex flex-col justify-center p-2">
            <h4 className=" font-bold text-xl ">Game PIN</h4>
            { !loading? <h2 className="text-6xl hover:bg-gray-100 cursor-pointer font-black " onClick={handleCopyClick} title="Copy PIN" >{pin}</h2>:<Loader w={40} h={40}/>}
          </div>
        </div>
        <div className="h-full items-center justify-center flex p-2 w-[130px] bg-white">
          {loading ? (
            <Loader w={60} h={60} />
          ) : (
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={QRUrl}
              viewBox={`0 0 256 256`}
            />
          )}
        </div>
      </div>
      <div className="w-screen mb-[200px] flex justify-end items-center px-2">
        <Button onClick={handleStart} disabled={game.students.length === 0} className="!text-xl !text-black !capitalize !font-semibold !bg-white !px-4 !py-2 !rounded-lg">
          start
          </Button> 

      </div>
      <div className="w-screen  ">
        {students.length === 0 ? (
          <div className="text-6xl text-center font-semibold text-white">
            Waiting for players…
          </div>
        ) : (
          <div className=" w-full flex-wrap flex items-center justify-center gap-2">
            {students.map((student, i) => (
              <div
                key={i}
                className="px-3 py-2  flex items-center gap-2 text-2xl font-semibold rounded-lg bg-[#0000009a] text-white"
              >
                <PixelArtCard
                key={i}
                  random={true}
                  size={60}
                  tags={["human-female", "human-male"]}
                />

                <p> {student.nickname}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute bottom-2 w-screen left-0 flex items-center justify-end gap-2">
        <div className="bg-[#0000009a] flex w-[90px] rounded-lg px-1 py-[8px]  text-3xl text-white font-bold">
          <MemberIcon />
          {students.length}
        </div>
        <div
          onClick={toggleFullscreen}
          className="bg-[#0000009a] flex mr-2  rounded-lg px-1 p-[8px]  text-3xl text-white font-black"
        >
          <MdFullscreen fontSize={40} />
        </div>
      </div>
    </div>
  );
};

export default Teacher;
