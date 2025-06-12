import { toast } from "react-toastify";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { AppDispatch } from "../store";
import {
  login,
  setCurrentDraft,
  setFavorites,
  updateDraftQuestion,
} from "../schema/student";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  setActiveQuizzes,
  setPublicQuizzes,
  setUserDraftQuizzes,
  setUserPublishedQuizzes,
} from "../schema/baseSlice";
import { AxiosError } from 'axios';

export const API_DOMAIN = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


const getAuthHeaders = (token: string) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
};

export const fetchAvatars = async () => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/avatars`);
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
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        console.error("Rate limit exceeded. Please try again later.");
      } else {
        console.error("Error fetching images:", error.message);
      }
    } else {
      console.error("An unknown error occurred");
    }
    return [];
  }
};

interface PexelsImage {
  id: number;
  src: {
    medium: string;
  };
  alt: string;
  width: number;
  height: number;
}

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

    return response.data.photos.map((img: PexelsImage) => ({
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

export const getAllQuizzesByUserId = async (
  id: string,
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/quizzes/${id}`);
    if (res.data.status) {
      const draftQuizzes = res.data.data.filter(
        (quiz: { status: string }) => quiz.status === "draft"
      );
      const publishedQuizzes = res.data.data.filter(
        (quiz: { status: string }) => quiz.status === "active"
      );
      dispatch(setUserDraftQuizzes(draftQuizzes));
      dispatch(setUserPublishedQuizzes(publishedQuizzes));
    }
  } catch (error) {
    console.log("Error fetching Quizzes", error);
    toast.error("Something went wrong");
  }
};
export const getAllPublicQuizzes = async (dispatch: AppDispatch) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/public/quizzes`);
    if (res.data.status) {
      dispatch(setPublicQuizzes(res.data.data));
    }
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};

export const getActiveQuizzesByTeacherId = async (
  id: string,
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/active/quizzes/${id}`);
    if (res.data.status) {
      dispatch(setActiveQuizzes(res.data.data));
    }
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};
export const AddToFavorites = async (
  quizId: string,
  userId: string,
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.post(
      `/api/v1/auth/favorites/${userId}/${quizId}`
    );
    if (res.data.status) {
      dispatch(setFavorites(res.data.favorites));
    }
  } catch (error) {
    console.log(error);
  }
};

interface LoginCredentials {
  email: string;
  password: string;
}

export const LoginWithCredential = async (
  dispatch: AppDispatch,
  navigation: AppRouterInstance,
  credentials: LoginCredentials,
  isRedirect: boolean,
  redirectUrl: string,
  setError: (error: string) => void
) => {
  const res = await API_DOMAIN.post("/api/v1/auth/login", credentials);
  console.log(res);
  if (res.data.status) {
    dispatch(login(res.data.data));
    toast.success("Successfully logged in");
    if (isRedirect) {
      return navigation.push(redirectUrl);
    } else {
      return navigation.push("/");
    }
  } else {
    setError(res.data.message);
  }
};

export const ForgetPassword = async (email: string) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/forget", { email: email });
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An error occurred");
    }
  }
};

export const UpdatePassword = async (email: string, password: string) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/forget/password", {
      email: email,
      password: password,
    });
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An error occurred");
    }
  }
};

interface RegistrationCredentials {
  name: string | null;
  email: string | null;
  password: string | null;
}

export const RegisterWithCredentials = async (
  navigation: AppRouterInstance,
  credentials: RegistrationCredentials,
  isRedirect: boolean,
  redirectUrl: string | null,
  setError: (error: string) => void
) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/registration", credentials);
    console.log(res);
    if (res.data.status) {
      if (isRedirect) {
        return navigation.push(
          `/auth/login?redirect=true&redirect_url=${redirectUrl}`
        );
      } else {
        return navigation.push("/auth/login");
      }
    } else {
      setError(res.data.message);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An error occurred");
    }
  }
};

export const DeleteQuizById = async (id: string) => {
  try {
    const res = await API_DOMAIN.delete(`/api/v1/quiz/delete/quiz/${id}`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    return res.data;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};

export const fetchReportsData = async (id:string) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/reports/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createInitialQuiz = async (
  token: string,
  data: { name: string; description: string; creator: string; theme: string }
) => {
  try {
    const res = await API_DOMAIN.post("/api/v1/quiz/create", data, {
      headers: getAuthHeaders(token),
    });
    setCurrentDraft(res.data.data);
    return res.data;
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};
export const deleteQuestionInQuiz = async (
  token: string,
  quizId: string,
  questionId: string,
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.delete(
      `/api/v1/quiz/delete/question/${quizId}/${questionId}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    if (res.data.status) {
      dispatch(setCurrentDraft(res.data.data));
      return res.data;
    }
  } catch (error) {
    toast.error("Failed to delete question");
    console.error(error);
  }
};

export const addQuestionInQuiz = async (
  token: string,
  quizId: string,
  type: string = "quiz",
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.post(
      `/api/v1/quiz/add/question/${quizId}`,
      { type },
      {
        headers: getAuthHeaders(token),
      }
    );
    if (res.data.status) {
      dispatch(setCurrentDraft(res.data.data));
      return res.data;
    }
  } catch (error) {
    toast.error("Failed to add question");
    console.error(error);
  }
};

export interface QuizUpdateData {
  _id: string;
  name?: string;
  description?: string;
  creator?: string;
  coverImage?: string;
  isPrivet?: boolean;
  status?: 'active' | 'inactive' | 'draft';
  theme?: string;
  questions?: string[];
}

export const updateQuiz = async (token: string, data: QuizUpdateData, dispatch: AppDispatch) => {
  try {
    const res = await API_DOMAIN.put(`/api/v1/quiz/update/${data._id}`, data, {
      headers: getAuthHeaders(token),
    });
    if (res.data.status) {
      dispatch(setCurrentDraft(res.data.data));
    }

    return res.data;
  } catch (error) {
    toast.error("Failed to update quiz");
    console.error(error);
  }
};

export const updateQuestion = async (
  token: string,
  questionId: string,
  data: any,
  dispatch: AppDispatch
) => {
  try {
    const res = await API_DOMAIN.put(
      `/api/v1/quiz/update/question/${questionId}`,
      data,
      {
        headers: getAuthHeaders(token),
      }
    );
    console.log(res);
    if (res.data.status) {
      dispatch(updateDraftQuestion(res.data.data));
      return res.data;
    }
  } catch (error) {
    toast.error("Failed to update question");
    console.error(error);
  }
};

export const getQuizById = async (id: string, dispatch: AppDispatch) => {
  try {
    const res = await API_DOMAIN.get(`/api/v1/quiz/get/quiz/${id}`);
    if (res.data.status) {
      dispatch(setCurrentDraft(res.data.data));
      return res.data.data;
    }
  } catch (error) {
    toast.error("Something went wrong");
    console.log(error);
  }
};

export const Logout = async () => {
  try {
    const res = await API_DOMAIN.post("/api/v1/auth/logout");

    if (res.data) {
      localStorage.clear();
      return res.data;
    }
  } catch (error) {
    console.log("🚀 ~ Logout ~ error:", error);
  }
};
