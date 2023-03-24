import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";
import useForm from "../hooks/form";
import DatePickerComponent from "../utils/date-picker";
import ErrorMessage from "../utils/error";
import Input from "../utils/input";
import Positions from "../utils/positions";
import Radio from "../utils/radio";
import Success from "../utils/success";
import TextArea from "../utils/textArea";

type Props = {
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function UpdateElections({ election, token }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(`${election?.election_start_date}`)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(`${election?.election_end_date}`)
  );

  const hasPositions =
    election?.election_positions && election?.election_positions.length > 0;
  const [positions, setPositions] = useState<string[]>(
    hasPositions ? election.election_positions : []
  );
  const router = useRouter();

  const initialState = {
    description: election?.election_desription,
    name: election?.election_name,
    status: election?.election_status,
  };

  const handleUpdate = async (values: any) => {
    setLoading(true);
  };

  const { handleChange, handleSubmit, values } = useForm(
    initialState,
    handleUpdate
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
      <ErrorMessage errors={errors} />
      <Success message="succesfully created election" success={success} />
    </form>
  );
}
