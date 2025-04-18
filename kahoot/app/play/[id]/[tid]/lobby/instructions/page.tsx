"use client";
import AnimatedAvatar from "@/src/components/animated/AnimatedAvatar";
import Loader from "@/src/components/Loader";
import { useSocket } from "@/src/hooks/useSocket";
import {
  changeCharacterAccessories,
  changeCharacters,
  disconnect,
  join,
  setAccessories,
  setAvatars,
  update,
} from "@/src/redux/schema/student";
import { RootState } from "@/src/redux/store";
import { GrEdit } from "react-icons/gr";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchAvatars } from "@/src/redux/api";
import { toast } from "react-toastify";
import Image from "next/image";
import { Backdrop } from "@mui/material";
import Link from "next/link";

const Page = React.memo(() => {
  const characters = useSelector((root: RootState) => root.student.avatars);
  const accessories = useSelector(
    (root: RootState) => root.student.accessories
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  const [drawerIsActive, setDrawerIsActive] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { socket } = useSocket();
  const params = useParams();
  console.log(params.id, params.tid)
  const navigation = useRouter();
  const [loading, setLoading] = useState(true);
  const student = useSelector((state: RootState) => state.student.currentGame);
  const dispatch = useDispatch();

  const [isCharacter, setIsCharacter] = useState(true);
  const closeDrawerOnOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        drawerIsActive
      ) {

        setDrawerIsActive(false);
      }
    },
    [drawerIsActive]
  );

  useEffect(() => {
    if (!student) {
      navigation.push(`/play/connect/to/game`);
      return
    }
    const handleStudentJoined = (students: string) => {
      console.log(students);
    };

    const handleUserInRoom = (status) => {
      if (!status.status) {
        navigation.push(`/play/connect/to/game`);
      }
    };
    console.log(student)
    socket?.on("started", () => {
      navigation.push(
        `/play/${params.id}/${params.tid}/lobby/instructions/start`
      );
    });

    socket?.on("studentJoined", handleStudentJoined);
    socket?.on("roomDeleted", () => {
      navigation.push(`/play/connect/to/game`);
    })





    socket?.on("changedYourCharacter", (data) => {
      dispatch(changeCharacters({ ...data.student.avatar }));
      setDrawerIsActive(false);
    });

    socket?.on("changedYourCharacterAccessories", (data) => {
      dispatch(changeCharacterAccessories({ ...data.student.item }));
      setDrawerIsActive(false);

    });

    socket?.on("userInRoom", handleUserInRoom);
    socket?.on("recreation", () => {
      navigation.push(`/play/connect/to/game`);
      setTimeout(() => {
        dispatch(disconnect());
      }, 2000);
    });
    socket?.on('inactive', (data) => {
      console.log("🚀 ~ socket?.on Inactive ~ data:", data)
      dispatch(update(data));
      socket?.emit('tryReconnect', { token: student.refreshToken, time: new Date().toTimeString() });
    })
    socket?.on("reconnectionAttempt", (data) => {
      if (data.status) {
        dispatch(join(data.join));

      } else {
        toast.error(data.message);
      }
    })
    setTimeout(() => setLoading(false), 1000);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message =
        "Are you sure you want to leave? Any unsaved progress might be lost.";
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("mousedown", closeDrawerOnOutsideClick);

    return () => {
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("mousedown", closeDrawerOnOutsideClick);
      socket?.off("studentJoined", handleStudentJoined);
      socket?.off("userInRoom", handleUserInRoom);
    };
  }, [
    socket,
    navigation,
    student,
    dispatch,
    drawerIsActive,
  ]);

  const fetch = async () => {
    try {
      const res = await fetchAvatars();
      if (res?.data.status) {
        dispatch(setAvatars(res?.data.avatars));
        dispatch(setAccessories(res?.data.items));
      }
    } catch (error) {
      toast.error("Error");
      console.log(error);
    }
  };

  const handleChangeCharacter = useCallback(
    (selectedAvatar: string) => {
      if (selectedAvatar !== student.student.avatar._id) {
        socket?.emit("changeCharacter", {
          roomId: student?.roomId,
          selectedAvatarId: selectedAvatar,
          student: student?.student,
        });
      }
    },
    [socket, student]
  );
  const handleChangeCharacterAccessories = useCallback(
    (selectedAvatarAccessories: string) => {
      socket?.emit("changeCharacterAccessories", {
        roomId: student?.roomId,
        selectedAccessoriesId: selectedAvatarAccessories,
        student: student?.student,
      });
    },
    [socket, student]
  );
  useEffect(() => {
    fetch();
  }, []);
  useEffect(() => {
    socket?.emit("checkUserInRoom", {
      roomId: student.student.room._id,
      studentData: student,
      token: student?.refreshToken ?? null,
    });
  }, [socket]);
  return (
    <div className="w-screen px-4 overflow-hidden flex-col relative text-4xl font-semibold text-white h-screen flex items-center justify-center">
      {loading ? (
        <Loader h={100} w={100} />
      ) : (
        <motion.div
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={() => setDrawerIsActive(!drawerIsActive)}
          className="relative w-fit h-fit"
        >
          <div className="absolute z-[1000000] top-[-20px] text-black right-[-20px] p-2 rounded-full bg-[#FBA732]">
            <GrEdit size={25} />
          </div>
          {student?.student && (
            <AnimatedAvatar
              avatarData={student.student.avatar}
              avatarItems={student.student.item}
              w={"128px"}
              h={"128px"}
              bg="#4686EC"
            />
          )}
        </motion.div>
      )}
      <div className="bg-[#E9E2B6] p-4 rounded-[10px] text-3xl font-semibold mt-3  text-black">
        <h3 className="">{student?.student.nickname}</h3>
      </div>
      <div className="bg-[#E9E2B6] text-center rounded-[10px] mt-3 p-6 text-black text-2xl">
        <p>
          You&lsquo;re in! See your nickname on screen?
        </p>
      </div>
      <motion.div
        ref={drawerRef}
        initial={{ translateY: "110%" }}
        animate={{ translateY: drawerIsActive ? "10%" : "110%" }}
        transition={{ duration: 0.5, ease: "easeIn" }}
        className="md:w-[70vw] pb-10 rounded-lg bg-white h-[85vh] z-[10000000000000000] absolute"
      >
        <div className="flex items-center justify-center py-4 text-gray-600">
          <button
            onClick={() => setIsCharacter(true)}
            className={`border border-gray-600 px-6 py-2 md:px-8 md:py-3 text-lg md:text-xl transition-all duration-300 ease-in-out 
      ${isCharacter ? "bg-white" : "bg-slate-100"} 
      rounded-l-md md:rounded-tl-[10px] md:rounded-bl-[10px]`}
          >
            Character
          </button>
          <button
            onClick={() => setIsCharacter(false)}
            className={`border border-gray-600 px-6 py-2 md:px-8 md:py-3 text-lg md:text-xl transition-all duration-300 ease-in-out 
      ${isCharacter ? "bg-slate-100" : "bg-white"} 
      rounded-r-md md:rounded-tr-[10px] md:rounded-br-[10px]`}
          >
            Accessories
          </button>
        </div>
        <div className="w-full py-10 overflow-y-auto scroll-smooth h-[85%] flex flex-wrap items-center justify-between gap-6 p-4 md:p-6">
          {isCharacter
            ? characters.map((c) => (
              <div
                key={c._id}
                className="w-fit h-fit"
                onClick={() => handleChangeCharacter(c._id)}
              >
                <AnimatedAvatar
                  avatarData={c}
                  w={isMobile ? "80px" : "128px"}
                  h={isMobile ? "80px" : "128px"}
                  bg={"#F2F2F2"}
                />
              </div>
            ))
            : accessories.map((a) => (
              <div
                key={a._id}
                onClick={() => handleChangeCharacterAccessories(a._id)}
                className="w-[90px] h-[90px] md:w-[128px] bg-slate-100 rounded-lg md:h-[128px] relative"
              >
                <Image
                  src={"/images/AvatarPrototype.svg"}
                  alt="AvatarPrototype"
                  width={128}
                  height={128}
                  className=" bg-cover w-[90px] h-[90px] md:w-[128px] md:h-[128px]"
                />
                <Image
                  src={a.resource}
                  loading="lazy"
                  alt="AvatarAccessory"
                  width={128}
                  height={128}
                  className="absolute top-0 left-0 w-[90px] h-[90px] md:w-[128px] md:h-[128px]"
                />
              </div>
            ))}
        </div>
      </motion.div>
      {
        !student.student.isActive && (
          <Backdrop open={true} className="!z-[100000000000]">
            <div className=" w-[90%] bg-white md:w-[50%]">
              <Link href={'/play/connect/to/game '}>
                Rejoin</Link>
            </div>
          </Backdrop>
        )
      }
    </div>
  );
})
Page.displayName = "Page"
export default Page;
