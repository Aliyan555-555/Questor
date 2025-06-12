"use client";
import React, { useEffect, useState } from "react";
import { FaRegImage } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import ExitModel from "@/src/components/create/ExistModel"
import RightSidebar from "@/src/components/create/RightSidebar"
import AddQuestionTypesDropdown from "@/src/components/create/AddQuestionTypeDropdown"
import {
  clearCurrentDraft,
  CurrentDraft,
  setCurrentDraft,
  setThemes,
} from "@/src/redux/schema/student";
import { SettingCreatePageSVG } from "@/src/lib/svg"
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
import { GetAllThemes, addQuestionInQuiz, createInitialQuiz, deleteQuestionInQuiz, updateQuiz, getQuizById, updateQuestion, QuizUpdateData } from "@/src/redux/api";
import { SaveModel } from "@/src/components/create/SaveModel";
import Loading from "../[id]/loading";
import imageLoader from "@/src/components/ImageLoader";


const Create = () => {
  const [isExist, setIsExist] = useState(false);
  const [loading,setLoading] = useState(true);
  const [isSettingModelOpen, setIsSettingModelOpen] = useState(false);
  const [savingErrors, setSavingErrors] = useState<ErrorType[]>([])
  const [isOpenGallery, setIsOpenGallery] = useState(false);
  const themes = useSelector((root: RootState) => root.student.themes);
  const [isSaveModelOpen, setIsSaveModelOpen] = useState(false);
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
  try{
      const res = await GetAllThemes();
    if (res?.status) {
      dispatch(setThemes(res?.data));
    }
  }catch(error){
    console.log(error)
  } finally {
    setLoading(false);
  }
  };

  const fetchInitialQuiz = async () => {
    if (id && data && id !== data._id) {
      const res = await getQuizById(id, dispatch);
      console.log("🚀 ~ fetchInitialQuiz ~ res:", res)
    }
  }

  useEffect(() => {
    fetch();
    fetchInitialQuiz();
  }, []);

  const createQuiz = async () => {
    try {
      dispatch(clearCurrentDraft());
      if (!user?._id) {
        navigation.push(
          `/auth/login?redirect_url=${window.location.origin}${path}&redirect=true`
        );
        return;
      }
      if (!id) {
        dispatch(clearCurrentDraft());
      }
      if (data && data._id === id) return;

      const res = await createInitialQuiz(user.authToken, {
        name: "Untitled Quiz",
        description: "Add a description here.",
        creator: user._id,
        theme: "67d29d6e1586140c2c8f7966",


      });
      if (res?.status) {
        dispatch(setCurrentDraft(res.data));
        navigation.push(`/play/create?id=${res.data._id}`);
        setSelectedQuestion(res.data.questions?.[0]?._id || null);

      } else {
        toast.error("Failed to create quiz.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quiz.");
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    if (!id && dispatch) {
      createQuiz();
    }
  }, [id, dispatch]);
  
useEffect(() => {
    handleUpdateQuestion(selectedQuestionData);
}, [selectedQuestionData]);

useEffect(() => {
  if (selectedQuestionData?._id) {
    const u = data.questions.find(q => q._id === selectedQuestionData._id);
    setSelectedQuestionData(u);
  }
}, [data, selectedQuestionData]);
  useEffect(() => {
    if (data && data.questions?.length > 0) {
      setSelectedQuestion(data.questions[0]._id);
      // setInputValue(data.questions[0].question);
      setSelectedQuestionData(data.questions[0]);
    } else {
      setSelectedQuestion(null);
    }
  }, []);
  const handleUpdateQuestion = async (question: Question) => {
    try {
      if (!user || !selectedQuestionData) return;
      const res = await updateQuestion(user.authToken, selectedQuestionData._id, question, dispatch);
      console.log("🚀 ~ handleUpdateQuestion ~ res:", res)
    } catch (error) {
      console.log("🚀 ~ handleUpdateQuestion ~ error:", error)
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!id || !questionId || !user?.authToken) {
      toast.error("Invalid question or quiz ID");
      return;
    }
    const res = await deleteQuestionInQuiz(user.authToken, id, questionId, dispatch);
    if (res?.status) {
      const lastQuestion = res.data.questions[res.data.questions.length - 1];
      setSelectedQuestion(lastQuestion?._id || null);
      setSelectedQuestionData(lastQuestion || null);
    }
  };
  const handleUpdateQuiz = async (quizData: QuizUpdateData) => {
    if (!user?.authToken) {
      toast.error("User session expired");
      return;
    }
    const res = await updateQuiz(user.authToken, quizData, dispatch);
    if (res?.status) {
      dispatch(setCurrentDraft(res.data));
    }
  };
  const handleSetQuestion = async (value: string) => {
    if (!selectedQuestion || !user?.authToken) {
      toast.error("Please select a question to set as the main one");
      return;
    }

    setSelectedQuestionData((prev) => ({ ...prev, question: value }));
  };
  useEffect(() => {
    if (data && data.questions?.length > 0) {
      setSelectedQuestionData(
        data?.questions.filter(
          (question) => question._id === selectedQuestion
        )[0]
      );

    }

    handleUpdateQuestion(selectedQuestionData)

  }, [selectedQuestion]);
  const handleChangeMedia = (qid: string | null, quizId: string, media: string) => {
    handleUpdateQuestion({ ...selectedQuestionData, media })
  };
  const handleRemoveMedia = (qid: string, quizId: string | null, media: string) => {
    handleUpdateQuestion({ ...selectedQuestionData, media })
  };
  const handleChangeTheme = (theme: string) => {
    // socket?.emit("update_theme", { id, theme });
    handleUpdateQuiz({ ...data, theme })
  };
  const handleAddQuestion = async (type: string) => {
    if (!id || !user?.authToken) {
      toast.error("Invalid quiz or user session");
      return;
    }
    const res = await addQuestionInQuiz(user.authToken, id, type, dispatch);
    if (res?.status) {
      setSelectedQuestion(res.data.questions[res.data.questions.length - 1]._id);
      setSelectedQuestionData(res.data.questions[res.data.questions.length - 1]);
    }
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
    // socket?.emit("update_quiz_status", { status: 'active', _id: id });
  }
  const ReturnToHome = (status: 'active' | 'inactive' | 'draft') => {
    if (!data?._id) return;
    handleUpdateQuiz({ _id: data._id, status });
    navigation.push('/')
  }
  if (id !== data?._id) {
    return (
      <Loading />
    )
  };


  const saveQuiz = async () => {
    try {
      const res = await updateQuiz(user.authToken, data, dispatch);
      if (res.status) {
        toast.success("Quiz saved successfully.");
        dispatch(setCurrentDraft(res.data));
        setIsSaveModelOpen(false);
        // console.log("Some thing went wrong")
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz.");
    }
  }



if (loading){
  return (
  <Loading />
  )
}



  return (
    <div className="w-screen   bg-white  overflow-x-hidden flex flex-col">
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
            <SettingCreatePageSVG />
            Setting
          </Button>
          <Button
            onClick={() => {
              setIsThemeOpen(true);
              setCustomizableBarIsOpen(true);
            }}
            className="!bg-white !text-black  !font-semibold !px-4 !flex !gap-3 !py-2 !text-lg !text-md !rounded-[10px] !capitalize !tracking-wide"          >
            <svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12.8205 0.320513C12.8205 0.235508 12.7867 0.153984 12.7266 0.0938761C12.6665 0.0337683 12.585 0 12.5 0H3.52564C2.59058 0 1.69382 0.371451 1.03264 1.03264C0.37145 1.69382 0 2.59058 0 3.52564V21.4744C0 22.4094 0.37145 23.3062 1.03264 23.9674C1.69382 24.6286 2.59058 25 3.52564 25H16.3462C17.2812 25 18.178 24.6286 18.8392 23.9674C19.5003 23.3062 19.8718 22.4094 19.8718 21.4744V8.84231C19.8718 8.7573 19.838 8.67578 19.7779 8.61567C19.7178 8.55556 19.6363 8.5218 19.5513 8.5218H13.7821C13.527 8.5218 13.2825 8.42049 13.1021 8.24017C12.9218 8.05984 12.8205 7.81527 12.8205 7.56026V0.320513ZM11.2179 11.859C11.2179 11.3489 11.4206 10.8598 11.7812 10.4992C12.1419 10.1385 12.631 9.9359 13.141 9.9359C13.6511 9.9359 14.1402 10.1385 14.5008 10.4992C14.8615 10.8598 15.0641 11.3489 15.0641 11.859C15.0641 12.369 14.8615 12.8581 14.5008 13.2188C14.1402 13.5794 13.6511 13.7821 13.141 13.7821C12.631 13.7821 12.1419 13.5794 11.7812 13.2188C11.4206 12.8581 11.2179 12.369 11.2179 11.859ZM8.82821 13.9128C8.74177 13.7745 8.62158 13.6605 8.47895 13.5814C8.33631 13.5024 8.1759 13.4609 8.01282 13.4609C7.84974 13.4609 7.68933 13.5024 7.5467 13.5814C7.40406 13.6605 7.28387 13.7745 7.19744 13.9128L3.99231 19.041C3.90117 19.1866 3.85069 19.3539 3.84609 19.5256C3.8415 19.6973 3.88298 19.867 3.9662 20.0173C4.04943 20.1675 4.17137 20.2927 4.31935 20.3798C4.46733 20.467 4.63595 20.5129 4.80769 20.5128H15.0641C15.2427 20.5128 15.4177 20.4631 15.5696 20.3692C15.7215 20.2753 15.8443 20.141 15.9241 19.9813C16.004 19.8216 16.0378 19.6428 16.0218 19.4649C16.0057 19.2871 15.9405 19.1172 15.8333 18.9744L13.9103 16.4103C13.8207 16.2908 13.7046 16.1939 13.571 16.1272C13.4375 16.0604 13.2903 16.0256 13.141 16.0256C12.9918 16.0256 12.8445 16.0604 12.711 16.1272C12.5775 16.1939 12.4614 16.2908 12.3718 16.4103L11.2897 17.8526L8.82821 13.9128Z" fill="black" />
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
        <div className="w-[180px] max-h-[calc(100vh-100px)] flex flex-col bg-[#E9E2B6]">
          <div className="w-full  overflow-y-auto flex-1">
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
                          lazy
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

              value={selectedQuestionData?.question ?? ""}
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
                  className={`w-[49%] h-[100px] select-none flex rounded-[10px] transition-colors duration-300  ${selectedQuestionData?.options[0].length > 0 ? "bg-[#9D069C]" : "bg-white"
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

        {/* Right side bar */}
        <RightSidebar handleUpdateQuestion={handleUpdateQuestion} customizableBarIsOpen={customizableBarIsOpen} isThemeOpen={isThemeOpen} themes={themes} selectedQuestionData={selectedQuestionData} setCustomizableBarIsOpen={setCustomizableBarIsOpen}
          handleChangeTheme={handleChangeTheme} />



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

export default Create


interface ErrorType {
  index: number;
  message: string;
  type: string;
  question: string;
  media: string;
}
