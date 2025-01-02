"use client";
import { useEffect, useState } from 'react';
// import useSocket from '@/src/hooks/useSocket';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { join } from '@/src/redux/schema/student';
import { useSocket } from '@/src/hooks/useSocket';

const Student = () => {
  const query = useSearchParams()
  
  
  const socket = useSocket();
  const params = useParams();
  const dispatch = useDispatch();
  const [roomId] = useState(`${params.tid}-${params.id}`);
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin,setPin] = useState(query.get('pin'));
  const [pinVerified,setPinVerified] = useState(false)
  const navigation = useRouter();
  const joinRoom = () => {
    if (socket && nickname) {
      const studentId = socket.id; // Using socket ID as student ID
      socket.emit('joinRoom', {pin, roomId, studentId, nickname });
    }
  };

  useEffect(() => {
    if (socket) {
     
      socket.on('joinedRoom', ({ roomId,student }) => {
        // console.log(`Joined room: ${roomId}`);
        dispatch(join({roomId,student}))
        navigation.push(`${window.location.origin}/play/${params.id}/${params.tid}/lobby/instructions`)

      });

      socket.on('nickname_error', (error) => {
        toast.error(error.message);
      });

      socket.on('pinVerified',(data)=>{
        if (data.status){
          setPinVerified(true);
        }
        else{
          toast.error('Invalid PIN');
        }
      })

      
      return () => {
        socket.off('joinedRoom');
        socket.off('nickname_error');
      };
    }
  }, [socket]);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };
  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const handleJoinClick = () => {
    if (nickname) {
      joinRoom();
    } else {
      toast.error('Please enter a nickname');
    }
  };

  const verifyPin = () => {
    socket.emit('verifyPin',{roomId,pin});
  }


  return (
    pinVerified? <div className='w-screen h-screen flex-col bg-cover bg-center bg-no-repeat flex items-center justify-center gap-10'    style={{ backgroundImage: "url(/images/NKbg.png)" }}>
      <h2 className='text-3xl font-black text-white '>Kahoot</h2>
      <div className='w-[400px] flex flex-col p-4 gap-2 bg-white'>
        <input type="text" value={nickname} onChange={handleNicknameChange} className='w-full border-2 border-gray-300 p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold' placeholder='Your Nickname' />
        <Button onClick={handleJoinClick} className='!w-full !p-4 !rounded-lg !text-white !bg-gray-800 !text-xl !font-semibold'>
          Enter
        </Button>

      </div>
    </div>:<div className='w-screen h-screen flex-col bg-cover bg-center bg-no-repeat flex items-center justify-center gap-10'    style={{ backgroundImage: "url(/images/NKbg.png)" }}>
      <h2 className='text-3xl font-black text-white '>Kahoot</h2>
      <div className='w-[400px] flex flex-col p-4 gap-2 bg-white'>
        <input  type="text" value={pin??''} onChange={handlePinChange} className='w-full border-2 border-gray-300 p-4 text-xl font-semibold text-gray-400 focus:outline-none rounded-lg placeholder:text-center placeholder:text-xl placeholder:font-semibold' placeholder='Game PIN' />
        <Button onClick={verifyPin} className='!w-full !p-4 !rounded-lg !text-white !bg-gray-800 !text-xl !font-semibold'>
          Enter
        </Button>

      </div>
    </div>
  );
};

export default Student;
