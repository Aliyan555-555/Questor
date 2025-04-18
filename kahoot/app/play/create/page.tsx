"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegImage } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { RootState } from "@/src/redux/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSocket } from "@/src/hooks/useSocket";
import {
  clearCurrentDraft,
  CurrentDraft,
  setCurrentDraft,
  setThemes,
  updateCurrentDraft,
  updateDraftQuestion,
  updateQuestion,
  updateQuestionMedia,
} from "@/src/redux/schema/student";
import SettingsModel from "@/src/components/create/SettingsModel";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
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
  const { socket } = useSocket();
  const [isExist, setIsExist] = useState(false);
  const [isSettingModelOpen, setIsSettingModelOpen] = useState(false);
  const [savingErrors, setSavingErrors] = useState<ErrorType[]>([])
  const [isOpenGallery, setIsOpenGallery] = useState(false);
  const themes = useSelector((root: RootState) => root.student.themes);
  const [isSaveModelOpen, setIsSaveModelOpen] = useState(false);
  // const [inputValue, setInputValue] = useState("");
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
    if (id && data?._id !== id) {
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
        theme: "67d29d6e1586140c2c8f7966",
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
        setSelectedQuestionData(quizData.question);
        dispatch(updateDraftQuestion(quizData.question));
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
      // setInputValue(data.questions[0].question);
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
    socket?.emit("update_quiz", quizData);
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
  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === "Enter") {
  //     handleSetQuestion(inputValue);
  //   }
  // };
  useEffect(() => {
    if (data && data.questions?.length > 0) {
      setSelectedQuestionData(
        data?.questions.filter(
          (question) => question._id === selectedQuestion
        )[0]
      );
      // setInputValue(data?.questions.filter((question) => question._id === selectedQuestion)[0]?.question ?? "")
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
        )
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
    <div className="w-screen bg-white  overflow-x-hidden flex flex-col">
      <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px" }}
        className="w-full py-6 px-10 bg-blue_1 gap-4 flex"
      >
        <div className="flex items-center justify-start w-1/2">
          <div className="w-[100px] "><svg width="41" height="46" viewBox="0 0 41 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37.2081 9.68726L26.0489 1.45328C23.9363 -0.117678 21.1465 -0.442704 18.7088 0.613629L6.00571 6.13906C3.5951 7.19539 1.9158 9.44349 1.61786 12.0708L0.0469053 25.8573C-0.251035 28.4846 0.886554 31.0577 2.99922 32.6286L14.1584 40.8626C16.2711 42.4336 19.0609 42.7586 21.4986 41.7023L22.3924 41.296C19.738 40.2667 17.1378 39.0479 14.7543 37.6665C7.57666 34.8496 2.56585 28.6471 3.56801 19.438C4.62435 9.84977 10.5561 2.42835 22.6362 3.75554C30.0847 4.56811 37.5061 11.2311 36.3143 22.0653C35.3663 30.7056 30.6535 34.0913 26.1844 35.1205C27.3761 35.7164 29.8138 36.4477 32.3057 36.9894L34.2017 36.1768C36.6123 35.1205 38.2916 32.8724 38.5895 30.2451L40.1605 16.4586C40.4584 13.8313 39.3208 11.2582 37.2081 9.68726Z" fill="#F8F4FB" />
            <path d="M20.659 11.0957C15.8378 10.554 13.2917 14.4814 12.7229 19.4922C11.8833 27.0761 14.5647 30.7597 19.4401 31.3014C22.8258 31.6806 26.4011 28.6471 27.1324 22.0111C27.972 14.2918 25.426 11.6374 20.659 11.0957Z" fill="#F8F4FB" />
            <path d="M32.7932 38.7771C32.6036 38.8312 32.414 38.8854 32.1973 38.9667C31.141 39.3459 30.0847 39.725 29.0283 40.1042C27.7553 40.5647 26.4823 41.0251 25.2093 41.4585C24.7759 41.5939 24.7488 42.1898 25.1551 42.4065C28.1887 43.8962 31.3577 45.088 34.5538 45.7922C36.2872 46.1714 37.9665 45.0609 38.427 42.894L38.5895 42.1627C38.8062 41.1877 38.3186 40.2668 37.479 39.7521C36.9914 39.4542 36.4226 39.3459 35.908 39.1563C35.2309 38.9396 34.5538 38.7229 33.8495 38.6958C33.4703 38.6958 33.1453 38.6958 32.8203 38.8041L32.7932 38.7771Z" fill="#F8F4FB" />
          </svg>
          </div>
          <SettingsModel isOpen={isSettingModelOpen} setIsOpen={setIsSettingModelOpen} handleSaveSettings={handleSaveSettings} data={data} />
        </div>

        <div className="flex flex-1 items-center justify-center gap-4">

          <Button
            onClick={() => {
              setIsSettingModelOpen(true);
            }}
            className="!bg-white !text-black  !font-semibold !px-4 !flex !gap-3 !py-2 !text-lg !text-md !rounded-[10px] !capitalize !tracking-wide"
          >
            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.4312 25C9.86875 25 9.38458 24.8125 8.97875 24.4375C8.57292 24.0625 8.32792 23.6042 8.24375 23.0625L7.9625 21C7.69167 20.8958 7.43667 20.7708 7.1975 20.625C6.95833 20.4792 6.72375 20.3229 6.49375 20.1562L4.55625 20.9688C4.03542 21.1979 3.51458 21.2188 2.99375 21.0312C2.47292 20.8438 2.06667 20.5104 1.775 20.0312L0.30625 17.4688C0.0145832 16.9896 -0.0687499 16.4792 0.0562501 15.9375C0.18125 15.3958 0.4625 14.9479 0.9 14.5938L2.55625 13.3438C2.53542 13.1979 2.525 13.0571 2.525 12.9212V12.0775C2.525 11.9425 2.53542 11.8021 2.55625 11.6562L0.9 10.4062C0.4625 10.0521 0.18125 9.60417 0.0562501 9.0625C-0.0687499 8.52083 0.0145832 8.01042 0.30625 7.53125L1.775 4.96875C2.06667 4.48958 2.47292 4.15625 2.99375 3.96875C3.51458 3.78125 4.03542 3.80208 4.55625 4.03125L6.49375 4.84375C6.72292 4.67708 6.9625 4.52083 7.2125 4.375C7.4625 4.22917 7.7125 4.10417 7.9625 4L8.24375 1.9375C8.32708 1.39583 8.57208 0.9375 8.97875 0.5625C9.38542 0.1875 9.86958 0 10.4312 0H13.3687C13.9312 0 14.4158 0.1875 14.8225 0.5625C15.2292 0.9375 15.4737 1.39583 15.5562 1.9375L15.8375 4C16.1083 4.10417 16.3637 4.22917 16.6037 4.375C16.8437 4.52083 17.0779 4.67708 17.3062 4.84375L19.2437 4.03125C19.7646 3.80208 20.2854 3.78125 20.8063 3.96875C21.3271 4.15625 21.7333 4.48958 22.025 4.96875L23.4937 7.53125C23.7854 8.01042 23.8688 8.52083 23.7438 9.0625C23.6188 9.60417 23.3375 10.0521 22.9 10.4062L21.2438 11.6562C21.2646 11.8021 21.275 11.9429 21.275 12.0788V12.9212C21.275 13.0571 21.2542 13.1979 21.2125 13.3438L22.8687 14.5938C23.3062 14.9479 23.5875 15.3958 23.7125 15.9375C23.8375 16.4792 23.7542 16.9896 23.4625 17.4688L21.9625 20.0312C21.6708 20.5104 21.2646 20.8438 20.7438 21.0312C20.2229 21.2188 19.7021 21.1979 19.1812 20.9688L17.3062 20.1562C17.0771 20.3229 16.8375 20.4792 16.5875 20.625C16.3375 20.7708 16.0875 20.8958 15.8375 21L15.5562 23.0625C15.4729 23.6042 15.2283 24.0625 14.8225 24.4375C14.4167 24.8125 13.9321 25 13.3687 25H10.4312ZM11.9625 16.875C13.1708 16.875 14.2021 16.4479 15.0562 15.5938C15.9104 14.7396 16.3375 13.7083 16.3375 12.5C16.3375 11.2917 15.9104 10.2604 15.0562 9.40625C14.2021 8.55208 13.1708 8.125 11.9625 8.125C10.7333 8.125 9.69667 8.55208 8.8525 9.40625C8.00833 10.2604 7.58667 11.2917 7.5875 12.5C7.58833 13.7083 8.01042 14.7396 8.85375 15.5938C9.69708 16.4479 10.7333 16.875 11.9625 16.875Z" fill="black" />
            </svg>
            Setting
          </Button>
          <Button
            onClick={() => {
              setIsThemeOpen(true);
              setCustomizableBarIsOpen(true);
            }}
            className="!bg-white !text-black  !font-semibold !px-4 !flex !gap-3 !py-2 !text-lg !text-md !rounded-[10px] !capitalize !tracking-wide"          >
            <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.8205 0.320513C12.8205 0.235508 12.7867 0.153984 12.7266 0.0938761C12.6665 0.0337683 12.585 0 12.5 0H3.52564C2.59058 0 1.69382 0.371451 1.03264 1.03264C0.37145 1.69382 0 2.59058 0 3.52564V21.4744C0 22.4094 0.37145 23.3062 1.03264 23.9674C1.69382 24.6286 2.59058 25 3.52564 25H16.3462C17.2812 25 18.178 24.6286 18.8392 23.9674C19.5003 23.3062 19.8718 22.4094 19.8718 21.4744V8.84231C19.8718 8.7573 19.838 8.67578 19.7779 8.61567C19.7178 8.55556 19.6363 8.5218 19.5513 8.5218H13.7821C13.527 8.5218 13.2825 8.42049 13.1021 8.24017C12.9218 8.05984 12.8205 7.81527 12.8205 7.56026V0.320513ZM11.2179 11.859C11.2179 11.3489 11.4206 10.8598 11.7812 10.4992C12.1419 10.1385 12.631 9.9359 13.141 9.9359C13.6511 9.9359 14.1402 10.1385 14.5008 10.4992C14.8615 10.8598 15.0641 11.3489 15.0641 11.859C15.0641 12.369 14.8615 12.8581 14.5008 13.2188C14.1402 13.5794 13.6511 13.7821 13.141 13.7821C12.631 13.7821 12.1419 13.5794 11.7812 13.2188C11.4206 12.8581 11.2179 12.369 11.2179 11.859ZM8.82821 13.9128C8.74177 13.7745 8.62158 13.6605 8.47895 13.5814C8.33631 13.5024 8.1759 13.4609 8.01282 13.4609C7.84974 13.4609 7.68933 13.5024 7.5467 13.5814C7.40406 13.6605 7.28387 13.7745 7.19744 13.9128L3.99231 19.041C3.90117 19.1866 3.85069 19.3539 3.84609 19.5256C3.8415 19.6973 3.88298 19.867 3.9662 20.0173C4.04943 20.1675 4.17137 20.2927 4.31935 20.3798C4.46733 20.467 4.63595 20.5129 4.80769 20.5128H15.0641C15.2427 20.5128 15.4177 20.4631 15.5696 20.3692C15.7215 20.2753 15.8443 20.141 15.9241 19.9813C16.004 19.8216 16.0378 19.6428 16.0218 19.4649C16.0057 19.2871 15.9405 19.1172 15.8333 18.9744L13.9103 16.4103C13.8207 16.2908 13.7046 16.1939 13.571 16.1272C13.4375 16.0604 13.2903 16.0256 13.141 16.0256C12.9918 16.0256 12.8445 16.0604 12.711 16.1272C12.5775 16.1939 12.4614 16.2908 12.3718 16.4103L11.2897 17.8526L8.82821 13.9128Z" fill="black" />
              <path d="M14.7437 0.735735C14.7437 0.499838 14.9911 0.349838 15.1744 0.497274C15.33 0.622915 15.468 0.769069 15.5885 0.935736L19.4513 6.3165C19.5385 6.43958 19.4437 6.59856 19.2924 6.59856H15.0642C14.9792 6.59856 14.8976 6.56479 14.8375 6.50468C14.7774 6.44457 14.7437 6.36305 14.7437 6.27804V0.735735Z" fill="black" />
            </svg>

            Theme
          </Button>

          <Button onClick={() => { setIsSaveModelOpen(true); handleChangeQuizStatus() }} className="!bg-[#50C3ED] !text-black  !font-semibold !px-4 !flex !gap-3 !py-2 !text-lg !text-md !rounded-[10px] !capitalize !tracking-wide">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.77778 25C2.01389 25 1.36019 24.7282 0.816667 24.1847C0.273148 23.6412 0.000925926 22.987 0 22.2222V2.77778C0 2.01389 0.272222 1.36019 0.816667 0.816667C1.36111 0.273148 2.01481 0.000925926 2.77778 0H18.2986C18.669 0 19.0222 0.0694446 19.3583 0.208333C19.6944 0.347222 19.9894 0.543981 20.2431 0.798611L24.2014 4.75694C24.456 5.01157 24.6528 5.30694 24.7917 5.64305C24.9306 5.97917 25 6.33194 25 6.70139V22.2222C25 22.9861 24.7282 23.6403 24.1847 24.1847C23.6412 24.7292 22.987 25.0009 22.2222 25H2.77778ZM12.5 20.8333C13.6574 20.8333 14.6412 20.4282 15.4514 19.6181C16.2616 18.8079 16.6667 17.8241 16.6667 16.6667C16.6667 15.5093 16.2616 14.5255 15.4514 13.7153C14.6412 12.9051 13.6574 12.5 12.5 12.5C11.3426 12.5 10.3588 12.9051 9.54861 13.7153C8.73843 14.5255 8.33333 15.5093 8.33333 16.6667C8.33333 17.8241 8.73843 18.8079 9.54861 19.6181C10.3588 20.4282 11.3426 20.8333 12.5 20.8333ZM5.55556 9.72222H15.2778C15.6713 9.72222 16.0014 9.58889 16.2681 9.32222C16.5347 9.05555 16.6676 8.72592 16.6667 8.33333V5.55555C16.6667 5.16204 16.5333 4.83241 16.2667 4.56667C16 4.30093 15.6704 4.16759 15.2778 4.16667H5.55556C5.16204 4.16667 4.83241 4.3 4.56667 4.56667C4.30093 4.83333 4.16759 5.16296 4.16667 5.55555V8.33333C4.16667 8.72685 4.3 9.05694 4.56667 9.32361C4.83333 9.59028 5.16296 9.72315 5.55556 9.72222Z" fill="black" />
            </svg>

            Save
          </Button>
          <Button onClick={() => setIsExist(true)} className="!bg-[#D62829] !text-white  !font-semibold !px-4 !flex !gap-3 !py-2 !text-lg !text-md !rounded-[10px] !capitalize !tracking-wide">
            <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 20C1.8125 20 1.22417 19.7554 0.735 19.2662C0.245833 18.7771 0.000833333 18.1883 0 17.5V10C0 9.64583 0.12 9.34917 0.36 9.11C0.6 8.87083 0.896667 8.75083 1.25 8.75H8.75C9.4375 8.75 10.0262 8.50542 10.5162 8.01625C11.0062 7.52708 11.2508 6.93833 11.25 6.25V1.25C11.25 0.895833 11.37 0.599167 11.61 0.36C11.85 0.120833 12.1467 0.000833333 12.5 0H22.5C23.1875 0 23.7762 0.245 24.2662 0.735C24.7562 1.225 25.0008 1.81333 25 2.5V17.5C25 18.1875 24.7554 18.7762 24.2662 19.2662C23.7771 19.7562 23.1883 20.0008 22.5 20H2.5ZM13.75 7.5C13.3958 7.5 13.0992 7.62 12.86 7.86C12.6208 8.1 12.5008 8.39667 12.5 8.75V13.75C12.5 14.1042 12.62 14.4012 12.86 14.6412C13.1 14.8812 13.3967 15.0008 13.75 15C14.1033 14.9992 14.4004 14.8792 14.6412 14.64C14.8821 14.4008 15.0017 14.1042 15 13.75V11.7812L17.9687 14.75C18.2187 15 18.5104 15.125 18.8438 15.125C19.1771 15.125 19.4687 15 19.7187 14.75C19.9687 14.5 20.0937 14.2033 20.0937 13.86C20.0937 13.5167 19.9687 13.2196 19.7187 12.9687L16.75 10H18.75C19.1042 10 19.4012 9.88 19.6412 9.64C19.8812 9.4 20.0008 9.10333 20 8.75C19.9992 8.39667 19.8792 8.1 19.64 7.86C19.4008 7.62 19.1042 7.5 18.75 7.5H13.75ZM1.25 6.25C0.895833 6.25 0.599167 6.13 0.36 5.89C0.120833 5.65 0.000833333 5.35333 0 5V1.25C0 0.895833 0.12 0.599167 0.36 0.36C0.6 0.120833 0.896667 0.000833333 1.25 0H7.5C7.85417 0 8.15125 0.12 8.39125 0.36C8.63125 0.6 8.75083 0.896667 8.75 1.25V5C8.75 5.35417 8.63 5.65125 8.39 5.89125C8.15 6.13125 7.85333 6.25083 7.5 6.25H1.25Z" fill="#F8F4FB" />
            </svg>

            Exit
          </Button>
        </div>
      </div>
      <div className="w-full flex-1 flex">
        <div className="w-[180px] bg-[#E9E2B6]">
          <div className="w-full  overflow-y-auto h-[80vh]">
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
                      selectedQuestion === q._id ? "#FBA73259" : "transparent",
                  }}
                  className="w-full  select-none group h-[150px] py-2 flex cursor-grab flex-col"
                >
                  <div className="w-full flex text-xs font-bold gap-1 px-6">
                    <p>{i + 1}</p>
                    <p className="capitalize">{q.type}</p>
                  </div>
                  <div className="flex w-full flex-1">
                    <div className="h-full w-[22px] gap-1 text-gray-500 opacity-0 group-hover:opacity-100 flex py-1 flex-col items-center justify-end">
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
          className="flex-1 bg-cover bg-center bg-no-repeat py-10 overflow-y-scroll h-screen pb-20 scroll"
        >

          <div className="w-full flex items-center justify-center">
            <div className="w-[97%] flex flex-col gap-3 items-center justify-center h-[300px] bg-[#eeeeeee0] rounded-md">
              {data ? (
                selectedQuestionData?.media === "" ? (
                  <React.Fragment>
                    <IconButton
                      onClick={() => setIsOpenGallery(true)}
                      className=""
                    >
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 0C13.4297 0 0 13.4297 0 30C0 46.5703 13.4297 60 30 60C46.5703 60 60 46.5703 60 30C60 13.4297 46.5703 0 30 0ZM47.4961 32.4961C47.4961 33.8789 46.3828 34.9922 45 34.9922H35.0039V45C35.0039 46.3828 33.8906 47.4961 32.5078 47.4961H27.5039C26.1211 47.4961 25.0078 46.3711 25.0078 45V35.0039H15C13.6172 35.0039 12.5039 33.8789 12.5039 32.5078V27.5039C12.5039 26.1211 13.6172 25.0078 15 25.0078H24.9961V15C24.9961 13.6172 26.1094 12.5039 27.4922 12.5039H32.4961C33.8789 12.5039 34.9922 13.6289 34.9922 15V24.9961H45C46.3828 24.9961 47.4961 26.1211 47.4961 27.4922V32.4961Z" fill="#0C0211" />
                      </svg>

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
          <div className="w-full flex items-center justify-center py-3">
            <input
              // onBlur={() => handleSetQuestion(inputValue)}

              value={selectedQuestionData?.question ??""}
              onChange={(e) => { handleSetQuestion(e.target.value) }}
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
              }}
              type="text"
              placeholder="Type your question here"
              className="w-[97%] text-black placeholder:font-normal h-[70px] placeholder:text-lg placeholder:text-center focus:outline-none  bg-white  text-center rounded-[10px] text-xl placeholder:text-black active:placeholder:hidden"
            />
          </div>

          {
            selectedQuestionData?.type === 'quiz' && (
              <div className="w-full flex flex-wrap py-5 px-3 gap-3">
                <div
                  onClick={() => document.getElementById('option1').focus()}
                  className={`w-[49%] h-[100px] select-none flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[0] ? "bg-[#9D069C]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#9D069C] w-fit px-4 flex items-center rounded-[10px]">
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
                  className={`w-[49%] h-[100px] flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[1] ? "bg-[#FD9800]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#FD9800] w-fit px-4 flex items-center rounded-[10px]">
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
                  className={`w-[49%] h-[100px]  flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[2] ? "bg-[#1B3BA0]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#1B3BA0] w-fit px-4 flex items-center rounded-[10px]">
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
                  className={`w-[49%] h-[100px]  flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[3] ? "bg-[#046000]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#046000] w-fit px-4 flex items-center rounded-[10px]">
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

                  className={`w-[49%] h-[100px] select-none  flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[0] ? "bg-[#9D069C]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#9D069C] w-fit px-4 flex items-center rounded-[10px]">
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

                  className={`w-[49%] h-[100px]  flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[1] ? "bg-[#FD9800]" : "bg-white"
                    }`}
                >
                  <div className="h-full bg-[#FD9800] w-fit px-4 flex items-center rounded-[10px]">
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
          className="w-[310px] h-screen  bg-[#E9E2B6] relative"
        >
          <motion.button
            animate={{ left: customizableBarIsOpen ? "-40px" : "-50px" }}
            onClick={() => setCustomizableBarIsOpen((p) => !p)}
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
      {
        <ExitModel open={isExist} handleClose={() => setIsExist(false)} />
      }
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
        className="w-full items-center bg-white !capitalize gap-3 font-semibold justify-start flex border p-2 border-gray-400 rounded-md relative"
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

const ExitModel = ({ open, handleClose }) => {
  const navigation = useRouter()
  const handleExit = () => {
    navigation.push("/")
  }
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="!font-bold">Confirm Exist</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to exit? Any unsaved changes will be lost.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} className="!bg-[#002F49] !px-4 !text-white" >
          Cancel
        </Button>
        <Button
          onClick={handleExit}
          className="!bg-red_1"
          variant="contained"
        >
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ErrorType {
  index: number;
  message: string;
  type: string;
  question: string;
  media: string;
}
