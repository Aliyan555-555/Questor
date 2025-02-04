"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegImage } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { RootState } from "@/src/redux/store";
import { IoIosAdd } from "react-icons/io";
import { HiOutlineDocumentDuplicate } from "react-icons/hi2";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSocket } from "@/src/hooks/useSocket";
import {
  clearCurrentDraft,
  CurrentDraft,
  setCurrentDraft,
  setThemes,
  updateCurrentDraft,
  updateQuestion,
  updateQuestionMedia,
} from "@/src/redux/schema/student";
import SettingsModel from "@/src/components/create/SettingsModel";
import { Button, IconButton } from "@mui/material";
import Image from "next/image";
import { MdDeleteOutline, MdOutlineDeleteForever } from "react-icons/md";
import { ReactSortable } from "react-sortablejs";
import { truncateString } from "@/src/lib/services";
import GalleryModel from "@/src/components/create/GalleryModel";
import {
  CircleIcon,
  DiamondIcon,
  DoneIcon,
  SquareIcon,
  TriangleIcon,
} from "@/src/lib/svg";
import { Question } from "@/src/types";
import { QuestionsTypes, TimeLimit } from "@/src/contents";
import { GetAllThemes } from "@/src/redux/api";
import { SaveModel } from "@/src/components/create/SaveModel";
import Loading from "../[id]/loading";
import imageLoader from "@/src/components/ImageLoader";
import useOutsideClick from "@/src/hooks/useClickoutside";

const Create = () => {
  const socket = useSocket();
  const [savingErrors, setSavingErrors] = useState<ErrorType[]>([])
  const [isOpenGallery, setIsOpenGallery] = useState(false);
  const themes = useSelector((root: RootState) => root.student.themes);
  const [isSaveModelOpen, setIsSaveModelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customizableBarIsOpen, setCustomizableBarIsOpen] = useState(true);
  const user = useSelector((root: RootState) => root.student.user);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedQuestionData, setSelectedQuestionData] =
    useState<Question | null>(null);
  const dispatch = useDispatch();
  const path = usePathname();
  const query = useSearchParams();
  const data = useSelector((root: RootState) => root.student.currentDraft);
  const navigation = useRouter();
  const id = query.get("id");
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const fetch = async () => {
    const res = await GetAllThemes();
    if (res?.status) {
      dispatch(setThemes(res?.data));
    }
  };
  useEffect(() => {
    if (id && data._id !== id) {
      socket?.emit("fetch_quiz", { _id: id });
    }
    return () => {
      socket?.off("fetch_quiz");
    }
  });
  useEffect(() => {
    fetch();
  }, []);
  const createQuiz = async () => {
    try {
      dispatch(clearCurrentDraft());

      if (!user?._id) {
        navigation.push(
          `/auth/login?redirect_url=${window.location.origin}${path}&redirect=true`
        );
        return toast.error("User not authenticated");
      }
      if (!id) {
        dispatch(clearCurrentDraft());
      }

      if (data && data._id === id) return;


      socket?.emit("create_quiz", {
        name: "Untitled Quiz",
        description: "Add a description here.",
        creator: user._id,
        theme: "678e32b0d9b1cabe37ad6411",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz.");
    }
  };

  useEffect(() => {
    if (!id && socket && dispatch) {
      createQuiz();
    }
  }, [id, socket, dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on("feched_quiz", (quizData) => {
        if (quizData.status) {
          dispatch(setCurrentDraft(quizData.data));
          setSelectedQuestion(quizData.data.questions?.[0]?._id || null);
          setSelectedQuestionData(quizData.data.questions?.[0]);
        } else {
          toast.error("Failed to fetch quiz data.");
        }
      });
      socket.on("created_quiz", (quizData) => {
        if (quizData?.status) {
          dispatch(setCurrentDraft(quizData.data));
          navigation.push(`/play/create?id=${quizData.data._id}`);
          setSelectedQuestion(quizData.data.questions?.[0]?._id || null);
        } else {
          toast.error("Failed to create quiz.");
        }
      });

      socket.on("fetched_quiz", (quizData) => {
        if (quizData.status) {
          dispatch(setCurrentDraft(quizData.data));
        } else {
          toast.error("Failed to fetch quiz data.");
        }
      });

      socket.on("deleted_question_in_quiz", (quizData) => {
        dispatch(updateCurrentDraft({ ...quizData.data }));
        setSelectedQuestion(
          quizData.data.questions[quizData.data.questions.length - 1]._id
        );
        setSelectedQuestionData(
          quizData.data.questions[quizData.data.questions.length - 1]
        );
      });

      socket.on("set_question_value", (quizData) => {
        dispatch(updateCurrentDraft({ ...quizData.data }));
      });

      socket.on("updated_question_media", (quizData) => {
        if (quizData.status) {
          dispatch(updateQuestionMedia({ ...quizData.data }));
          setSelectedQuestionData(quizData.data)
        }
      });

      socket.on("updated_question", (quizData) => {
        if (quizData.status) {
          console.log(quizData.data);
          dispatch(updateQuestion({ ...quizData.data }));
          setSelectedQuestionData(quizData.data);
        }
      });

      socket.on("updated_theme", (quizData) => {
        if (quizData.status) {
          dispatch(updateCurrentDraft({ ...quizData.data }));
        }
      });
      socket.on("updated_quiz", (quizData) => {
        if (quizData.status) {
          dispatch(updateCurrentDraft({ ...quizData.data }));
        }
      });
      socket.on("question_added", (quizData) => {
        if (quizData.status) {
          dispatch(updateCurrentDraft({ ...quizData.data }));
        }
      });
    }

    if (id && !data) {
      socket?.emit("fetch_quiz", { _id: id });
    }

    return () => {
      if (socket) {
        socket.off("updated_quiz");
        socket.off("updated_question");
        socket.off("updated_question_media");
        socket.off("set_question_value");
        socket.off("deleted_question_in_quiz");
        socket.off("created_quiz");
        socket.off("fetched_quiz");
      }
    };
  }, [socket, id, data, dispatch]);
  useEffect(() => {
    if (data && data.questions?.length > 0) {
      setSelectedQuestion(data.questions[0]._id);
      setInputValue(data.questions[0].question);
      setSelectedQuestionData(data.questions[0]);
    } else {
      setSelectedQuestion(null);
    }
  }, []);
  const handleUpdateQuestion = (question) => {
    if (question) {
      socket?.emit("update_question", question);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!id || !questionId) {
      return toast.error("Invalid question or quiz ID.");
    }
    if (data?.questions.length > 1) {
      socket?.emit("delete_question_in_quiz", { questionId, _id: id });
    }
  };
  const handleUpdateQuiz = (quizData) => {
    // const isSame = JSON.stringify(quizData) === JSON.stringify(data);

    socket?.emit("update_quiz", quizData);

    // socket?.emit("update_quiz",quizData)
  };
  const handleSetQuestion = (value: string) => {
    if (!selectedQuestion) {
      return toast.error("Please select a question to set as the main one.");
    }
    socket?.emit("set_question_value", {
      questionId: selectedQuestion,
      _id: id,
      value,
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSetQuestion(inputValue);
    }
  };
  const updateQuestionTypes = () => {
    if (selectedQuestionData) {



      if (
        selectedQuestionData.type === "true/false" &&
        JSON.stringify(selectedQuestionData.options) !== JSON.stringify(["True", "False"])
      ) {
        handleUpdateQuestion({
          ...selectedQuestionData,
          answerIndex: [],
          options: ["True", "False"],
        });
      } else if (
        selectedQuestionData.type === "quiz" &&
        (!selectedQuestionData.options || selectedQuestionData.options.length !== 4)
      ) {
        handleUpdateQuestion({
          ...selectedQuestionData,
          options: ["", "", "", ""],
          answerIndex: [],
        });
      }
    }
  }
  useEffect(() => {
    updateQuestionTypes()
  }, [selectedQuestionData, handleUpdateQuestion]);

  // useEffect(() => { 
  //   handleSetQuestion(inputValue)
  // },[inputValue,handleSetQuestion])

  useEffect(() => {
    if (data && data.questions?.length > 0) {
      // setInputValue(data?.questions.filter(
      //   (question) => question._id === selectedQuestion
      // )[0].question ?? "");
      setSelectedQuestionData(
        data?.questions.filter(
          (question) => question._id === selectedQuestion
        )[0]
      );
      setInputValue(data?.questions.filter((question) => question._id === selectedQuestion)[0]?.question ?? "")

    }
  }, [selectedQuestion]);

  const handleChangeMedia = (qid: string | null, quizId: string, media: string) => {
    socket?.emit("update_question_media", {
      questionId: qid,
      _id: quizId,
      media,
    });
  };
  const handleRemoveMedia = (qid: string, quizId: string | null, media: string) => {
    socket?.emit("update_question_media", {
      questionId: qid,
      _id: quizId,
      media: media,
    });
  };
  const handleChangeTheme = (theme: string) => {
    socket?.emit("update_theme", { id, theme });
  };
  const handleAddQuestion = (type: string) => {
    socket?.emit("add_question", { id, type });
  };
  const handleSaveAnswerIndex = (questionIndex: string, optionIndex: number) => {
    if (!selectedQuestionData?.isMultiSelect) {
      handleUpdateQuestion({
        ...selectedQuestionData,
        answerIndex: [optionIndex],
      });
    } else {
      const isSelected =
        selectedQuestionData?.answerIndex?.includes(optionIndex);
      const updatedAnswerIndex = isSelected
        ? selectedQuestionData.answerIndex.filter(
          (index) => index !== optionIndex
        ) // Remove the option if already selected
        : [...(selectedQuestionData?.answerIndex || []), optionIndex];

      handleUpdateQuestion({
        ...selectedQuestionData,
        answerIndex: updatedAnswerIndex,
      });
    }
  };

  const handleQuestionSorting = (
    questionsArray: Array<{
      id: number;
      _id: string;
      question: string;
      options: string[];
      answerIndex: number[];
      duration: number;
      showQuestionDuration: number;
      isMultiSelect: boolean;
      maximumMarks: number;
      type: string;
      media: string;
      attemptStudents: string[];
      results: string[];
    }>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedQuestions = questionsArray.map(({ id, ...rest }) => rest);
    data?.questions?.map((q, i) => {
      if (q._id !== questionsArray[i]._id) {
        handleUpdateQuiz({ ...data, questions: updatedQuestions });
        console.log("updating");
        return;
      }
    });
    // dispatch(setCurrentDraft({...data, questions: updatedQuestions}));
  };

  const handleSaveSettings = (quizData: CurrentDraft) => {
    handleUpdateQuiz({ ...data, ...quizData });
  };
  useEffect(() => {
    if (data && id) {
      setSavingErrors(() => {
        const updatedErrors = data?.questions?.reduce((acc: ErrorType[], q, i) => {
          const error = {
            index: i + 1,
            type: q.type,
            question: q.question,
            media: q.media !== "" ? q.media : "/images/defaultCover.png",
            message: '',
          };

          if (!q.question || q.question.trim() === "") {
            acc.push({ ...error, message: "Enter a valid question" });
          } else if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            acc.push({ ...error, message: "At least two options are required." });
          } else if (q.options.some(opt => !opt || opt.trim() === "")) {
            acc.push({ ...error, message: "Each option must have valid text." });
          } else if (!Array.isArray(q.answerIndex) || q.answerIndex.length === 0) {
            acc.push({ ...error, message: "At least one correct answer must be selected." });
          } else if (!q.isMultiSelect && q.answerIndex.length > 1) {
            acc.push({ ...error, message: "Single select questions must have only one correct answer." });
          }

          return acc;
        }, []);

        return updatedErrors;
      });
    }
  }, [data, id]);

  const handleChangeQuizStatus = () => {
    socket?.emit("update_quiz_status", { status: 'active', _id: id });
  }

  const ReturnToHome = (status) => {
    handleUpdateQuiz({ ...data, status: status });
    navigation.push('/')
  }

  if (id !== data?._id) {
    return (
      <Loading />
    )
  };




  return (
    <div className="w-screen bg-white h-screen flex flex-col">
      <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px" }}
        className="w-full py-2 gap-4 flex"
      >
        <div className="w-[200px] "></div>
        <SettingsModel handleSaveSettings={handleSaveSettings} data={data} />
        <div className="flex flex-1 items-center justify-center gap-4">
          <Button
            onClick={() => {
              setIsThemeOpen(true);
              setCustomizableBarIsOpen(true);
            }}
            className="!bg-blue-600 !text-white !font-semibold !px-6 !text-md !capitalize !tracking-wide"
          >
            Theme
          </Button>
          <Button onClick={() => ReturnToHome(data.status)} className="!bg-gray-300 !text-black !font-semibold !px-6 !text-md !capitalize !tracking-wide">
            Exist
          </Button>
          <Button onClick={() => { setIsSaveModelOpen(true); handleChangeQuizStatus() }} className="!bg-blue-600 !text-white !font-semibold !px-6 !text-md !capitalize !tracking-wide">
            Save
          </Button>
        </div>
      </div>
      <div className="w-full flex-1 flex">
        <div className="w-[180px]">
          <div className="w-full py-1 overflow-y-auto h-[80vh]">
            <ReactSortable
              list={
                data && data.questions ? data?.questions?.map((question, index) => ({
                  ...question,
                  id: index + 1,
                }))
                  : []
              }
              setList={handleQuestionSorting}
              animation={200}
              easing="ease-out"
              className="sortable-container"
            >
              {data && data.questions && data?.questions?.map((q, i) => (
                <div
                  key={q._id}
                  onClick={() => setSelectedQuestion(q._id)}
                  style={{
                    backgroundColor:
                      selectedQuestion === q._id ? "#EAF4FC" : "#fff",
                  }}
                  className="w-full  select-none group h-[150px] py-2 flex cursor-grab flex-col"
                >
                  <div className="w-full flex text-xs font-bold gap-1 px-6">
                    <p>{i + 1}</p>
                    <p className="capitalize">{q.type}</p>
                  </div>
                  <div className="flex w-full flex-1">
                    <div className="h-full w-[22px] gap-1 text-gray-500 opacity-0 group-hover:opacity-100 flex py-1 flex-col items-center justify-end">
                      <button className="p-1 rounded-full bg-transparent hover:bg-[#0000001b]">
                        <HiOutlineDocumentDuplicate />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className={`p-1 ${data?.questions.length > 1
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                          } rounded-full bg-transparent hover:bg-[#0000001b]`}
                      >
                        <MdOutlineDeleteForever fontSize={15} />
                      </button>
                    </div>
                    <div className="flex-1 h-full pl-1 pr-2 py-2">
                      <div
                        className={`w-full h-full relative rounded-md ${selectedQuestion === q._id
                          ? "group-hover:border-blue-500"
                          : "group-hover:border-gray-400"
                          } ${selectedQuestion === q._id
                            ? "border-blue-500 bg-white"
                            : "border-transparent bg-gray-100"
                          } border-[3px]`}
                      >

                        <div className="w-full flex items-center justify-center py-1">
                          <p className="text-xs text-gray-400 font-bold text-center">
                            {q.question === ""
                              ? "Question"
                              : truncateString(q.question, 15)}
                          </p>
                        </div>
                        <div className="flex w-full items-center py-2 justify-center relative">
                          <div className="rounded-full absolute left-2 w-[22px] h-[22px] flex items-center justify-center text-gray-400 text-[10px] border p-1 border-gray-300">
                            <p>{q.duration}</p>
                          </div>
                          <div className="w-[40px] h-[30px] border border-dotted border-gray-300 text-gray-400 flex items-center justify-center">
                            {q.media === "" ? (
                              <FaRegImage fontSize={15} />
                            ) : (
                              <Image
                                src={q.media}
                                alt="Media"
                                width={40}
                                height={30}
                                className="w-full h-full"
                                loader={imageLoader}
                              />
                            )}
                          </div>
                        </div>
                        <div className="w-full items-center justify-center gap-1 flex-wrap flex">
                          {q.options.map((o, i) => (
                            <div
                              key={i}
                              className="w-[45%] py-[2px] rounded-md relative border-[0.7px] border-gray-300"
                            >
                              {q.answerIndex.includes(i) && (
                                <div className="absolute right-0 bg-green-500 w-1 h-1 top-0 rounded-full" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ReactSortable>
          </div>
          <div className="w-full px-3 flex bg-white flex-col gap-1 sticky bottom-0 py-2">
            <AddQuestionTypesDropdown
              setType={(type) => handleAddQuestion(type)}
            />
          </div>
        </div>
        <div
          style={{
            backgroundImage: `url(${data?.theme?.image || ""})`,
          }}
          className="flex-1 bg-cover bg-center bg-no-repeat  overflow-y-scroll h-screen pb-20 scroll"
        >
          <div className="w-full flex items-center justify-center py-10">
            <input
              onBlur={() => handleSetQuestion(inputValue)}

              onKeyDown={handleKeyDown}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); handleSetQuestion(inputValue) }}
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
              }}
              type="text"
              placeholder="Start type your question"
              className="w-[95%] text-gray-500 font-semibold h-[50px] placeholder:text-xl placeholder:text-center focus:outline-none  bg-white rounded-md text-center text-xl active:placeholder:hidden"
            />
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="w-[450px] flex flex-col gap-3 items-center justify-center h-[300px] bg-[#eeeeeee0] rounded-md">
              {data ? (
                selectedQuestionData?.media === "" ? (
                  <React.Fragment>
                    <IconButton
                      onClick={() => setIsOpenGallery(true)}
                      className="!bg-white !text-gray-700"
                    >
                      <IoIosAdd fontSize={50} />
                    </IconButton>
                    <h3
                      className="text-3xl font-semibold text-gray-700"
                      onClick={() => setIsOpenGallery(true)}
                    >
                      Find and insert image
                    </h3>
                    <h4
                      className="text-xl text-gray-700"
                      onClick={() => setIsOpenGallery(true)}
                    >
                      Upload a file or drag and drop here
                    </h4>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {selectedQuestionData?.media ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={
                            selectedQuestionData?.media
                          }
                          alt="Media"
                          width={300}
                          height={300}
                          loader={imageLoader}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="w-full absolute bottom-0 flex justify-end p-2 text-gray-700">
                          <IconButton
                            onClick={() =>
                              handleRemoveMedia(
                                selectedQuestionData._id,
                                id,
                                ""
                              )
                            }
                            className="!bg-white !rounded-md
                          !p-2 "
                          >
                            <MdDeleteOutline />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <h3 className="text-2xl text-gray-500">
                        Media is unavailable or invalid.
                      </h3>
                    )}
                  </React.Fragment>
                )
              ) : (
                <React.Fragment>
                  <h3 className="text-2xl text-gray-500">
                    No questions available to display.
                  </h3>
                </React.Fragment>
              )}
            </div>
          </div>

          {
            selectedQuestionData?.type === 'quiz' && (
              <div className="w-full flex flex-wrap py-5 px-3 gap-3">
                <div
                  onClick={() => document.getElementById('option1').focus()}
                  className={`w-[49%] h-[100px] select-none p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[0] ? "bg-[#D01937]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#D01937] w-fit px-1 flex items-center rounded-md">
                    <TriangleIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input
                      id="option1"
                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      value={selectedQuestionData?.options?.[0] ?? ""}
                      onChange={(e) =>
                        setSelectedQuestionData((prev) => {
                          if (!prev) return prev;
                          const updatedQuestion = { ...prev };

                          if (updatedQuestion.options) {
                            updatedQuestion.options = [...updatedQuestion.options];
                            updatedQuestion.options[0] = e.target.value;
                          }

                          console.log(updatedQuestion);
                          return updatedQuestion;
                        })
                      }
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white cursor-text bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[0] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 0)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(0)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(0)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => document.getElementById('option2').focus()}
                  className={`w-[49%] h-[100px] p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[1] ? "bg-[#1368CE]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#1368CE] w-fit px-1 flex items-center rounded-md">
                    <DiamondIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input
                      id="option2"
                      value={selectedQuestionData?.options?.[1] ?? ""}
                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      onChange={(e) =>
                        setSelectedQuestionData((prev) => {
                          if (!prev) return prev;
                          const updatedQuestion = { ...prev };

                          if (updatedQuestion.options) {
                            updatedQuestion.options = [...updatedQuestion.options];
                            updatedQuestion.options[1] = e.target.value;
                          }
                          console.log(updatedQuestion);
                          return updatedQuestion;
                        })
                      }
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white cursor-text  bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[1] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 1)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(1)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(1)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => document.getElementById('option3').focus()}
                  className={`w-[49%] h-[100px] p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[2] ? "bg-[#D89E00]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#D89E00] w-fit px-1 flex items-center rounded-md">
                    <CircleIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input
                      id="option3"
                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      value={selectedQuestionData?.options?.[2] ?? ""}
                      onChange={(e) =>
                        setSelectedQuestionData((prev) => {
                          if (!prev) return prev; // Ensure `prev` is not null or undefined
                          const updatedQuestion = { ...prev };

                          if (updatedQuestion.options) {
                            // Create a shallow copy of the `options` array to avoid direct mutation
                            updatedQuestion.options = [...updatedQuestion.options];
                            updatedQuestion.options[2] = e.target.value; // Update the first option
                          }

                          console.log(updatedQuestion); // Debugging
                          return updatedQuestion; // Return the updated state
                        })
                      }
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white cursor-text bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[2] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 2)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(2)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(2)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => document.getElementById('option4').focus()}
                  className={`w-[49%] h-[100px] p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[3] ? "bg-[#26890C]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#26890C] w-fit px-1 flex items-center rounded-md">
                    <SquareIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input
                      id="option4"
                      value={selectedQuestionData?.options?.[3] ?? ""}
                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      onChange={(e) =>
                        setSelectedQuestionData((prev) => {
                          if (!prev) return prev;
                          const updatedQuestion = { ...prev };

                          if (updatedQuestion.options) {
                            updatedQuestion.options = [...updatedQuestion.options];
                            updatedQuestion.options[3] = e.target.value;
                          }
                          console.log(updatedQuestion);
                          return updatedQuestion;
                        })
                      }
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[3] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 3)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(3)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(3)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            selectedQuestionData?.type === "true/false" && (
              <div className="w-full flex flex-wrap py-5 px-3 gap-3">
                <div

                  className={`w-[49%] h-[100px] select-none p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[0] ? "bg-[#D01937]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#D01937] w-fit px-1 flex items-center rounded-md">
                    <TriangleIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input

                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      value={"True"}
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white cursor-text bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[0] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 0)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(0)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(0)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div

                  className={`w-[49%] h-[100px] p-1 flex rounded-md transition-colors duration-300  ${selectedQuestionData?.options[1] ? "bg-[#1368CE]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#1368CE] w-fit px-1 flex items-center rounded-md">
                    <DiamondIcon height={40} width={40} />
                  </div>
                  <div className="h-full flex-1">
                    <input
                      value={"False"}
                      onBlur={() =>
                        handleUpdateQuestion({ ...selectedQuestionData, question: selectedQuestionData.question })
                      }
                      type="text"
                      placeholder="Enter your answer"
                      className="w-full h-full px-2 caret-black focus:placeholder:text-white cursor-text  bg-transparent text-white  font-semibold rounded-md focus:outline-none text-xl"
                    />
                  </div>
                  <div
                    className={` h-full items-center px-1 ${selectedQuestionData?.options[1] ? "flex" : "hidden"
                      }`}
                  >
                    <div
                      onClick={() => handleSaveAnswerIndex("", 1)}
                      className={`w-[35px] ${selectedQuestionData?.answerIndex.includes(1)
                        ? "bg-green-500"
                        : "bg-transparent"
                        } group h-[35px] rounded-full   border-[3px] border-white`}
                    >
                      <div
                        className={`w-full h-full ${selectedQuestionData?.answerIndex.includes(1)
                          ? "flex"
                          : "hidden"
                          } group-hover:flex`}
                      >
                        <DoneIcon />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
        <motion.div
          animate={{ width: customizableBarIsOpen ? "310px" : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-[310px] h-full  relative"
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
                {themes.map((theme) => (
                  <div
                    key={theme._id}
                    onClick={() => handleChangeTheme(theme._id)}
                    className={`w-[110px]  border-[3px] rounded-md p-1 ${theme._id === data?.theme._id
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
      </div>
      <GalleryModel
        open={isOpenGallery}
        close={() => setIsOpenGallery(false)}
        setImage={(ImageSrc) =>
          handleChangeMedia(selectedQuestion, id, ImageSrc)
        }
      />
      {isSaveModelOpen && <SaveModel
        open={isSaveModelOpen}
        id={id}
        close={() => setIsSaveModelOpen(false)}
        errors={savingErrors}
        ReturnToHome={ReturnToHome}
      />}
    </div>
  );
};

export default React.memo(Create);

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
        className="w-full items-center !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md relative"
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
const TimeLimitDropdown = ({
  duration,
  setDuration,
}: {
  duration: number;
  setDuration: (value: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setIsOpen(false))
  const handleSetDuration = (value: number) => {
    setDuration(value);
  };
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full items-center !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md relative"
      >
        {TimeLimit.find((i) => i.value === duration)?.title}
        {isOpen && (
          <div
            style={{
              boxShadow:
                "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
            }}
            className="w-full left-0 absolute top-[110%] bg-white shadow-md z-10 p-2 rounded-md"
          >
            {TimeLimit.map((type) => (
              <div
                onClick={() => handleSetDuration(type.value)}
                key={type.id}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <p className="text-sm font-medium">{type.title}</p>
              </div>
            ))}
          </div>
        )}
      </button>

    </div>
  );
};

const QuestionOptionDropdown = ({
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
        className="w-full items-center !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md"
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
        className="!bg-blue-600 w-full !text-white !capitalize"
      >
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

interface ErrorType {
  index: number;
  message: string;
  type: string;
  question: string;
  media: string;
}
