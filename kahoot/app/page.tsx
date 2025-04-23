"use client"
import { RootState } from '@/src/redux/store';
import { IconButton, Tabs, Tab, Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddToFavorites, DeleteQuizById, getAllPublicQuizzes, getAllQuizzesByUserId } from '@/src/redux/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import imageLoader from '@/src/components/ImageLoader';
import ProfileAvatar from '@/src/components/ProfileAvatar';
import { PiSignInBold } from "react-icons/pi";
import ClientComponentSEO from '@/src/components/ClientComponentSEO';
import { IoMdPersonAdd } from "react-icons/io";
import { MdOutlineDelete } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { deleteQuiz } from '@/src/redux/schema/baseSlice';

interface QuizType {
  _id: string;
  name: string;
  description: string;
  creator: string;
  coverImage: string;
  status: string;
}

const Home = () => {
  const user = useSelector((root: RootState) => root.student);
  const dispatch = useDispatch();
  const publishQuizzes = useSelector((root: RootState) => root.base.userPublishedQuizzes);
  const draftQuizzes = useSelector((root: RootState) => root.base.userDraftQuizzes);
  const activeQuizzes = useSelector((root: RootState) => root.base.activeQuizzes);
  const publicQuizzes = useSelector((root: RootState) => root.base.publicQuizzes);
  const favoritesQuizzes = useSelector((root: RootState) => root.student.isAuthenticated ? root.student.user.favorites : []);
  const [currentTabIndex, setCurrentTabIndex] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const navigation = useRouter();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const fetchQuizzes = async () => {
    const userId = user?.user?._id ?? "";
    await getAllQuizzesByUserId(userId, dispatch);
    await getAllPublicQuizzes(dispatch);

  };
  useEffect(() => {
    if (user.isAuthenticated && user.user) {
      fetchQuizzes();
    }
  }, []);
  const handleRedirectToEdit = (id: string) => {
    navigation.push(`/play/create?id=${id}`);
  };

  // useEffect(() => {
  //   if (user.isAuthenticated) {
  //     const timer = setTimeout(() => {
  //       getActiveQuizzesByTeacherId(user.user._id, dispatch);
  //     }, 1000);

  //     return () => clearTimeout(timer); // Cleanup the timer on component unmount
  //   }
  // });


  return (
    <div className='w-full min-h-screen '>
      <ClientComponentSEO title={"Questor"} />
      <div className='w-full flex justify-between py-5 md:py-7 px-3 md:px-10 bg-white'>
        <Link href={'/'} className='flex gap-2 md:gap-4 items-center'>
          <Image src={'/images/UI/QuestorIcon.svg'} alt='Questor' width={35} height={35} />
          <h2 className=' hidden sm:flex text-2xl font-bold'>Dashboard</h2>
        </Link>
        <div className='flex gap-2 md:gap-3 items-center'>
          {user.isAuthenticated ? (
            <>
              <Link href={'/play/create'}>
                <Button variant='contained' className='!capitalize !px-3 md:!px-4 !py-1 md:!py-2 !flex !gap-1 md:!gap-2 !bg-yalow_1 !text-black !text-base md:!text-lg !font-semibold' color='primary'>
                  <svg className='w-[20px] h-[20px] md:w-[25px] md:h-[25px]' viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 0C5.5957 0 0 5.5957 0 12.5C0 19.4043 5.5957 25 12.5 25C19.4043 25 25 19.4043 25 12.5C25 5.5957 19.4043 0 12.5 0ZM19.79 13.54C19.79 14.1162 19.3262 14.5801 18.75 14.5801H14.585V18.75C14.585 19.3262 14.1211 19.79 13.5449 19.79H11.46C10.8838 19.79 10.4199 19.3213 10.4199 18.75V14.585H6.25C5.67383 14.585 5.20996 14.1162 5.20996 13.5449V11.46C5.20996 10.8838 5.67383 10.4199 6.25 10.4199H10.415V6.25C10.415 5.67383 10.8789 5.20996 11.4551 5.20996H13.54C14.1162 5.20996 14.5801 5.67871 14.5801 6.25V10.415H18.75C19.3262 10.415 19.79 10.8838 19.79 11.4551V13.54Z" fill="black" />
                  </svg>
                  Create</Button>
              </Link>
              <Link href={'/play/connect/to/game'}>
                <Button className='!capitalize !px-3 md:!px-4 !py-1 md:!py-2 !flex !gap-1 md:!gap-2 !bg-red_1 !text-white !text-base md:!text-lg !font-semibold' variant='contained' color='secondary'  >
                  <svg className='w-[20px] h-[20px] md:w-[25px] md:h-[25px]' viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7188 0.78125C5.24687 0.78125 0 6.02812 0 12.5C0 18.9719 5.24687 24.2188 11.7188 24.2188C18.1906 24.2188 23.4375 18.9719 23.4375 12.5C23.4375 6.02812 18.1906 0.78125 11.7188 0.78125ZM11.7188 19.1406L5.46875 13.1621H9.70977V5.85938H13.7273V13.1621H17.9688L11.7188 19.1406Z" fill="#F8F4FB" />
                  </svg>

                  Join</Button>
              </Link>
              <ProfileAvatar user={user.user} />
            </>
          ) : (
            <>
              <Link href={'/play/connect/to/game'}>
                <Button className='!capitalize !px-3 md:!px-4 !py-1 md:!py-2 !flex !gap-1 md:!gap-2 !bg-red_1 !text-white !text-base md:!text-lg !font-semibold' variant='contained' color='secondary'  >
                  <svg className='w-[20px] h-[20px] md:w-[25px] md:h-[25px]' viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7188 0.78125C5.24687 0.78125 0 6.02812 0 12.5C0 18.9719 5.24687 24.2188 11.7188 24.2188C18.1906 24.2188 23.4375 18.9719 23.4375 12.5C23.4375 6.02812 18.1906 0.78125 11.7188 0.78125ZM11.7188 19.1406L5.46875 13.1621H9.70977V5.85938H13.7273V13.1621H17.9688L11.7188 19.1406Z" fill="#F8F4FB" />
                  </svg>

                  Join</Button>
              </Link>
              <Link href={'/auth/login'}>
                <Button variant='contained' color='primary' className='!capitalize !px-3 md:!px-4 !py-1 md:!py-2 !flex !gap-1 md:!gap-2 !bg-[#002F49] !text-white !text-base md:!text-lg !font-semibold' ><PiSignInBold fontSize={20} />Login</Button>
              </Link>
              <Link href={'/auth/signup'}>
                <Button variant='contained' color='primary' className='!capitalize !px-3 md:!px-4 !py-1 md:!py-2 !flex !gap-1 md:!gap-2 !bg-[#FBA732] !text-black !text-base md:!text-lg !font-semibold ' ><IoMdPersonAdd fontSize={20} />Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className='w-full flex  items-center justify-center'>
        <Box sx={{ width: '95%', bgcolor: '#002F49', borderRadius: '100px' }}
          className="!px-1 md:!px-3 max-sm:!flex max-sm:!items-center !justify-center"
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            className='!text-white '
            sx={{
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": { color: "#FFFFFF" },
              "& .Mui-selected": { color: "#FBA732 !important" },
            }}
          >
            <Tab
              onClick={() => setCurrentTabIndex(1)}
              iconPosition='start'
              className='!text-nowrap '
              icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 2.99993C5.00065 2.56341 5.09655 2.1323 5.28101 1.73667C5.46547 1.34104 5.73405 0.990437 6.06799 0.70932C6.40194 0.428204 6.79321 0.22335 7.2145 0.109055C7.63578 -0.00523893 8.07694 -0.0262202 8.50717 0.0475762C8.9374 0.121372 9.34635 0.288168 9.70546 0.536323C10.0646 0.784477 10.3652 1.10801 10.5864 1.48435C10.8076 1.86068 10.944 2.28075 10.986 2.71523C11.0281 3.14971 10.9749 3.58815 10.83 3.99993H15C15.2652 3.99993 15.5196 4.10528 15.7071 4.29282C15.8946 4.48035 16 4.73471 16 4.99993V9.16993C16.4524 9.01052 16.9364 8.96192 17.4115 9.02821C17.8866 9.09449 18.3388 9.27372 18.7303 9.55087C19.1218 9.82801 19.4412 10.195 19.6616 10.621C19.8819 11.0471 19.997 11.5198 19.997 11.9994C19.997 12.4791 19.8819 12.9518 19.6616 13.3778C19.4412 13.8039 19.1218 14.1708 18.7303 14.448C18.3388 14.7251 17.8866 14.9044 17.4115 14.9706C16.9364 15.0369 16.4524 14.9883 16 14.8289V18.9999C16 19.2651 15.8946 19.5195 15.7071 19.707C15.5196 19.8946 15.2652 19.9999 15 19.9999H1C0.734784 19.9999 0.48043 19.8946 0.292893 19.707C0.105357 19.5195 0 19.2651 0 18.9999V4.99993C0 4.73471 0.105357 4.48035 0.292893 4.29282C0.48043 4.10528 0.734784 3.99993 1 3.99993H5.17C5.06 3.68693 5 3.34993 5 2.99993Z" fill={currentTabIndex === 1 ? "#FBA732" : "white"} />
              </svg>} label={<span className='hidden sm:block'>Your Quizzes</span>}
              sx={{ textTransform: "capitalize", display: 'flex' }}
            />
            <Tab
              onClick={() => setCurrentTabIndex(2)}
              iconPosition='start'
              icon={<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 0C17.2652 0 17.5196 0.105357 17.7071 0.292893C17.8946 0.48043 18 0.734784 18 1V4.757L9.001 13.757L8.995 17.995L13.241 18.001L18 13.242V19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H1C0.734784 20 0.48043 19.8946 0.292893 19.7071C0.105357 19.5196 0 19.2652 0 19V1C0 0.734784 0.105357 0.48043 0.292893 0.292893C0.48043 0.105357 0.734784 0 1 0H17ZM18.778 6.808L20.192 8.222L12.414 16L10.998 15.998L11 14.586L18.778 6.808ZM9 10H4V12H9V10ZM12 6H4V8H12V6Z" fill={currentTabIndex === 2 ? "#FBA732" : "#F8F4FB"} />
              </svg>
              }
              label={<span className='hidden sm:block'>Your Drafts</span>}
              className='!text-white'
              sx={{ textTransform: "capitalize" }}
            />
            <Tab
              onClick={() => setCurrentTabIndex(3)}
              iconPosition='start'
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.234 7.73C5.95509 6.58755 6.95376 5.64631 8.13687 4.99408C9.31999 4.34185 10.649 3.99985 12 4C13.3512 3.99969 14.6804 4.3416 15.8637 4.99384C17.047 5.64608 18.0458 6.5874 18.767 7.73L20.457 6.66C19.5554 5.23247 18.307 4.05647 16.8282 3.24163C15.3494 2.42679 13.6884 1.99964 12 2C10.3118 1.99981 8.65093 2.42703 7.17234 3.24187C5.69375 4.0567 4.44552 5.23261 3.544 6.66L5.234 7.73ZM12 20C10.649 20.0001 9.31999 19.6582 8.13687 19.0059C6.95376 18.3537 5.95509 17.4125 5.234 16.27L3.544 17.34C4.44552 18.7674 5.69375 19.9433 7.17234 20.7581C8.65093 21.573 10.3118 22.0002 12 22C13.6884 22.0004 15.3494 21.5732 16.8282 20.7584C18.307 19.9435 19.5554 18.7675 20.457 17.34L18.767 16.27C18.0458 17.4126 17.047 18.3539 15.8637 19.0062C14.6804 19.6584 13.3512 20.0003 12 20ZM12 12C12.7956 12 13.5587 11.6839 14.1213 11.1213C14.6839 10.5587 15 9.79565 15 9C15 8.20435 14.6839 7.44129 14.1213 6.87868C13.5587 6.31607 12.7956 6 12 6C11.2044 6 10.4413 6.31607 9.87868 6.87868C9.31607 7.44129 9 8.20435 9 9C9 9.79565 9.31607 10.5587 9.87868 11.1213C10.4413 11.6839 11.2044 12 12 12ZM12 13C13.0609 13 14.0783 13.4214 14.8284 14.1716C15.5786 14.9217 16 15.9391 16 17H8C8 15.9391 8.42143 14.9217 9.17157 14.1716C9.92172 13.4214 10.9391 13 12 13ZM6 12C6 12.7956 5.68393 13.5587 5.12132 14.1213C4.55871 14.6839 3.79565 15 3 15C2.20435 15 1.44129 14.6839 0.87868 14.1213C0.31607 13.5587 0 12.7956 0 12C0 11.2044 0.31607 10.4413 0.87868 9.87868C1.44129 9.31607 2.20435 9 3 9C3.79565 9 4.55871 9.31607 5.12132 9.87868C5.68393 10.4413 6 11.2044 6 12ZM21 15C21.7956 15 22.5587 14.6839 23.1213 14.1213C23.6839 13.5587 24 12.7956 24 12C24 11.2044 23.6839 10.4413 23.1213 9.87868C22.5587 9.31607 21.7956 9 21 9C20.2044 9 19.4413 9.31607 18.8787 9.87868C18.3161 10.4413 18 11.2044 18 12C18 12.7956 18.3161 13.5587 18.8787 14.1213C19.4413 14.6839 20.2044 15 21 15Z" fill={currentTabIndex === 3 ? "#FBA732" : "#F8F4FB"} />
              </svg>
              }
              label={<span className='hidden sm:block '>Public Quizzes</span>}
              className='!text-white'
              sx={{ textTransform: "capitalize" }}
            />
            <Tab
              onClick={() => setCurrentTabIndex(4)}

              iconPosition='start'
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18.26L4.94701 22.208L6.52201 14.28L0.588013 8.792L8.61501 7.84L12 0.5L15.385 7.84L23.412 8.792L17.478 14.28L19.053 22.208L12 18.26Z" fill={currentTabIndex === 4 ? "#FBA732" : "#F8F4FB"} />
              </svg>
              }
              label={<span className='hidden sm:block'>Favorites</span>}
              className='!text-white'
              sx={{ textTransform: "capitalize" }}
            />
          </Tabs>
        </Box>
      </div>
      <TabPanel value={tabValue} index={0}>
        <QuizList activeQuizzes={activeQuizzes} isFavoriteButton={true} favoritesQuizzes={favoritesQuizzes} isDelete={true} quizzes={publishQuizzes} handleRedirectToEdit={handleRedirectToEdit} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <QuizList activeQuizzes={activeQuizzes} isFavoriteButton={false} favoritesQuizzes={favoritesQuizzes} isDelete={true} quizzes={draftQuizzes} isDraft={true} handleRedirectToEdit={handleRedirectToEdit} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <QuizList activeQuizzes={activeQuizzes} isFavoriteButton={true} favoritesQuizzes={favoritesQuizzes} isDelete={false} quizzes={publicQuizzes} isEdit={false} isDraft={false} />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <QuizList activeQuizzes={activeQuizzes} isFavoriteButton={true} favoritesQuizzes={favoritesQuizzes} isDelete={false} quizzes={favoritesQuizzes} isEdit={false} isDraft={false} />
      </TabPanel>
      {/* {isWaring && <WarningModel close={() => setIsWaring(false)} />} */}
    </div>

  );
};
const QuizList = ({ activeQuizzes, quizzes, handleRedirectToEdit, isDraft = false, isEdit = true, isFavoriteButton, isDelete, favoritesQuizzes }: { quizzes: QuizType[], handleRedirectToEdit?: (id: string) => void, isEdit?: boolean, isFavoriteButton: boolean; activeQuizzes: string[]; isDraft?: boolean; isDelete: boolean; favoritesQuizzes: QuizType[] }) => {

  const dispatch = useDispatch();
  const user = useSelector((root: RootState) => root.student.user);
  const navigation = useRouter();
  const isAuthenticated = useSelector((root: RootState) => root.student.isAuthenticated);

  const handleAddToFavorites = async (quizId: string) => {
    if (isAuthenticated) {
      await AddToFavorites(quizId, user._id, dispatch);
    } else {
      navigation.push("/auth/login");
    }
  }
  const isFavorite = (id: string) => {
    return favoritesQuizzes.some((quiz: { _id: string }) => quiz._id === id);
  };


  return (
    <div className='w-full flex gap-5 p-5 flex-wrap'>
      {quizzes.length > 0 ? quizzes.map(quiz => (
        <div key={quiz._id} style={{ boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px" }} className='w-[250px] bg-white rounded-lg overflow-hidden relative'>
          {isFavoriteButton && <div className='absolute top-0 left-0 z-[50] p-1 flex flex-col items-start gap-2'>
            <IconButton onClick={() => handleAddToFavorites(quiz._id)} className={`${isFavorite(quiz._id) ? "!bg-[#fBA732] !text-white" : "!bg-white !text-[#fBA732]"}`}>
              <FaStar />
            </IconButton>
          </div>}
          <div className='absolute top-0 right-0 p-1 flex flex-col items-end gap-2'>
            {isEdit && <IconButton
              onClick={() => handleRedirectToEdit(quiz._id)}
              className='!bg-[#FBA732] !text-black '
            >


              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 14.66V18.41H3.75L14.81 7.35L11.06 3.6L0 14.66ZM18.41 3.75L14.66 0L12.13 2.54L15.88 6.29L18.41 3.75Z" fill="#002F49" />
              </svg>
            </IconButton>}
            {isDelete && <DeleteButton id={quiz._id} />}

          </div>
          {isDraft ? (
            <div>
              <Image src={quiz.coverImage} alt={quiz.name} width={250} height={150} className='w-full h-[150px] object-cover' loader={imageLoader} />
              <div className='p-4'>
                <h2 className='text-lg font-semibold'>{quiz.name}</h2>
                <p className='text-gray-600 text-sm'>{quiz.description}</p>
              </div>
            </div>
          ) : (
            true ? <Link href={`/play/${quiz._id}`} >
              <Image src={quiz.coverImage} alt={quiz.name} width={250} height={150} className='w-full h-[150px] object-cover' loader={imageLoader} />
              <div className='p-4'>
                <h2 className='text-lg font-semibold'>{quiz.name}</h2>
                <p className='text-gray-600 text-sm'>{quiz.description}</p>
              </div>
              {/* <div className='flex justify-end px-2 py-1'>
                {activeQuizzes.length > 0 && activeQuizzes.includes(quiz._id) && <div className='px-2 flex items-center justify-center py-[3px] font-semibold text-xs text-white bg-green-500 rounded-[50px]'>
                  Active
                </div>}
              </div> */}
            </Link> :
              <div >
                <Image src={quiz.coverImage} alt={quiz.name} width={250} height={150} className='w-full h-[150px] object-cover' loader={imageLoader} />
                <div className='px-4 pt-4'>
                  <h2 className='text-lg font-semibold'>{quiz.name}</h2>
                  <p className='text-gray-600 text-sm'>{quiz.description}</p>
                </div>
                <div className='flex justify-end px-2 py-1'>
                  {activeQuizzes.length > 0 && activeQuizzes.includes(quiz._id) && <div className='px-2 flex items-center justify-center py-[3px] font-semibold text-xs text-white bg-green-500 rounded-[50px]'>
                    Active
                  </div>}
                </div>
              </div>
          )
          }
        </div>
      )) : <p className='text-gray-500'>No quizzes found.</p>}
    </div>
  );
};
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


const DeleteButton = ({id}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = () => setOpen(true);
  const dispatch = useDispatch()
  const handleClose = () => {
    if (!loading) setOpen(false); // Prevent closing while loading
  };


  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = await DeleteQuizById(id);
      if (res?.status) {
        dispatch(deleteQuiz(id))
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} className="!bg-red_1 !text-white">
        <MdOutlineDelete />
      </IconButton>

      {/* Material UI Dialog for Confirmation */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="!font-bold">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className="!bg-[#002F49] !px-4 !text-white" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="!bg-red_1"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} className="!text-white !p-[1px] " /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};




export default Home;
