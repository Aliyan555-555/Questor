"use client"
import React from 'react';
import {motion} from "framer-motion";
import { IconButton } from "@mui/material";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import {useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import Image from "next/image";
import TypesDropdown from "@/src/components/create/TypesDropdown";
import TimeLimitDropdown from "@/src/components/create/TimeLimitDropdown";
import QuestionOptionDropdown from "@/src/components/create/QuestionOptionDropdown"
import { Question } from "@/src/types";
interface RightSidebarProps {
  customizableBarIsOpen: boolean;
  setCustomizableBarIsOpen: (value: boolean) => void;
  handleUpdateQuestion: (data: Partial<Question>) => void;
  isThemeOpen: boolean;
  setIsThemeOpen: (value: boolean) => void;
  themes:{_id:string,image:string}[];
  selectedQuestionData: Question;
  handleChangeTheme: (theme:string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  customizableBarIsOpen,
  setCustomizableBarIsOpen,
  handleUpdateQuestion,
  isThemeOpen,
  setIsThemeOpen,
  themes,
  selectedQuestionData,
  handleChangeTheme
}) => {
  const data = useSelector((root: RootState) => root.student.currentDraft);
  return (
     
    <motion.div
          animate={{ width: customizableBarIsOpen ? "310px" : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-[310px] h-[calc(100vh-90px)]  bg-[#E9E2B6] relative"
        >
          <motion.button
            animate={{ left: customizableBarIsOpen ? "-40px" : "-50px" }}
            onClick={() => setCustomizableBarIsOpen(!customizableBarIsOpen)}
            className="absolute top-1/2 bg-[#E9E2B6] py-2 px-2 z-0 w-[80px] rounded-md"
          >
            {customizableBarIsOpen ? (
              <FaChevronRight fontSize={23} />
            ) : (
              <FaChevronLeft fontSize={23} />
            )}
          </motion.button>
          {isThemeOpen ? (
            <div className="w-full h-full z-10 p-5 relative flex flex-col gap-6">
              <div className="w-full flex justify-between">
                <h3 className="text-lg font-semibold">Themes</h3>
                <IconButton
                  onClick={() => setIsThemeOpen(false)}
                  className="!text-black"
                >
                  <RxCross2 />
                </IconButton>
              </div>
              <div className="w-full flex flex-wrap h-[90vh] overflow-y-scroll justify-center gap-3">
                {themes.map((theme, i) => (
                  <div
                    key={i}
                    onClick={() => handleChangeTheme(theme._id)}
                    className={`w-[110px]  border-[3px] rounded-md p-1 ${theme?._id === data?.theme?._id
                      ? "border-blue-600"
                      : "border-transparent"
                      } hover:border-gray-400  h-[110px] `}
                  >
                    <Image
                      className="w-full h-full object-cover rounded-md"
                      src={theme.image}
                      alt="Theme"
                      width={100}
                      // loader={imageLoader}
                      height={100}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-full z-10 p-5 relative flex flex-col gap-6">
              <div className="w-full flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Question type</h3>

                <TypesDropdown
                  selectedQuestion={selectedQuestionData}
                  setTypes={(value: string) =>
                    handleUpdateQuestion({
                      ...selectedQuestionData,
                      type: value,
                    })
                  }
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Time limit</h3>
                <TimeLimitDropdown
                  duration={selectedQuestionData?.duration}
                  setDuration={(value: number) =>
                    handleUpdateQuestion({
                      ...selectedQuestionData,
                      duration: value,
                    })
                  }
                />
              </div>
              {selectedQuestionData?.type === 'quiz' && <div className="w-full flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Answer options</h3>

                <QuestionOptionDropdown
                  isMultiSelect={selectedQuestionData?.isMultiSelect}
                  onSelectOption={(value: boolean) => {
                    handleUpdateQuestion({
                      ...selectedQuestionData,
                      isMultiSelect: value,
                      answerIndex: [],
                    });
                  }}
                />
              </div>}


            </div>
          )}
        </motion.div>
  )
}

export default RightSidebar
