"use client"
import {useState,useRef} from "react";
import { Question } from "@/src/types";
import { QuestionsTypes } from "@/src/contents";
import useOutsideClick from "@/src/hooks/useClickoutside";



const TypesDropdown = ({
    setTypes,
    selectedQuestion,
  }: {
    setTypes: (value: string) => void;
    selectedQuestion: Question;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOutsideClick(dropdownRef, () => setIsOpen(false))
    const handleSelect = (value: string) => {
      setTypes(value);
    };
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full items-center bg-white !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md relative"
        >
          {QuestionsTypes.find((t) => t.type === selectedQuestion?.type)?.icon}{" "}
          {QuestionsTypes.find((t) => t.type === selectedQuestion?.type)?.title}
          {isOpen && (
            <div
              style={{
                boxShadow:
                  "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
              }}
              className="w-full left-0 absolute top-[110%] bg-white shadow-md z-10 p-2 rounded-md"
            >
              {QuestionsTypes.map((type) => (
                <div
                  onClick={() => handleSelect(type.type)}
                  key={type.id}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  {type.icon} {/* Render the icon directly */}
                  <p className="text-sm font-medium">{type.title}</p>
                </div>
              ))}
            </div>
          )}
        </button>
      </div>
    );
  };


  export default TypesDropdown;

  