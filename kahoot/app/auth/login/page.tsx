"use client"
import { LoginWithGoogle } from '@/src/redux/api'
import { Button } from '@mui/material'
import React from 'react'
import { FaGoogle } from 'react-icons/fa'
import { useDispatch } from 'react-redux'

const Login = () => {
  const dispatch = useDispatch()
  const handleGoogleLogin = async () => {
    const res = await LoginWithGoogle(dispatch)
console.log(res)
  }
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <div style={{boxShadow:"rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px"}} className='w-[500px] h-[90%] flex items-center justify-center flex-col '>
        <Button onClick={handleGoogleLogin} className='!w-[90%] !py-3 !text-black !flex !items-center !justify-center !border !border-solid !border-black !rounded-lg !text-center !relative'>
          <FaGoogle className='absolute left-4' color='black' fontSize={'30px'}/> Login with Google
        </Button>

      </div>
      
    </div>
  )
}

export default Login
