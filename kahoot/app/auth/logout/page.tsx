"use client"
import React, { useEffect } from 'react'
import Loading from './../../play/[id]/loading';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import { Logout } from '@/src/redux/api';

const LogoutPage = () => {
  const isAuthenticated = useSelector((root: RootState) => root.student.isAuthenticated);
  useEffect(async () => {
    if (isAuthenticated) {
      await Logout();
      window.location.href = '/auth/login';
    } else {
      window.location.href = '/auth/login';
    }
  }, []);


  return (
    <Loading />
  )
}

export default LogoutPage
