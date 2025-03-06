"use client"
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../redux/schema/student';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

const ProfileAvatar = () => {
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
            <IconButton className='!bg-red-300 !p-0' onClick={handleClick}>
                <Avatar />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
};

export default ProfileAvatar;
