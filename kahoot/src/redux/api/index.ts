import { toast } from "react-toastify";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { AppDispatch } from "../store";
import { login } from "../schema/student";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const API_DOMAIN = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER,
  withCredentials: true,
});
export const fetchAvatars = async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/avatars`
    );
    return res;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};
export const SocialLogin = async (data:{
  name: string | null;
  email: string | null;
  providerId: string | null;
  providerName: string | null;
  profileImage: string |null;
}) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/social/login", data);
    return res.data;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error)
  }
};
export const LoginWithGoogle = async (dispatch: AppDispatch,navigation:AppRouterInstance,redirect:boolean,redirectUrl:string | null) => {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;
  const response = await SocialLogin({
    name: user.displayName,
    email: user.email,
    providerId: user.uid,
    providerName: user.providerData[0].providerId,
    profileImage: user.photoURL,
  });
  if (response?.status) {
    dispatch(login(response.data));
    if (redirect && redirectUrl) {
      navigation.push(redirectUrl);
    } else {
      navigation.push("/");
    }
    // navigation.push("/");

  } else {
    toast.error("Failed to login try again");
  }
};
