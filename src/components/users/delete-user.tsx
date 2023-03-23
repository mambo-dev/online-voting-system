import { Role } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import ErrorMessage from "../utils/error";
import Success from "../utils/success";

type Props = {
  token: string | null;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: {
    username: string;
    role: Role | null;
    nationalId: number;
    email: string | undefined;
    user_image: string;
    phone_number: string | undefined;
  } | null;
};

export default function DeleteUser({ token, selectedUser, setIsOpen }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const router = useRouter();
  const handleDelete = () => {
    setLoading(true);
    axios
      .delete(`/api/users/delete?user_username=${selectedUser?.username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setLoading(false);
        setSuccess(true);
        setIsOpen(false);
        router.reload();
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        error.response.data.errors && error.response.data.errors.length > 0
          ? setErrors([...error.response.data.errors])
          : setErrors([
              {
                message: "something unexpected happened try again later",
              },
            ]);
        setTimeout(() => {
          setErrors([]);
        }, 3000);
      });
  };
  return (
    <div className="flex flex-col mt-1 gap-y-3 p-6">
      <div className="font-semibold text-slate-900">
        <span>delete user</span>
      </div>
      <div className="text-red-500 font-medium">
        <p>Are you sure?</p>{" "}
      </div>
      <div className="text-sm text-slate-400">
        <p>This data will be deleted permanently and cannot be restored</p>{" "}
      </div>
      <div className="text-sm text-slate-400 flex items-center justify-end gap-x-2 font-semibold">
        <button
          onClick={handleDelete}
          className="bg-red-500 border border-red-400 text-white rounded py-2 px-4 focus:ring-1 ring-offset-1 focus:ring-red-600 "
        >
          {loading ? "loading..." : "delete"}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className=" bg-transparent border border-slate-400 rounded py-2 px-4 text-slate-700   "
        >
          cancel
        </button>
      </div>
      <ErrorMessage errors={errors} />
      <Success message="succesfully deleted" success={success} />
    </div>
  );
}
