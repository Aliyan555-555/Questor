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
export const SocialLogin = async (data: {
  name: string | null;
  email: string | null;
  providerId: string | null;
  providerName: string | null;
  profileImage: string | null;
}) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/social/login", data);
    return res.data;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};
export const LoginWithGoogle = async (
  dispatch: AppDispatch,
  navigation: AppRouterInstance,
  redirect: boolean,
  redirectUrl: string | null
) => {
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

export const GetAllThemes = async () => {
  try {
    const res = await API_DOMAIN.get("/api/v1/themes");
    return res.data;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const PEXELS_ACCESS_KEY = process.env.NEXT_PUBLIC_PEXELS_ACCESS_KEY;
const imageCache = new Map();

export const FetchUnsplashImages = async (
  query: string = "",
  page: number = 1,
  perPage: number = 30,
  isPopular: boolean = false
) => {
  const cacheKey = `${isPopular ? "popular" : query}-${page}`;

  if (imageCache.has(cacheKey)) {
    console.log("Serving from cache:", cacheKey);
    return imageCache.get(cacheKey);
  }

  try {
    const endpoint = isPopular
      ? "https://api.unsplash.com/photos"
      : "https://api.unsplash.com/search/photos";

    const params = isPopular
      ? { page, per_page: perPage }
      : { query, page, per_page: perPage };

    const response = await axios.get(endpoint, {
      params,
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    console.log("Rate Limit:", response.headers["x-ratelimit-limit"]);
    console.log(
      "Remaining Requests:",
      response.headers["x-ratelimit-remaining"]
    );

    const results = isPopular ? response.data : response.data.results || [];
    imageCache.set(cacheKey, results);
    return results;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else {
      console.error("Error fetching images:", error.message);
    }
    return [];
  }
};

export const FetchPexelsImages = async (
  query = "",
  page = 1,
  perPage = 30,
  isPopular = false
) => {
  try {
    const params = {
      query: isPopular ? "popular" : query,
      page,
      per_page: perPage,
    };

    const response = await axios.get(
      "https://api.pexels.com/v1/" + (isPopular ? "curated" : "search"),
      {
        params,
        headers: {
          Authorization: PEXELS_ACCESS_KEY,
        },
      }
    );

    return response.data.photos.map((img) => ({
      id: img.id,
      src: img.src.medium,
      alt: img.alt,
      width: img.width,
      height: img.height,
    }));
  } catch (error) {
    console.error("Error fetching Pexels images:", error);
    return [];
  }
};

export const getAllQuizzesByUserId = async (id: string) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/quizzes/${id}`);
    return res.data;
  } catch (error) {
    console.log("Error fetching Quizzes", error);
    toast.error("Something want wrong");
  }
};
export const getAllPublicQuizzes = async () => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/public/quizzes`);
    return res.data;
  } catch (error) {
    console.log("Error fetching Quizzes", error);
    toast.error("Something want wrong");
  }
};
