import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import useForm from "../hooks/form";
import Input from "../utils/input";
import Radio from "../utils/radio";

type Props = {
  token: string;
};

export default function AddUser({}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const initialState = {
    username: "",
    password: "",
    nationalId: "",
    role: "",
  };

  const createUser = async () => {};

  const { handleChange, handleSubmit, values } = useForm(
    initialState,
    createUser
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
        <Input
          value={values.password}
          onChange={handleChange}
          name="password"
          label="password"
        />
        <div className="flex flex-col py-1 gap-y-2 ">
          <p className="font-semibold">
            status (open by default when creating new case)
          </p>
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
          {loading ? "loading..." : "sign up"}
        </button>
      </form>
    </div>
  );
}
