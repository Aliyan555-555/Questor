"use client";
import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Root } from "postcss";
import { RootState } from "@/src/redux/store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { API_DOMAIN } from "@/src/redux/api";
import { useSocket } from "@/src/hooks/useSocket";
import { setCurrentDraft } from "@/src/redux/schema/student";

const Create = () => {
  const socket = useSocket()
  const themes = useSelector((root:RootState) => root.student.themes)
  const [customizableBarIsOpen, setCustomizableBarIsOpen] = useState(true);
  const user = useSelector((root:RootState) => root.student.user);
  const [data,setData] = useState({
    name: '',
    description: '',
    creator: user?._id,
    coverImage: '/images/defaultCover.png',
    isPrivet: true,
    status: 'draft',
    // theme: new ObjectId('678e32b0d9b1cabe37ad6411'),
    questions: [
      {
        duration: 30,
        showQuestionDuration: 2000,
        type: 'quiz',
        media: '',
        maximumMarks: 1000,
        question: '',
        options: [],
        answerIndex: [Array],
        attemptStudents: [],
        results: [],
        __v: 0
      }
    ],
  });
  const dispatch = useDispatch();
  const query = useSearchParams();
  const navigation = useRouter();
  const id = query.get('id');


  const createQuiz = async ()  => {
    try {
      socket?.emit('create_quiz',{
        name:"",
        description:"",
        creator:user?._id,
        theme:"678e32b0d9b1cabe37ad6411",
      })
    } catch (error) {
      console.log(error)
      toast.error("Failed to create")
    }
  }
  useEffect(() => {
   if (!id){
    createQuiz();
   }
  });

  useEffect(() => {
    if (socket) {
      socket.on("created_quiz",(data)=>{
        if (data?.status){
          dispatch(setCurrentDraft(data.data));
          navigation.push(`/play/create?id=${data.data._id}`)

        }
        else{
          toast.error("Failed to create")
        }
      })
    }
  })
  return (
    <div className="w-sceen bg-white h-screen flex flex-col">
      <div className="w-full h-[60px] bg-gray-400">
        <div></div>
      </div>
      <div className="w-full flex-1 flex">
        <div className="w-[170px] h-full bg-pink-400"></div>
        <div className="flex-1 h-full bg-red-400"></div>
        <motion.div
          animate={{ width: customizableBarIsOpen ? "350px" : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-[350px] h-full bg-blue-400 relative"
        >
          <motion.button
            animate={{ left: customizableBarIsOpen ? "-40px" : "-50px" }}
            onClick={() => setCustomizableBarIsOpen((p) => !p)}
            className="absolute top-1/2 bg-white py-2 px-2 z-0 w-[80px] rounded-md"
          >
            {customizableBarIsOpen ? (
              <FaChevronRight fontSize={23} />
            ) : (
              <FaChevronLeft fontSize={23} />
            )}
          </motion.button>

          <div className="w-full h-full z-10 bg-red-900 relative"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Create;
