import { Button } from '@mui/material'
import React from 'react'

const Exist = () => {
  return (
    <div className='w-screen h-screen flex items-center gap-4 justify-center text-center flex-col'>
        <h1 className='text-4xl font-black text-white'>Room already hosted another devices</h1>
        <p className='text-xl font-semibold text-white'>Please try again later </p>
        <Button  className='!bg-red-500 !text-white !px-20 !py-3 !rounded-lg !text-lg !capitalize !font-semibold'> 
          Delete hosted room
        </Button>
    </div>
  )
}

export default Exist
