"use client";
import { QuizIcon } from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { div } from "framer-motion/client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const QuestionSection = ({question}) => {
  return (
    <div className="w-full  h-full flex flex-col">
      <motion.div
        animate={{ margin: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full flex items-center m-auto justify-center pt-2"
      >
        <motion.div
          animate={{
            scale: [5, 2, 3, 1, 1],
            rotateY: [0, 0, 0, 0, 360],
            // translateY:[0,0,0,0,''],
            // margin:['auto','auto','auto','auto',0]
          }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            times: [0.2, 0.1, 0.1, 0.2, 0.6],
            repeat: 0,
            repeatDelay: 1,
          }}
          className="bg-[#00000071] relative  rounded-full flex items-center justify-center  w-[70px] h-[70px]"
        >
          <QuizIcon />
          <motion.div
            animate={{ opacity: [1, 1, 0], scale: [1.5, 1, 1.5] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#00000071] px-[50px] py-1.5 text-lg text-white  font-bold absolute top-full "
          >
            Quiz
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div animate={{opacity:1}} transition={{delay:0.5,duration:0.1}} className="w-full font-bold text-center  mt-[300px] py-2 opacity-0 text-5xl leading-[60px] bg-white text-black">
        {question}
      </motion.div>

      <div  className="w-[90%] h-[25px] m-auto ">
        <motion.div animate={{width:'100%'}} transition={{duration:5}} className="bg-purple-600 rounded-[50px] h-full w-0 ">

        </motion.div>
      </div>

    </div>
  );
};
const OptionsSection = ({data}) =>{
  return (
    <div className="w-full h-full fixed top-0 left-0 bg-[#000a] p-4 flex-col flex items-center justify-between">
      <div className="w-fit px-4 py-3 text-4xl font-bold text-center  text-black bg-white">
        {data.kahoot.questions[0].question}
      </div>
      <div className="w-full flex gap-2  flex-wrap">
        {
          data.kahoot.questions[0].options.map(option => (
            <div className="w-[49%]  p-5 text-3xl font-semibold text-white bg-red-600">{option}</div>
          )) 
        }

      </div>

    </div>
  )
}
const page = () => {
  const [stage,setStage] = useState(1)
  const teacher = useSelector((root: RootState) => root.teacher.currentGame);
  useEffect(()=>{
    setTimeout(() => {
      setStage(2);
    }, 6000);
  },[])
  return (
    <div className="w-screen h-screen">
      {stage === 1 && <QuestionSection question={teacher.kahoot.questions[0].question} />}
      {stage === 2 && <OptionsSection data={teacher} />}
    </div>
  );
};

export default page;
