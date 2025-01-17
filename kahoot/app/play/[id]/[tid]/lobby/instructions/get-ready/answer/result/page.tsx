"use client";
import { useSocket } from "@/src/hooks/useSocket";
import { KahootIcon } from "@/src/lib/svg";
import { RootState } from "@/src/redux/store";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const Results = () => {
  const socket = useSocket();
  const params = useParams();
  const quizId = params.id;
  const teacherId = params.tid;
  const navigation = useRouter();
  const student = useSelector((root: RootState) => root.student.currentGame);
  const query = useSearchParams();
  const decoded = JSON.parse(query.get("r") ?? "");
  // const action = query.get("action");
  // const isAction = action === 'timeUp'?true:false;
  console.log({ ...decoded });

  useEffect(() => {
    socket?.on("next_question_redirection", () => {
      navigation.push(
        `/play/${quizId}/${teacherId}/lobby/instructions/get-ready`
      );
    });
    socket?.on("ranking_redirection_student_process", () => {
      navigation.push(
        `/play/${quizId}/${teacherId}/lobby/instructions/get-ready/ranking`
      );
    });


    // socket?.emit("checkUserInRoom", {
    //   roomId: student?.roomId,
    //   studentData: student,
    // });

    // const handleUserInRoom = (status: boolean) => {
    //   if (!status) {
    //     navigation.push(`/play/connect/to/game`);
    //   }
    // };

    // socket?.on("userInRoom", handleUserInRoom);
    return () =>{
      socket?.off("userInRoom");
      socket?.off("next_question_redirection");
      socket?.off("ranking_redirection_student_process");
    }
  }, []);
  console.log(student);
  return (
    <div className="w-screen h-screen flex flex-col relative">
      <div className="w-full flex px-[10px] relative justify-center p-3">
        <div className="bg-white absolute flex items-center left-3 justify-center rounded-full w-[40px] h-[40px] text-xl">
          <p>1</p>
        </div>
        <div className="bg-white  rounded-[50px] w-[120px] flex items-center px-2 h-[40px] text-xl">
          <KahootIcon w={30} h={30} />
          <p className="text-lg font-bold ml-3">Quiz</p>
        </div>
      </div>
      <div className="flex items-center gap-4 justify-center h-[90%] w-full flex-col ">
        <h2 className="text-4xl text-white drop-shadow-xl [text-shadow:_0_2px_4px_rgb(99_102_241_/_0.8)] font-bold capitalize">
          {decoded.resultStatus}
        </h2>
        {decoded.resultStatus === "Time's up" ? (
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            <g fill="none" fillRule="evenodd">
              <g>
                <g>
                  <g>
                    <g transform="translate(-257 -1827) translate(90 1581) translate(47 190) translate(120 56)">
                      <circle
                        cx="40"
                        cy="40"
                        r="37.895"
                        fill="#F35"
                        stroke="#FFF"
                        strokeWidth="4.211"
                      ></circle>
                      <g
                        fill="#FFF"
                        fillRule="nonzero"
                        stroke="#000"
                        strokeOpacity="0.15"
                        strokeWidth="2.105"
                      >
                        <path
                          d="M39.99 12.621v14.736l14.736.001V39.99H39.99v14.736H27.359V39.99H12.62V27.359h14.736l.001-14.737H39.99z"
                          transform="translate(6.316 6.316) rotate(-135 33.674 33.674)"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        ) : decoded.resultStatus === "correct" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            aria-hidden="true"
          >
            <g fill="none" fillRule="evenodd">
              <g>
                <g>
                  <g>
                    <g transform="translate(-703 -1807) translate(536 1581) translate(46 170) translate(121 56)">
                      <circle
                        cx="40"
                        cy="40"
                        r="37.895"
                        fill="#66BF39"
                        stroke="#FFF"
                        strokeWidth="4.211"
                      ></circle>
                      <g
                        fill="#FFF"
                        fillRule="nonzero"
                        stroke="#000"
                        strokeOpacity="0.15"
                        strokeWidth="2.105"
                      >
                        <path
                          d="M46.244 15.355l8.127 7.393-25.623 28.184-15.526-14.483 7.743-7.747 7.333 6.396 17.946-19.743z"
                          transform="translate(6.316 6.316) rotate(-3 33.81 33.138)"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 80 80"
          >
            <g fill="none" fillRule="evenodd">
              <g>
                <g>
                  <g>
                    <g transform="translate(-257 -1827) translate(90 1581) translate(47 190) translate(120 56)">
                      <circle
                        cx="40"
                        cy="40"
                        r="37.895"
                        fill="#F35"
                        stroke="#FFF"
                        strokeWidth="4.211"
                      ></circle>
                      <g
                        fill="#FFF"
                        fillRule="nonzero"
                        stroke="#000"
                        strokeOpacity="0.15"
                        strokeWidth="2.105"
                      >
                        <path
                          d="M39.99 12.621v14.736l14.736.001V39.99H39.99v14.736H27.359V39.99H12.62V27.359h14.736l.001-14.737H39.99z"
                          transform="translate(6.316 6.316) rotate(-135 33.674 33.674)"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        )}
        {decoded.resultStatus && (
          <div className="text-2xl font-bold text-white flex gap-3 items-center">
            <p>Answer Streak</p>
            <div className="w-[24px] h-[24px] flex items-center justify-center relative">
              <span className="text-lg z-10 relative font-bold  text-white">
                {decoded.studentRank}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="absolute top-0 left-0 z-0"
              >
                <defs>
                  <rect
                    id="uc9z5a1yra"
                    width="22"
                    height="22"
                    x="0.25"
                    y="0.25"
                    rx="11"
                  ></rect>
                  <rect
                    id="xy2mom4qvc"
                    width="22"
                    height="22"
                    x="0.25"
                    y="0.25"
                    rx="11"
                  ></rect>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g>
                    <g>
                      <g>
                        <g>
                          <g>
                            <g
                              fillRule="nonzero"
                              transform="translate(-797 -1903) translate(536 1581) translate(46 170) translate(83 152) translate(132)"
                            >
                              <rect
                                width="24"
                                height="24"
                                fill="#FFF"
                                rx="12"
                              ></rect>
                              <rect
                                width="22"
                                height="22"
                                x="1"
                                y="1"
                                fill="#EB670F"
                                rx="11"
                              ></rect>
                            </g>
                            <g transform="translate(-797 -1903) translate(536 1581) translate(46 170) translate(83 152) translate(132) translate(.75 .75)">
                              <mask id="mh0j3asj7b" fill="#fff">
                                <use xlinkHref="#uc9z5a1yra"></use>
                              </mask>
                              <path
                                fill="#F5A23D"
                                fillRule="nonzero"
                                d="M11.055 4.5s14.881 16.381 1.077 18.375c-13.511 0-4.014-13.608-4.014-13.608s1.077 4.42 1.664 4.42c1.567-.52 1.273-9.187 1.273-9.187z"
                                mask="url(#mh0j3asj7b)"
                              ></path>
                            </g>
                            <g transform="translate(-797 -1903) translate(536 1581) translate(46 170) translate(83 152) translate(132) translate(.75 .75)">
                              <mask id="ugjy7fw7sd" fill="#fff">
                                <use xlinkHref="#xy2mom4qvc"></use>
                              </mask>
                              <path
                                fill="#EB670F"
                                fillRule="nonzero"
                                d="M11.23 13.313s8.079 8.19.585 9.187c-7.335 0-2.18-6.804-2.18-6.804s.585 2.21.904 2.21c.85-.26.69-4.593.69-4.593z"
                                mask="url(#ugjy7fw7sd)"
                              ></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        )}
        <div className="w-[300px] p-3 flex items-start justify-center text-2xl font-semibold text-white bg-[#000000be] rounded-lg">
          {decoded.resultStatus === "correct" ? (
            <p>+ {decoded.studentTakenMarks}</p>
          ) : (
            <p>wrong answer</p>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between px-4 text-xl font-bold h-[60px] bg-slate-50 absolute bottom-0">
        <p>{student?.student.nickname}</p>
        <p className="bg-black text-white px-8 py-2 rounded-lg">
          {student?.student.score.toFixed(0)}
        </p>
      </div>
    </div>
  );
};

export default Results
