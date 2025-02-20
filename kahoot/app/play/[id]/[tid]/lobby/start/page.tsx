"use client";
import { RootState } from "@/src/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  bounceInitialScale,
  bounceScaleAnimation,
  bounceTransition,
  CounterRoundInitial,
  CounterRoundTransition,
} from "@/src/animations";
import { useRouter } from "next/navigation";

const Start: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigation = useRouter();
  const [rotate, setRotate] = useState(0);
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    if (counter === 0) {
      navigation.push(
        `/play/${teacher?.quiz._id}/${teacher?.teacher}/lobby/gameBlock`
      );
    } else {
      const interval = setInterval(() => {
        setCounter((prev) => prev - 1);
        setRotate((prevRotate) => prevRotate + 180 / 2 / 2); // Update the rotation incrementally
      }, 1400);

      return () => clearInterval(interval);
    }
  }, [counter, navigation, teacher?.quiz]);
  console.log(teacher);
  return (
    <div style={{ backgroundImage: `url(${teacher?.quiz.theme.image})` }} className="w-screen h-screen flex items-center justify-center">
      {isVisible ? (
        <motion.div
          initial={bounceInitialScale}
          animate={bounceScaleAnimation}
          transition={bounceTransition}
          onAnimationComplete={() => setIsVisible(false)}
          className="w-[60%] h-[300px] rounded-[10px] bg-blue_1 text-white py-4 text-center flex items-center justify-center text-5xl font-bold"
        >
          <p>          {teacher?.quiz.name}</p>
        </motion.div>
      ) : (
        <div className="text-white w-[200px] h-[200px] flex items-center justify-center relative text-6xl font-bold">
          {" "}
          <motion.div
            initial={CounterRoundInitial}
            animate={{ rotate: `${rotate}deg` }}
            transition={CounterRoundTransition}
            className="w-[200px] h-[200px]  absolute top-0 left-0  bg-blue_1 flex items-center justify-center"
          ></motion.div>{" "}
          <motion.p
            animate={{ scale: [1.2, 0, 1.2] }} // Scale down, then scale up
            initial={{ scale: 1 }}
            transition={{
              duration: 1.5, // Smooth transition duration
              ease: "easeInOut", // Smooth easing
              times: [0, 0.5, 1], // Defines when scale values should occur
              repeat: 1, // Runs twice (initial + repeat once)
            }}
            className="z-50 relative"
          >
            {counter}
          </motion.p>

        </div>
      )}
    </div>
  );
};

export default Start;
