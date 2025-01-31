"use client"
import { RootState } from '@/src/redux/store'
import { Avatar, IconButton } from '@mui/material'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAllQuizzesByUserId } from '@/src/redux/api'
import Image from 'next/image'
import { FiEdit2 } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import imageLoader from '@/src/components/ImageLoader'

interface QuizType {
  _id: string;
  name: string;
  description: string;
  creator: string;
  coverImage: string;
}
const Home = () => {
  const user = useSelector((root: RootState) => root.student);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
const navigation = useRouter()
  const fetch = async () => {
    const userId = user?.user?._id ?? "";

    const res = await getAllQuizzesByUserId(userId);
    setQuizzes(res.data);
  }
  useEffect(() => {
    if (user.isAuthenticated && user.user) {
      fetch();
    }
  }, [])
  const handleRedirectToEdit = (id)=> {
    navigation.push(`/play/create?id=${id}`)
  }
  return (
    <div className='w-screen'>
      <div className='w-full flex py-2 border-b border-gray-300 px-5'>
        <div className='w-[250px]'>

        </div>
        <div className='flex-1'>

        </div>
        <div className='w-1/4 flex gap-2 justify-end'>
          {
            user.isAuthenticated ? (
              <React.Fragment>
                <Link href={'/play/create'} className='!px-6 flex items-center !py-0 !bg-blue-600 !font-semibold !capitalize !text-white !rounded-md'>
                  Create
                </Link>
                <Link href={'/play/connect/to/game'} className='!px-6 flex items-center !py-0 !bg-blue-600 !capitalize !font-semibold !text-white !rounded-md'>
                  Join
                </Link>
                <Avatar />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link href={'/auth/login'} className='!px-6 !py-0 !bg-blue-600 !capitalize !font-semibold !text-white !rounded-md'>Sign in</Link>
                <Link href={'/auth/signup'} className='!px-6 !py-0 !bg-blue-600 !capitalize !font-semibold !text-white !rounded-md'>Sign up</Link>
              </React.Fragment>
            )
          }
        </div>

      </div>

      <div className='w-full flex gap-5 p-10 flex-wrap'>
        {quizzes.map(quiz => (
         <div key={quiz._id} className='w-[19%]  relative'>
          <IconButton onClick={() => handleRedirectToEdit(quiz._id)} className='!bg-blue-600 !text-white !border-2 !border-black !top-[-10px] !right-[-10px] !absolute'>
          <FiEdit2 />
          </IconButton>
           <Link className='w-full' href={`/play/${quiz._id}`} key={quiz._id}>
            <Image src={quiz.coverImage} alt={quiz.name} width={300} height={300} className='w-full h-[70%]  object-fill' loader={imageLoader} />
            <div className='w-full bg-gray-100 px-5 py-4 border-b border-gray-300'>
              <h2 className='text-xl font-semibold'>{quiz.name}</h2>
              <p>{quiz.description}</p>
            </div>
          </Link>
         </div>
        ))}

      </div>

    </div>
  )
}

export default Home
