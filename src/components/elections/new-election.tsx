import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import useForm from "../hooks/form";
import DatePickerComponent from "../utils/date-picker";
import Input from "../utils/input";
import Positions from "../utils/positions";
import Radio from "../utils/radio";
import TextArea from "../utils/textArea";

type Props = {
  token: string;
};

export default function NewElection({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [positions, setPositions] = useState<string[]>([]);
  const router = useRouter();
  const initialState = {
    description: "",
    end_date: "",
    name: "",
    start_date: "",
    status: "",
  };

  const createElection = async (values: any) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(
        `/api/elections/create`,
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
      setLoading(false);
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
    createElection
  );

  return (
    <form onSubmit={handleSubmit} className="px-1 flex flex-col gap-y-2 py-10">
      <Input
        value={values.name}
        onChange={handleChange}
        name="name"
        label="election title"
      />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
        <DatePickerComponent
          date={startDate}
          setDate={setStartDate}
          label="start date"
        />
        <DatePickerComponent
          date={endDate}
          setDate={setEndDate}
          label="end date"
        />
      </div>
      <TextArea
        value={values.description}
        onChange={handleChange}
        name="description"
        label="description"
      />
      <Positions positions={positions} setPositions={setPositions} />
      <div className="flex flex-col text-slate-800 py-1 gap-y-2 ">
        <p className="font-semibold">election status</p>
        <div className="flex gap-x-2 mt-auto mb-auto">
          <Radio
            handleChange={handleChange}
            checked={values.status === "open"}
            value="open"
            label="open"
            name="status"
          />
          <Radio
            handleChange={handleChange}
            checked={values.status === "closed"}
            value="closed"
            label="closed"
            name="status"
          />
          <Radio
            handleChange={handleChange}
            checked={values.status === "upcoming"}
            value="upcoming"
            label="up coming"
            name="status"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-2 py-3 w-full rounded-lg  bg-gradient-to-tr from-amber-600 to-amber-500 focus:ring-2 focus:ring-amber-300 ring-offset-1 shadow text-white text-sm font-medium  focus:border  border-amber-300"
      >
        {loading ? "loading..." : "create election"}
      </button>
    </form>
  );
}
