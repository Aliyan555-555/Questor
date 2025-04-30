
"use client"
import ProfileAvatar from '@/src/components/ProfileAvatar';
import { RootState } from '@/src/redux/store';
import { Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { IoMdPersonAdd } from 'react-icons/io';
import { PiSignInBold } from 'react-icons/pi';
import { useSelector } from 'react-redux';

const RootLayout = ({children}) => {
    const user = useSelector((root: RootState) => root.student);

  return (
    <div className='w-screen h-screen overflow-y-auto'>
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
      {children}
    </div>
  );
}

export default RootLayout;
