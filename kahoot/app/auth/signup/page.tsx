"use client";
import { LoginWithGoogle } from "@/src/redux/api";
import { RootState } from "@/src/redux/store";
import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const Signup = () => {
  const user = useSelector((root: RootState) => root.student);
  const dispatch = useDispatch();
  const navigation = useRouter();
  const query = useSearchParams();
  const redirect = query.get("redirect");
  const redirectUrl = query.get("redirect_url");
  const handleGoogleLogin = async () => {
    if (user.isAuthenticated) {
      toast.info("User already logged in");
      return;
    }
    const isRedirect = redirect === "true";
    await LoginWithGoogle(dispatch, navigation, isRedirect, redirectUrl);
  };

  const handleSignupWithCredentials = async () => {
    toast.info("signup with credentials logic not implemented yet")
  }
  return (
    <div  style={{backgroundImage:"url(/images/UI/authBG.png)"}} className="w-screen bg-cover bg-top h-screen flex items-center justify-center ">
      <div style={{boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"}} className="w-[90%] md:w-[450px] h-auto py-8 px-6 bg-white rounded-lg flex flex-col items-center gap-4">
         <div className="w-full flex items-center justify-center">
                <Image src={'/images/UI/fullLogo.png'} alt="Questor" width={150} height={100} /> 
                </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Create Your Account
        </h3>
        <p className="text-sm text-gray-600">Sign up to get started!</p>

        <form className="w-full flex flex-col gap-4">
          <div className="w-full">
            <label
              htmlFor="name"
              className="font-medium text-gray-700 text-sm mb-2 block"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="email"
              className="font-medium text-gray-700 text-sm mb-2 block"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="password"
              className="font-medium text-gray-700 text-sm mb-2 block"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              name="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
            />
          </div>

          <Button
          onClick={handleSignupWithCredentials}
            type="submit"
            variant="contained"
            className="!w-full !py-3 !bg-[#FBA732] !text-black font-semibold !text-lg !rounded-lg !normal-case hover:!bg-[#ff9b10] focus:!ring-0"
          >
            Sign up
          </Button>
        </form>

        <div className="w-full flex items-center justify-center gap-2">
          <div className="h-[1px] w-full bg-gray-300" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-[1px] w-full bg-gray-300" />
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="!w-full !py-3 !bg-slate-100 !text-gray-800 !font-medium !text-lg !rounded-full !border !border-gray-300 hover:!bg-gray-100 hover:!shadow-lg transition-all !capitalize !duration-200  !ease-in-out !flex !items-center !justify-center !relative"
        >
          <div className="absolute left-4 flex items-center justify-center">
            <Image
              src="/images/icon/google.svg"
              alt="Google Icon"
              width={24}
              height={24}
            />
          </div>
          <span className="ml-6">Continue with Google</span>
        </Button>

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#10BBF9] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
