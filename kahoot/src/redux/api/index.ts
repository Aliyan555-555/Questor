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
  }
};


const UNSPLASH_ACCESS_KEY = "_4NGbOJApxtjkhRfOvizpz4x1N5r1imh-mXQezsfwUE";
const PEXELS_ACCESS_KEY = "h7DaOpkVtxntbBxd7VRgNgYavDL1XBpdMa1NdnEPFmUzMUWizdcPo06c";

export const FetchUnsplashImages = async (
  query: string = "",
  page: number = 1,
  perPage: number = 30,
  isPopular: boolean = false
): Promise<any[]> => {
  const cacheKey = `${isPopular ? "popular" : query}-${page}`;
  const cache =
    FetchUnsplashImages.cache || (FetchUnsplashImages.cache = new Map());

  if (cache.has(cacheKey)) {
    console.log("Serving from cache:", cacheKey);
    return cache.get(cacheKey);
  }

  try {
    const endpoint = isPopular
      ? "https://api.unsplash.com/photos" // Fetch popular images
      : "https://api.unsplash.com/search/photos"; // Fetch search results

    const params = isPopular
      ? { page, per_page: perPage }
      : { query, page, per_page: perPage };

    const response = await axios.get(endpoint, {
      params,
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`, // Ensure this key is properly set in your environment
      },
    });

    // Monitor rate limit headers
    console.log("Rate Limit:", response.headers["x-ratelimit-limit"]);
    console.log("Remaining Requests:", response.headers["x-ratelimit-remaining"]);

    const results = isPopular ? response.data : response.data.results || [];
    cache.set(cacheKey, results); // Cache the results
    return results;
  } catch (error: any) {
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
      "https://api.pexels.com/v1/" +
        (isPopular ? "curated" : "search"),
      {
        params,
        headers: {
          Authorization: PEXELS_ACCESS_KEY,
        },
      }
    );

    return response.data.photos.map((img: any) => ({
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