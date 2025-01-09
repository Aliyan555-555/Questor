"use client";
import { RootState } from "@/src/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  bounceInitialScale,
  bounceScaleAnimation,
  bounceTransition,
  CounterRoundAnimation,
  CounterRoundInitial,
  CounterRoundTransition,
} from "@/src/animations";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigation = useRouter();
  const [rotate, setRotate] = useState(0);
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    if (counter === 0) {
      navigation.push(
        `/play/${teacher.quizId}/${teacher.teacherId}/lobby/gameBlock`
      );
    } else {
      const interval = setInterval(() => {
        setCounter((prev) => prev - 1);
        setRotate((prevRotate) => prevRotate + 22.5); // Update the rotation incrementally
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [counter, navigation, teacher.quizId, teacher.teacherId]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {isVisible ? (
        <motion.div
          initial={bounceInitialScale}
          animate={bounceScaleAnimation}
          transition={bounceTransition}
          onAnimationComplete={() => setIsVisible(false)}
          className="w-screen bg-white py-4 text-center text-black text-5xl font-bold"
        >
          {teacher.kahoot.name}
        </motion.div>
      ) : (
        <div className="text-white w-[150px] h-[150px] flex items-center justify-center relative text-6xl font-bold">
          {" "}
          <motion.div
            initial={CounterRoundInitial}
            animate={{rotate}}
            transition={CounterRoundTransition}
            className="w-[150px] h-[150px]  absolute top-0 left-0  bg-purple-500 flex items-center justify-center"
          ></motion.div>{" "}
          <p className="z-50 relative">{counter}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
