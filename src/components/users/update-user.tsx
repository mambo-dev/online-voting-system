import { Role } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import useForm from "../hooks/form";
import ErrorMessage from "../utils/error";
import Input from "../utils/input";
import Radio from "../utils/radio";
import Success from "../utils/success";

type Props = {
  token: string;
  selectedUser: {
    username: string;
    role: Role | null;
    nationalId: number;
    email: string | undefined;
    user_image: string;
    phone_number: string | undefined;
  } | null;
};

export default function UpdateUser({ token, selectedUser }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const initialState = {
    username: selectedUser?.username,
    nationalId: selectedUser?.nationalId,
    role: selectedUser?.role,
  };

  const updateUser = async () => {
    try {
      const res = await axios.put(
        `/api/users/update`,
        {
          ...values,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        created,
        errors: serverErrors,
      }: {
        created: boolean | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !created) {
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
        router.reload();
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

  const { handleChange, handleSubmit, values } = useForm(
    initialState,
    updateUser
  );

  return (
    <div className="py-10 ">
      <form onSubmit={handleSubmit} className="px-1 flex flex-col gap-y-2">
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

        <div className="flex flex-col text-slate-800 py-1 gap-y-2 ">
          <p className="font-semibold">user&apos;s role</p>
          <div className="flex gap-x-2 mt-auto mb-auto">
            <Radio
              handleChange={handleChange}
              checked={values.role === "admin"}
              value="admin"
              label="admin"
              name="role"
            />
            <Radio
              handleChange={handleChange}
              checked={values.role === "user"}
              value="user"
              label="user"
              name="role"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-2 py-3 w-full rounded-lg  bg-gradient-to-tr from-amber-600 to-amber-500 focus:ring-2 focus:ring-amber-300 ring-offset-1 shadow text-white text-sm font-medium  focus:border  border-amber-300"
        >
          {loading ? "loading..." : "add user"}
        </button>
        <Success message="successfully added user" success={success} />
        <ErrorMessage errors={errors} />
      </form>
    </div>
  );
}
