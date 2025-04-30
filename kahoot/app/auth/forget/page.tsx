"use client";
import { Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import OtpInput from 'react-otp-input';
import { useRouter } from "next/navigation";
import { ForgetPassword, UpdatePassword } from "@/src/redux/api";

const Forget = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [confirmOtp, setConfirmOtp] = useState(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false)
      return;
    }
    try {

      const res = await ForgetPassword(email);
      if (res?.status) {
        setMessage("Password reset email sent successfully. Please check your inbox.");
        setConfirmOtp(res.otp);
      }
      else {
        setMessage(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP  = () => {
    if (otp.length === 6 && otp === confirmOtp) {
      setError("");
      setMessage("")
      setIsOtpVerified(true);
    } else {
      setError("Invalid OTP")
    }
  }

  const handleSavePassword = async () =>{
    setLoading(true);
    setError("");
    setMessage("");
    if (password !== confirmPassword){
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await UpdatePassword(email,password);
      if (res?.status) {
        router.push("/auth/login");
      }else{
        setMessage(res.message);
      }
    } catch (error) {
      setError(error);
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-cover bg-top bg-gray-100"
      style={{ backgroundImage: "url(/images/UI/authBG.png)" }}
    >
      <div className="w-[90%] md:w-[450px] py-10 px-8 bg-white rounded-xl shadow-lg flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="w-full flex items-center justify-center">
          <Image src={"/images/UI/fullLogo.png"} alt="Questor" width={150} height={100} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Forgot Password?</h3>
        <p className="text-sm text-gray-600 text-center px-2">
          Enter your registered email to receive password reset instructions.
        </p>
        {message && <p className="text-sm text-green-600 bg-green-100 px-3 py-2 rounded-md">{message}</p>}
        {error && <p className="text-sm text-red-500 bg-red-100 px-3 py-2 rounded-md">{error}</p>}
{!isOtpVerified &&
        <form className="w-full flex flex-col gap-4" >
          {!isOtpVerified && !confirmOtp ? (
            <div className="w-full">
              <label htmlFor="email" className="font-medium text-gray-700 text-sm mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
              />
            </div>
          ) : (
            <div className="w-full py-5">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputType="text"
                containerStyle={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '3px', // Ensures proper spacing between OTP boxes
                }}
                renderSeparator={<span className="w-[3px]" />} // Space between input boxes
                inputStyle={{
                  width: '50px',
                  height: '50px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: '2px solid #d1d5db',
                  color: 'black',
                  backgroundColor: 'white',
                  outline: 'none',
                  transition: 'border-color 0.3s ease-in-out',
                }}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="focus:ring-2 focus:outline-none focus:border-0  focus:ring-[#FBA732] border-gray-300 focus:border-[#FBA732] shadow-sm"
                  />
                )}
              />

            </div>
          )}

          {!isOtpVerified && !confirmOtp ? <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            className="!w-full !py-3 !font-semibold !bg-[#FBA732] !text-black !text-lg !rounded-lg !normal-case hover:!bg-[#ffa11e] focus:!ring-0"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
          </Button> :
            <Button
              // type="submit"
              onClick={handleVerifyOTP}
              variant="contained"
              disabled={loading}
              className="!w-full !py-3 !font-semibold !bg-[#FBA732] !text-black !text-lg !rounded-lg !normal-case hover:!bg-[#ffa11e] focus:!ring-0"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
            </Button>

          }
          <Button

            variant="outlined"
            className="!w-full !font-semibold !py-3  !border-gray-400 !text-gray-700 !text-lg !rounded-lg !normal-case hover:!border-[#ffa11e] hover:!text-[#ffa11e] focus:!ring-0"
            onClick={() => router.push("/auth/login")}
          >
            Back to Login
          </Button>
        </form>}

        {
          isOtpVerified && (
            <form className="w-full flex flex-col gap-4" >
    
              <div className="w-full">
                <label htmlFor="email" className="font-medium text-gray-700 text-sm mb-2 block">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your new password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="font-medium text-gray-700 text-sm mb-2 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBA732]"
                />
              </div>
              <Button
            onClick={handleSavePassword}
            variant="contained"
            disabled={loading}
            className="!w-full !py-3 !font-semibold !bg-[#FBA732] !text-black !text-lg !rounded-lg !normal-case hover:!bg-[#ffa11e] focus:!ring-0"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Password"}
          </Button>
              </form>
          )
        }
      </div>
    </div>
  );
};

export default Forget;
