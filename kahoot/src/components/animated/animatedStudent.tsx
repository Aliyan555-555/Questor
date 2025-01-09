import React from 'react'
import {motion} from 'framer-motion'
import Image from 'next/image';
const AnimatedCharacter = ({w,h,animate,character,}) => {
  return (
    <div className='relative w-[200px]  bg-black' style={{width:'200px',height:'200px'}} >
        <motion.div className=' top-0 left-0'>
            <Image src={character.face} alt="Character" width={200} height={200} className='w-full h-full z-10 absolute top-0 left-0' />
            <Image src={character.smile} alt="Character" width={200} height={200} className='w-full h-full z-10 absolute top-0 left-0' />
            <div className='w-full absolute h-full top-0 z-10'>
                {character.smile}
            </div>
        </motion.div>
      
    </div>
  )
}

export default AnimatedCharacter
