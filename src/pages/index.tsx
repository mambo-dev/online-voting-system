import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HandleError } from "../backend-utils/types";
import useForm from "../components/hooks/form";
import ErrorMessage from "../components/utils/error";
import Input from "../components/utils/input";
import Success from "../components/utils/success";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const initialState = {
    username: "",
    password: "",
  };
  const router = useRouter();
  const login = async (values: any) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/login`,
        {
          ...values,
        }
      );

      const {
        user,
        error: serverErrors,
      }: {
        user: any | null;
        error: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !user) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.push("/admin/projects");
      }, 2000);
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.error && error.response.data.error.length > 0
        ? setErrors([...error.response.data.error])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  };

  const { handleChange, handleSubmit, values } = useForm(initialState, login);
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="py-32">
        <div className="mx-auto max-w-5xl flex items-center justify-center h-96 px-2">
          <div className="relative h-full w-1/2 hidden md:flex">
            <Image alt="login banner" src="/images/login.svg" fill sizes="" />
          </div>
          <form
            className="flex z-10 md:-ml-16 flex-col h-full items-center justify-center gap-y-4 bg-white shadow rounded-lg py-10 px-8 w-full md:w-1/2"
            onSubmit={handleSubmit}
          >
            <Input
              value={values.username}
              onChange={handleChange}
              name="username"
              label="username"
            />
            <Input
              value={values.password}
              onChange={handleChange}
              name="password"
              label="password"
              type="password"
            />
            <button
              type="submit"
              className="mt-2 py-3 w-full rounded-lg  bg-gradient-to-tr from-amber-600 to-amber-500 shadow text-white text-sm font-medium focus:ring-1 focus:border ring-amber-400 border-amber-300"
            >
              {loading ? "loading..." : "login"}
            </button>
            <div className="w-fit ml-auto mt-2">
              <Link
                href="/register"
                className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer"
              >
                don&apos;t have an account?
              </Link>
            </div>
            <ErrorMessage errors={errors} />
            <Success message={`welcome ${values.username}`} success={success} />
          </form>
        </div>
      </main>
    </>
  );
}
