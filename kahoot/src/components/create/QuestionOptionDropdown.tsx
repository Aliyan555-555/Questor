"use client"
import {useState,useRef} from "react"
import useOutsideClick from "@/src/hooks/useClickoutside";


const QuestionOptionDropdown  = ({
    isMultiSelect,
    onSelectOption,
  }: {
    isMultiSelect: boolean;
    onSelectOption: (value: boolean) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    useOutsideClick(dropdownRef, () => setIsOpen(false))
    const handleSelectOption = (option: boolean) => {
      onSelectOption(option);
      setIsOpen(false);
    };
    // console.log("debug", isMultiSelect);
  
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white items-center !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md"
        >
          {isMultiSelect ? "Multi Select" : "Single Select"}
        </button>
  
        {isOpen && (
          <div
            style={{
              boxShadow:
                "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
            }}
            className="w-full left-0 absolute top-[110%] bg-white shadow-md z-10 p-2 rounded-md"
          >
            <div
              onClick={() => handleSelectOption(false)}
              className={`hover:bg-[#0002] p-2 rounded-md cursor-pointer ${!isMultiSelect ? "bg-gray-100" : ""
                }`}
            >
              <h4 className="text-lg font-semibold">Single Select</h4>
              <p className="text-xs text-gray-500">
                Players can only select one of the answers.
              </p>
            </div>
            <div
              onClick={() => handleSelectOption(true)}
              className={`hover:bg-[#0002] p-2 rounded-md cursor-pointer ${isMultiSelect ? "bg-gray-100" : ""
                }`}
            >
              <h4 className="text-lg font-semibold">Multi Select</h4>
              <p className="text-xs text-gray-500">
                Players can select multiple answers.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default QuestionOptionDropdown ;
  