import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../backend-utils/types";
import useForm from "../components/hooks/form";
import axios from "axios";
import Image from "next/image";
import ErrorMessage from "../components/utils/error";
import Success from "../components/utils/success";
import Link from "next/link";
import Input from "../components/utils/input";
import Radio from "../components/utils/radio";
import { Role } from "@prisma/client";

type Props = {};

export default function Register({}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const initialState = {
    username: "",
    password: "",
    confirmPassword: "",
    nationalId: "",
  };
  const router = useRouter();
  const login = async (values: any) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(`api/auth/signup`, {
        ...values,
      });

      const {
        created,
        errors: serverErrors,
      }: {
        created: boolean;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !created) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }

      const login = await axios.post(`api/auth/login`, {
        ...values,
      });

      const {
        loggedin,
        errors: loginErrors,
      }: {
        loggedin: {
          user_id: number;
          user_username: string;
          user_national_id: number;
          user_role: Role | null;
        } | null;
        errors: HandleError[] | [];
      } = await login.data;

      if (loginErrors.length > 0 || !loggedin) {
        setLoading(false);

        setErrors([...loginErrors]);
        return;
      }

      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
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
    <div className="w-full py-32">
      <div className="mx-auto max-w-5xl flex items-center justify-center h-96 px-2">
        <div className="relative h-full w-1/2 hidden md:flex mt-32">
          <Image alt="login banner" src="/images/register.svg" fill sizes="" />
        </div>
        <form
          className="flex z-10 md:-ml-16 mt-20 flex-col h-fit items-center justify-center gap-y-4 bg-white shadow rounded-lg py-10 px-2 md:px-8  w-full md:w-1/2"
          onSubmit={handleSubmit}
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              value={values.username}
              onChange={handleChange}
              name="username"
              label="username"
            />
            <Input
              value={values.nationalId}
              onChange={handleChange}
              name="nationalId"
              label="national id"
            />
          </div>

          <Input
            value={values.password}
            onChange={handleChange}
            name="password"
            label="password"
            type="password"
          />
          <Input
            value={values.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            label="confirm password"
            type="password"
          />

          <button
            type="submit"
            className="mt-2 py-3 w-full rounded-lg  bg-gradient-to-tr from-amber-600 to-amber-500 focus:ring-2 focus:ring-amber-300 ring-offset-1 shadow text-white text-sm font-medium  focus:border  border-amber-300"
          >
            {loading ? "loading..." : "sign up"}
          </button>
          <div className="w-fit ml-auto mt-2">
            <Link
              href="/"
              className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer"
            >
              already have an account? login
            </Link>
          </div>
          <ErrorMessage errors={errors} />
          <Success message={`welcome ${values.username}`} success={success} />
        </form>
      </div>
    </div>
  );
}
