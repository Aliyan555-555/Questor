"use client"
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../redux/schema/student';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { truncateString } from '../lib/services';
import { TbLogout } from "react-icons/tb";
import { FaAngleRight, FaUser } from 'react-icons/fa';
import { IoHelpOutline } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { SiGoogleanalytics } from "react-icons/si";
const ProfileAvatar = ({ user }: {
    user: {
        name: string;
        _id: string;
        profileImage: string;
        providerId: string;
        providerName: string;
        email: string;
        password: string;
        favorites: [];
    }
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        dispatch(logout()); // Dispatch logout action
        await signOut(auth)
        handleClose();
        router.push('/auth/login'); // Redirect to login page after logout
    };

    return (
        <>
            <IconButton onClick={handleClick} style={{ marginBottom: '8px' }}>
                <Avatar src={user.profileImage} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                style={{ marginTop: 5, marginRight: 5 }}
                className='rounded-[10px]'
            >
                <div className='flex  w-[280px] px-4 pb-3 pt-2 mb-2 border-b border-gray-400'>
                    <Avatar className='!h-[50px] !w-[50px]' src={user.profileImage} />
                    <div className='flex-1 px-2 ' >
                        <h2 className='text-gray-700 text-lg text-ellipsis font-semibold'>{truncateString(user.name, 24)}</h2>
                        <h4 className='text-gray-700 text-sm text-ellipsis font-semibold'>{truncateString(user.email, 22)}</h4>
                    </div>
                </div>
                <MenuItem onClick={() => router.push('/auth/profile')} className='!flex !items-center !justify-between !px-4 !gap-3 !text-gray-700 !font-semibold' >
                    <div className='flex gap-3 items-center py-1'>
                        <div className='p-2 bg-[#BDBDBD] text-md rounded-full flex items-center justify-center text-white '>
                            <FaUser fontSize={23} />
                        </div>
                        Edit Profile
                    </div>
                    <FaAngleRight fontSize={20} />
                </MenuItem>
                <MenuItem onClick={() => router.push('/reports')} className='!flex !items-center !justify-between !px-4 !gap-3 !text-gray-700 !font-semibold' >
                    <div className='flex gap-3 items-center py-1'>
                        <div className='p-2 bg-[#BDBDBD] text-md rounded-full flex items-center justify-center text-white '>
                        <SiGoogleanalytics fontSize={20} />
                        </div>
                        Reports
                    </div>
                    <FaAngleRight fontSize={20} />
                </MenuItem>
                <MenuItem className='!flex !items-center !justify-between !px-4 !gap-3 !text-gray-700 !font-semibold' >
                    <div className='flex gap-3 items-center py-1'>
                        <div className='p-2 bg-[#BDBDBD] rounded-full flex items-center justify-center text-white '>
                            <IoMdSettings fontSize={23} />
                        </div>
                        Settings & Privacy
                    </div>
                    <FaAngleRight fontSize={20} />
                </MenuItem>
                <MenuItem className='!flex !items-center !justify-between !px-4 !gap-3 !text-gray-700 !font-semibold' >
                    <div className='flex gap-3 items-center py-1'>
                        <div className='p-2 bg-[#BDBDBD] rounded-full flex items-center justify-center text-white '>
                            <IoHelpOutline fontSize={23} />
                        </div>
                        Help & Support
                    </div>
                    <FaAngleRight fontSize={20} />
                </MenuItem>
                <MenuItem onClick={handleLogout} className='!flex !items-center !justify-between !px-4 !gap-3 !text-gray-700 !font-semibold' >
                    <div className='flex gap-3 items-center py-1'>
                        <div className='p-2 bg-[#BDBDBD] rounded-full flex items-center justify-center text-white '>
                            <TbLogout fontSize={23} />
                        </div>
                        Logout
                    </div>
                    <FaAngleRight fontSize={20} />
                </MenuItem>
            </Menu>
        </>
    );
};

export default ProfileAvatar;
