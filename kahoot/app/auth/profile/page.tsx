"use client"
import ProfileAvatar from '@/src/components/ProfileAvatar';
import { API_DOMAIN } from '@/src/redux/api';
import { updateUser } from '@/src/redux/schema/student';
import { RootState } from '@/src/redux/store';
import { Button, IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { IoMdPersonAdd } from 'react-icons/io';
import { MdModeEditOutline } from 'react-icons/md';
import { PiSignInBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';

const Profile = () => {
  const user = useSelector((root: RootState) => root.student);
  const tabs = ["Edit profile"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className='w-screen overflow-y-scroll'>
      <div className='w-full flex justify-between py-5 md:py-7 px-3 md:px-10 bg-white'>
        {/* <Link href={'/'}> */}
          <Link href={'/'} className='flex gap-2 md:gap-4 items-center'>
            <Image src={'/images/UI/QuestorIcon.svg'} alt='Questor' width={35} height={35} />
            <h2 className=' hidden sm:flex text-2xl font-bold'>Dashboard</h2>
       {/* </Link>    */}
       </Link>
        {/*  */}
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

      <div className=" bg-gray-100 py-4 !px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-md shadow-md mb-10 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

          <div className="flex border-b mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold transition-colors duration-200 ${tab === activeTab
                  ? "text-black border-b-2 border-black"
                  : "text-gray-600 hover:text-black/90"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Edit profile" && (
            <EditPRofileTab />
          )}

          {/* {activeTab === "Change password" && (
                        <ChangePasswordTab />
                    )} */}


        </div>
      </div>

    </div>
  );
}
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/src/redux/store';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Button, IconButton } from '@mui/material';
// import { MdModeEditOutline } from 'react-icons/md';

const EditPRofileTab = () => {
  const user = useSelector((root: RootState) => root.student.user);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.profileImage);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [success, setSuccess] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
  });

  useEffect(() => {
    const hasChanges =
      userData.name !== user.name ||
      userData.email !== user.email ||
      profilePicture !== null;
    setIsModified(hasChanges);
  }, [userData, profilePicture, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('prevEmail', user.email);

      if (profilePicture) {
        formData.append('profileImage', profilePicture);
      }

      const res = await API_DOMAIN.put('/api/v1/auth/edit', formData);
      const response = res.data;
      if (!response.status) {
        return
      }
      dispatch(updateUser(response.user))
      setSuccess('Profile updated successfully!');
      setIsModified(false);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };
  const handleChangeImageFile = () => {
    document.getElementById("ImageInput").click()
  }
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Form Fields */}
      <div className="md:w-1/2 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-gray-800">User Information</h2>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#FBA732]"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
            Email
          </label>
          <input
            type="email"
            readOnly
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#FBA732]"
          />
        </div>

        {/* Profile Picture Upload */}
        {/* <div className="flex flex-col gap-2">
          <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
            Change Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#FBA732]"
          />
        </div> */}

        {/* Feedback Messages */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Save & Delete */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isModified || isSaving}
            className="!bg-[#FBA732] w-fit !text-white !px-6 !py-2 !capitalize !rounded disabled:!bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Link href="/auth/delete-account" passHref>
            <button
              type="button"
              className="w-fit text-red-600 font-semibold hover:underline hover:text-red-700 text-sm"
            >
              Delete my account
            </button>
          </Link>
          <p className="text-xs text-gray-500 max-w-sm">
            Deleting your account is permanent and will remove all your data including created quizzes and saved progress.
          </p>
        </div>
      </div>

      {/* Right: Avatar Preview */}
      <div className="md:w-1/2 flex justify-center md:justify-end items-start">
        {preview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Profile Picture Preview:</p>
            <div className="relative w-[100px] h-[100px]">
              <input
                type="file"
                accept="image/*"
                hidden
                id='ImageInput'
                onChange={handleFileChange}
                className="text-sm border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#FBA732]"
              />
              <Image
                src={preview}
                alt="Profile Preview"
                width={100}
                height={100}
                className="rounded-full w-[100px] h-[100px] object-cover border"
              />
              <IconButton
                onClick={handleChangeImageFile}
                className="!absolute top-0 right-0 !bg-[#FBA732] !text-black !p-[6px] hover:scale-105 transition"
                aria-label="Edit profile picture"
              >
                <MdModeEditOutline fontSize={20} />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Profile;
