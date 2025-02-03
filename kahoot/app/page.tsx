"use client"
import { RootState } from '@/src/redux/store';
import { Avatar, IconButton, Tabs, Tab, Box, Button } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllPublicQuizzes, getAllQuizzesByUserId } from '@/src/redux/api';
import Image from 'next/image';
import { FiEdit2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import imageLoader from '@/src/components/ImageLoader';

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
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<QuizType[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const navigation = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchQuizzes = async () => {
    const userId = user?.user?._id ?? "";
    const res = await getAllQuizzesByUserId(userId);
    const res1 = await getAllPublicQuizzes();
    if (res1?.status) {
      setPublicQuizzes(res1.data);
    }
    if (res?.status) {
      setQuizzes(res.data);
    }
  };

  useEffect(() => {
    if (user.isAuthenticated && user.user) {
      fetchQuizzes();
    }
  }, []);

  const handleRedirectToEdit = (id: string) => {
    navigation.push(`/play/create?id=${id}`);
  };

  return (
    <div className='w-full min-h-screen bg-gray-100'>
      <div className='w-full flex justify-between py-4 px-6 bg-white shadow-md'>
        <h1 className='text-2xl font-bold text-gray-800'>Quiz Dashboard</h1>
        <div className='flex gap-4'>
          {user.isAuthenticated ? (
            <>
              <Link href={'/play/create'}>
                <Button variant='contained' className='!capitalize' color='primary'>Create</Button>
              </Link>
              <Link href={'/play/connect/to/game'}>
                <Button variant='contained' color='secondary' className='!capitalize' >Join</Button>
              </Link>
              <Avatar />
            </>
          ) : (
            <>
              <Link href={'/auth/login'}>
                <Button variant='contained' color='primary' className='!capitalize' >Sign in</Button>
              </Link>
              <Link href={'/auth/signup'}>
                <Button variant='contained' color='primary' className='!capitalize' >Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Box sx={{ width: '100%', bgcolor: 'white', boxShadow: 1 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ '& .MuiTabs-indicator': { backgroundColor: '#2563eb' } }}
        >
          <Tab label="Your Quizzes" sx={{ textTransform: "capitalize" }} />
          <Tab label="Your Drafts" sx={{ textTransform: "capitalize" }} />
          <Tab label="Public Quizzes" sx={{ textTransform: "capitalize" }} />
          <Tab label="Favorites" sx={{ textTransform: "capitalize" }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <QuizList quizzes={quizzes.filter(f => f.status === 'active')} handleRedirectToEdit={handleRedirectToEdit} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <QuizList quizzes={quizzes.filter(f => f.status === 'draft')} isDraft={true} handleRedirectToEdit={handleRedirectToEdit} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <QuizList quizzes={publicQuizzes} isEdit={false} isDraft={false}/>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <div className='p-6 text-gray-500'>Your favorite quizzes will appear here.</div>
      </TabPanel>
    </div>
  );
};

const QuizList = ({ quizzes, handleRedirectToEdit, isDraft = false, isEdit = true }: { quizzes: QuizType[], handleRedirectToEdit?: (id: string) => void,isEdit?:boolean,isDraft?:boolean }) => {
  return (
    <div className='w-full flex gap-5 p-10 flex-wrap'>
      {quizzes.length > 0 ? quizzes.map(quiz => (
        <div key={quiz._id} className='w-[250px] bg-white shadow-lg rounded-lg overflow-hidden relative'>
          {isEdit && <IconButton
            onClick={() => handleRedirectToEdit(quiz._id)}
            className='!bg-blue-600 !text-white !top-3 !right-3 !absolute'
          >
            <FiEdit2 />
          </IconButton>}
          {isDraft ? (
            <div>
              <Image src={quiz.coverImage} alt={quiz.name} width={250} height={150} className='w-full h-[150px] object-cover' loader={imageLoader} />
              <div className='p-4'>
                <h2 className='text-lg font-semibold'>{quiz.name}</h2>
                <p className='text-gray-600 text-sm'>{quiz.description}</p>
              </div>
            </div>
          ) : (
            <Link href={`/play/${quiz._id}`}>
              <Image src={quiz.coverImage} alt={quiz.name} width={250} height={150} className='w-full h-[150px] object-cover' loader={imageLoader} />
              <div className='p-4'>
                <h2 className='text-lg font-semibold'>{quiz.name}</h2>
                <p className='text-gray-600 text-sm'>{quiz.description}</p>
              </div>
            </Link>
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

export default Home;
