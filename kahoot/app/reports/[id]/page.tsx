"use client"
import { RootState } from '@/src/redux/store';
import { Backdrop, Box, Button, CircularProgress, IconButton, Menu, MenuItem, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField } from '@mui/material';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { LiaUserSolid } from "react-icons/lia";
import { BsFillPatchQuestionFill, BsPatchQuestion } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { FaRankingStar } from "react-icons/fa6";
import { MdOutlineDone, MdOutlineModeEdit } from 'react-icons/md';
import { formatCustomDate, truncateString } from '@/src/lib/services';
import { RxCross2 } from 'react-icons/rx';
import Image from 'next/image';
import { CircleIcon, DiamondIcon, SquareIcon, TriangleIcon } from '@/src/lib/svg';
import { ReportQuestion } from '@/src/redux/schema/baseSlice';

const SingleReport = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const data = useSelector((root: RootState) => root.base.reports.find((r) => r.roomId === id));
  const [report, setReport] = useState(data);
  const [search, setSearch] = useState("");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  if (!report) return <div className='p-10'>Loading report...</div>;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownloadReport = () => { };
  const handlePrintReport = () => { };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
      <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && (
          <Box sx={{ p: 3 }}>{children}</Box>
        )}
      </div>
    );
  }
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const searchValue = e.target.value.toLowerCase().trim();

    if (!searchValue) {
      // Reset to original data if search input is empty
      setReport(data);
    } else {
      const filteredData = data?.students.filter((student) =>
        student.nickname.toLowerCase().includes(searchValue) ||
        student.score.toString().includes(searchValue)
      );
      setReport({ ...data, students: filteredData });
    }
    setSearch(e.target.value);
  };
  const handleSearchQuestions = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const searchValue = e.target.value.toLowerCase().trim();

    if (!searchValue) {
      setReport(data);
    } else {
      const filteredData = data?.questions.filter((q) =>
        q.question.toLowerCase().includes(searchValue)
      );
      setReport({ ...data, questions: filteredData });
    }
    setSearchQuestion(e.target.value);
  };


  return (
    <div className='border-t border-gray-200'>
      {/* HERO SECTION */}
      <div className="relative  overflow-hidden flex flex-wrap md:flex-nowrap bg-[#002F49] pt-[40px] px-[30px] md:pl-[50px] min-h-[200px] z-0">


        <div className="absolute top-0   right-0 h-full w-[41%] bg-[#FBA732] rounded-tl-[180px] z-[-1]">
          <div className='w-[500px] h-[150px] bg-[#FBA732]  -z-10 absolute bottom-0 left-[-300px]' />
        </div>
        <div className="absolute top-0 left-0 h-full w-[60%] bg-[#002F49] rounded-br-[180px] z-[-1]" />

        {/* Left Section */}
        <div className="relative z-10 flex-1 text-white min-w-[280px]">
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <h1 className="text-3xl font-bold">Report</h1>
            </div>
            <div className='relative flex items-center gap-2'>
              <h3 className='text-2xl sm:text-3xl font-semibold'>{report.name}</h3>
              <IconButton className='hover:!bg-black/20 !text-white absolute top-[-5px]'>
                <MdOutlineModeEdit size={25} />
              </IconButton>
            </div>
          </div>

          {/* Tabs moved here */}
          <Box
            sx={{
              width: '100%',
              // bgcolor: '#002F49',
              mt: 4,
              maxWidth: '100%',
            }}
          // className="flex items-center justify-start sm:justify-center"
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className='!text-white'
              sx={{
                "& .MuiTabs-indicator": { display: "block", background: "#FBA732" },
                "& .MuiTab-root": { color: "#FFFFFF", minWidth: 120 },
                "& .Mui-selected": { color: "#FBA732 !important" },
              }}
            >
              <Tab
                iconPosition='start'
                icon={<FaUsers size={20} />}
                label={<span className='hidden sm:block'>Students ({report.students?.length})</span>}
                sx={{ textTransform: "capitalize" }}
              />
              <Tab
                iconPosition='start'
                icon={<BsFillPatchQuestionFill size={20} />}
                label={<span className='hidden sm:block'>Questions ({report.questions?.length})</span>}
                sx={{ textTransform: "capitalize" }}
              />
            </Tabs>
          </Box>
        </div>

        {/* Right Section */}
        <div className='flex items-center justify-end relative z-10 flex-1 min-w-[300px] mt-10 md:mt-0'>
          <div className='min-w-[300px] text-white'>
            <h4 className='text-lg font-medium '>{formatCustomDate(report.endTime)}</h4>
            <div className='w-full h-[1px] bg-black !my-2' />
            <h4 className='text-lg font-medium '>Hosted By &quot;{report.hostName}&quot;</h4>
            <Button
              className='!bg-blue_1  !w-fit !h-fit !px-6 !py-2 !font-semibold !text-white !mt-4'
              aria-controls="report-options-menu"
              aria-haspopup="true"
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              Report Options
            </Button>
            <Menu
              id="report-options-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => { handleDownloadReport(); setAnchorEl(null); }}>
                Download Report
              </MenuItem>
              <MenuItem onClick={() => { handlePrintReport(); setAnchorEl(null); }}>
                Print Report
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>

      
      <TabPanel index={0} value={tabValue}>
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All ({report.students.length})</h2>
            <TextField
              size="small"
              placeholder="Search"
              value={search}
              autoFocus
              onChange={handleSearch}
              variant="outlined"
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
          </div>

          <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nickname</strong></TableCell>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Correct Answers</strong></TableCell>
                  <TableCell><strong>Unanswered</strong></TableCell>
                  <TableCell><strong>Final Score</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {report.students.map((student, index) => (
                  <TableRow onClick={() => setSelectedStudent(student)} key={index}>
                    <TableCell>{student.nickname}</TableCell>
                    <TableCell>{student.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative inline-flex">
                          {/* Background (red) */}
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={30}
                            thickness={5}
                            sx={{
                              color: 'red',
                              position: 'absolute',
                              left: 0,
                            }}
                          />

                          {/* Foreground (green) */}
                          <CircularProgress
                            variant="determinate"
                            value={student.correctAnswers} // your dynamic value
                            size={30}
                            thickness={5}
                            sx={{
                              color: 'green',
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                        </div>

                        <span>{student.correctAnswers}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.unansweredQuestions}</TableCell>
                    <TableCell>{student.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {selectedStudent && <StudentDetailModel setSelectedStudent={setSelectedStudent} questions={report.questions} student={selectedStudent} totalStudent={report.students.length} />}
      </TabPanel>

      <TabPanel index={1} value={tabValue}>
        <div className="p-4 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All ({report.questions.length})</h2>
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuestion}
              autoFocus
              onChange={handleSearchQuestions}
              variant="outlined"
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
          </div>
          <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Question</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Correct/incorrect</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.questions.map((q, index) => (
                  <TableRow onClick={() => setSelectedQuestion(q)} key={q._id || index}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <span>{index + 1}</span>
                        <strong>{truncateString(q.question, 20)}</strong>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{q.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative w-[25px] h-[25px]">
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={25}
                            thickness={5}
                            sx={{
                              color: 'red',
                              position: 'absolute',
                              left: 0,
                            }}
                          />
                          <CircularProgress
                            variant="determinate"
                            value={q.correctAnswersPercentage}
                            size={25}
                            thickness={5}
                            sx={{
                              color: 'green',
                              position: 'absolute',
                              left: 0,
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                              },
                            }}
                          />
                        </div>
                        <span>{q.correctAnswersPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>


            </Table>
          </TableContainer>
        </div>
        {selectedQuestion && <QuestionDetailsModel setSelectedQuestion={setSelectedQuestion} question={selectedQuestion} />}
      </TabPanel>
    </div>
  );
};

const StudentDetailModel = ({ student, totalStudent, questions, setSelectedStudent }) => {
  return (
    <Backdrop open={true} className='!flex !items-center !justify-center'>
      <div className='w-[85vw] overflow-hidden h-[80vh] bg-white !rounded-lg items-center'>
        <div className='w-full flex items-center border-b border-[#B2B2B2] justify-between !px-4 !py-2'>
          <div className='flex  text-blue_1 gap-2'>
            <LiaUserSolid size={25} />
            <h3 className='text-lg'>{student.nickname}</h3>
          </div>
          <IconButton onClick={() => setSelectedStudent(null)}>
            <RxCross2 fontSize={25} />
          </IconButton>
        </div>
        <div className='w-full flex flex-wrap py-5 gap-3 !px-5' >
          <div className='flex gap-5 items-center justify-center flex-1'>
            <div className="relative inline-flex w-[100px] h-[100px] items-center justify-center">
              <CircularProgress
                variant="determinate"
                value={100}
                size={100}
                thickness={5}
                sx={{
                  color: 'red',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              />
              <CircularProgress
                variant="determinate"
                value={student.correctAnswers}
                size={100} // same size
                thickness={5} // thicker
                sx={{
                  color: 'green',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
            </div>
            <div className='text-gray-800'>
              <h3 className='text-2xl font-bold'>{student.correctAnswers}%</h3>
              <p className="text-lg">Correct</p>
            </div>

          </div>
          <div className='flex-1 '>
            <div className='w-full border-b items-start justify-between p-3 text-sm font-semibold border-[#B2B2B2] flex'>
              <h4>Rank</h4><h4 className='flex items-start gap-2'><FaRankingStar size={15} className='!text-blue_1' />{student.rank} of {totalStudent}</h4>
            </div>

            <div className='w-full border-b items-center justify-between  p-3 text-sm font-semibold border-[#B2B2B2] flex'>
              <h4>Final score</h4><h4 className='flex'>{student.score}</h4>
            </div>

          </div>
          <div className='flex-1'>
            <div className='w-full border-b items-center justify-between  p-3 text-sm font-semibold border-[#B2B2B2] flex'>
              <h4>Questions answered</h4><h4 className='flex'>{student.unansweredQuestions !== "_" ? Math.abs(student.unansweredQuestions - questions.length) : questions.length} of {questions.length}</h4>
            </div>
          </div>

        </div>

        <div className='flex-1 w-full p-4'>
          <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Table >
              {/* <div */}
              <TableHead>
                <TableRow>
                  <TableCell><strong>Questions</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Answered</strong></TableCell>
                  <TableCell><strong>Correct/incorrect</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Point</strong></TableCell>
                </TableRow>
              </TableHead>
              {/* </div> */}
              <TableBody>
                {
                  student.questions.map((q, index) =>{
                    const isCorrect = q.result.status === "correct"
                    
                    return(
                    <TableRow key={index} className='!capitalize'>
                      <TableCell className='!flex !gap-4'><span>{index + 1}</span><strong>{truncateString(q.question, 20)}</strong></TableCell>
                      <TableCell>{q.type}</TableCell>
                      <TableCell>{q.result.answer}</TableCell>
                      <TableCell>  {isCorrect ? (
                          <div className='flex gap-2 items-center'>
                            <MdOutlineDone color='green' size={20} /> correct
                          </div>
                        ) : (
                          <div className='flex gap-2 items-center'>
                            <RxCross2 fontSize={20} color='red' /> incorrect
                          </div>
                        )}</TableCell>
                      <TableCell>{q.result.timeSpend}s</TableCell>
                      <TableCell>{Number(q.result.score).toFixed(0)}</TableCell>
                    </TableRow>
                  )})
                }
              </TableBody>

            </Table>

          </TableContainer>
        </div>

      </div>

    </Backdrop>

  )
}

const QuestionDetailsModel = (
  { question, setSelectedQuestion }
  :
  {
  question:ReportQuestion;
  setSelectedQuestion:(key:null) => void
}) => {
  const icons = [
    { icon: <TriangleIcon width={18} height={18} /> },
    { icon: <DiamondIcon width={18} height={18} /> },
    { icon: <CircleIcon width={18} height={18} /> },
    { icon: <SquareIcon width={18} height={18} /> },
    { icon: <div className='w-[20px] h-[20px]'></div> },
  ];
  const colors = ["#9D069C", "#FD9800", "#1B3BA0", "#046000", "#ffff"];
  return (
    <Backdrop open={true} className='!flex !items-center !justify-center'>
      <div className='w-[85vw]  overflow-x-hidden h-[85vh] bg-white !rounded-lg items-center'>
        <div className='w-full flex items-center border-b border-[#B2B2B2] justify-between !px-4 !py-2'>
          <div className='flex items-center  text-blue_1 gap-2'>
            <BsPatchQuestion size={25} />
            <h3 className='text-lg font-semibold' >{question.question}</h3>
          </div>
          <IconButton onClick={() => setSelectedQuestion(null)}>
            <RxCross2 fontSize={25} />
          </IconButton>
        </div>
        <div className='flex w-full p-4 bg-gray-100 items-center justify-center'>
          {question.media !== "" && <div className='w-[40%]'>
            <Image src={question.media} width={400} height={400} className='w-full p-[20px] text-center bg-gray-300 rounded-md h-[250px]' alt={"Image not available"} />

          </div>}
          <div className='flex-1 flex p-4 flex-col'>
            {
              question.options.map((o, index) => (
                <div key={index} className='w-full flex py-2 items-center border-b border-[#B2B2B2] justify-between'>
                  <div className='flex items-center gap-3 w-[300px] px-5'>
                    <div className={`w-fit h-fit border border-gray-400 bg-[${colors[index]}] p-1 rounded-md`}>{icons[index].icon}</div>
                    <span>{o}</span>
                  </div>
                  <div >
                    {question.answerIndex.includes(index) ? <MdOutlineDone color="green" size={25} /> : <RxCross2 fontSize={25} color={"red"} />}
                  </div>
                  <span>{question.studentAnswers.filter(a => a === o).length}</span>

                </div>
              ))
            }

          </div>


        </div>
        <div className='w-full flex-1 p-4'>

          <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Table >
              {/* <div */}
              <TableHead>
                <TableRow>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Answered</strong></TableCell>
                  <TableCell><strong>Correct/incorrect</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Point</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  question.students.map((s,index)=>{
                    const isCorrect = question.answerIndex
                    .map((i) => question.options[i])
                    .includes(s.answer);
                    return(
                    <TableRow key={index}>
                      <TableCell>{s.student.nickname}</TableCell>
                      <TableCell>{s.answer}</TableCell>
                      <TableCell>
                        {isCorrect ? (
                          <div className='flex gap-2 items-center'>
                            <MdOutlineDone color='green' size={20} /> correct
                          </div>
                        ) : (
                          <div className='flex gap-2 items-center'>
                            <RxCross2 fontSize={20} color='red' /> incorrect
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{s.timeSpend}</TableCell>
                      <TableCell>{s.score.toFixed(0)}</TableCell>
                    </TableRow>
                  )})
                }
              </TableBody>

            </Table>
          </TableContainer>


        </div>

      </div>
    </Backdrop>
  )
}

export default SingleReport;
