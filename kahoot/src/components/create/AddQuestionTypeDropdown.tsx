"use client"
import {useState,useEffect, useRef} from "react";
import {Button} from "@mui/material";
import { QuestionsTypes } from "@/src/contents";

const AddQuestionTypesDropdown = ({
    setType,
  }: {
    setType: (type: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
  
    const handleAddQuestion = (type: string) => {
      setType(type);
      setIsOpen(false);
    };
  
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    return (
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="!bg-[#FBA732] w-full !flex !gap-2 !text-white !rounded-[10px] !capitalize"
        >
          <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 0C5.5957 0 0 5.5957 0 12.5C0 19.4043 5.5957 25 12.5 25C19.4043 25 25 19.4043 25 12.5C25 5.5957 19.4043 0 12.5 0ZM19.79 13.54C19.79 14.1162 19.3262 14.5801 18.75 14.5801H14.585V18.75C14.585 19.3262 14.1211 19.79 13.5449 19.79H11.46C10.8838 19.79 10.4199 19.3213 10.4199 18.75V14.585H6.25C5.67383 14.585 5.20996 14.1162 5.20996 13.5449V11.46C5.20996 10.8838 5.67383 10.4199 6.25 10.4199H10.415V6.25C10.415 5.67383 10.8789 5.20996 11.4551 5.20996H13.54C14.1162 5.20996 14.5801 5.67871 14.5801 6.25V10.415H18.75C19.3262 10.415 19.79 10.8838 19.79 11.4551V13.54Z" fill="#F8F4FB" />
          </svg>
  
          Add Question
        </Button>
  
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-full z-[1000000000000000] bottom-full mt-2 bg-white shadow-lg rounded-md w-[220px] p-2 "
            style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}
          >
            {QuestionsTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleAddQuestion(type.type)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                {type.icon}
                <p className="text-sm font-medium">{type.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  
  
  };



  export default AddQuestionTypesDropdown;