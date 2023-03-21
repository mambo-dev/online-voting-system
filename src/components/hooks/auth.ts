import { useRouter } from "next/router";
import axios from "axios";

export const useAuth = () => {
  const router = useRouter();

  const logout = () => {
    axios.get(`api/auth/logout`, {}).then((response) => {
      console.log(response);
      router.replace("/");
    });
  };

  return { logout };
};
