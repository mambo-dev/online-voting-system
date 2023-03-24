import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Profile, Role } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { HandleError } from "../../backend-utils/types";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";
import Button from "../utils/button";
import ErrorMessage from "../utils/error";
import Input from "../utils/input";
import Modal from "../utils/Modal";
import Radio from "../utils/radio";
import Success from "../utils/success";
import TextArea from "../utils/textArea";

type Props = {
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function RegisterForElection({ user, election, token }: Props) {
  const [openRegister, setOpenRegister] = useState(false);
  return (
    <div className=" bg-gradient-to-r from-white via-slate-50 to-slate-100 h-fit w-full rounded-lg shadow p-3 flex flex-col gap-y-2">
      <p className="font-semibold text-sm">
        To participate in this elections start by registering.
      </p>
      <p className="text-sm text-slate-700 font-normal">
        Available positions ;
      </p>
      <div className="grid grid-cols-2 gap-2">
        {election?.election_positions.map((position: string, index: number) => (
          <span
            key={index}
            className="rounded-lg shadow cursor-context-menu bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-2 w-full flex items-center justify-center"
          >
            {position}
          </span>
        ))}
      </div>
      <div className="w-fit mt-auto ml-auto py-2 flex ">
        <button
          onClick={() => setOpenRegister(true)}
          className="py-2 px-4 rounded-lg bg-emerald-500 text-white font-semibold focus:ring-2 ring-offset-1 ring-emerald-300 border border-emerald-50"
        >
          register
        </button>
      </div>
      <Modal isOpen={openRegister} setIsOpen={setOpenRegister} span="max-w-xl">
        <Register election={election} token={token} user={user} />
      </Modal>
    </div>
  );
}

type RegisterProps = {
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  election: ElectionCandidatesVoters | null;
  token: string;
};
function Register({ user, election, token }: RegisterProps) {
  const [registerAs, setRegisterAs] = useState<"voter" | "candidate" | "">("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [candidateSuccess, setCandidateSuccess] = useState(false);
  const [voterSuccess, setVoterSuccess] = useState(false);
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      if (registerAs === "voter") {
        const res = await axios.post(
          `/api/elections/register?register_as=voter&&election_id=${election?.election_id}&&profile_id=${user?.Profile?.profile_id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const {
          registered,
          errors: serverErrors,
        }: {
          registered: boolean | null;
          errors: HandleError[] | [];
        } = await res.data;

        if (serverErrors.length > 0 || !registered) {
          setLoading(false);

          setErrors([...serverErrors]);
          return;
        }
        setLoading(false);
        setVoterSuccess(true);
        setErrors([]);
        setTimeout(() => {
          setVoterSuccess(false);
        }, 1000);
        setTimeout(() => {
          router.reload();
        }, 2000);
        return;
      }
      const res = await axios.post(
        `/api/elections/register?register_as=candidate&&election_id=${election?.election_id}&&profile_id=${user?.Profile?.profile_id}`,
        {
          position,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const {
        registered,
        errors: serverErrors,
      }: {
        registered: boolean | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !registered) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }
      setLoading(false);
      setCandidateSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setCandidateSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.reload();
      }, 2000);
    } catch (error: any) {
      setCandidateSuccess(false);
      setVoterSuccess(false);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (e.target.value !== "voter" && e.target.value !== "candidate") return;
    setRegisterAs(e.target.value);
  };
  return (
    <div className="w-full px-2 py-4 flex flex-col">
      <div className="flex flex-col text-slate-800 py-1 gap-y-2 ">
        <p className="font-semibold">register for this election as a </p>
        <div className="flex gap-x-2 mt-auto mb-auto">
          <Radio
            handleChange={handleChange}
            checked={registerAs === "voter"}
            value="voter"
            label="voter"
            name="registerAs"
          />
          <Radio
            handleChange={handleChange}
            checked={registerAs === "candidate"}
            value="candidate"
            label="candidate"
            name="registerAs"
          />
        </div>
      </div>
      {registerAs === "candidate" && (
        <CandidateForm
          description={description}
          position={position}
          setPosition={setPosition}
          setDescription={setDescription}
          election={election}
        />
      )}
      {registerAs === "voter" && <VoterForm />}
      {!user?.Profile && (
        <p>
          note! a profile is required to register for an election{" "}
          <Link className="text-blue-500 hover:underline" href="/profile">
            create
          </Link>
        </p>
      )}
      <div className="ml-auto w-fit mt-2">
        <Button
          disabled={!user?.Profile}
          text="submit choice"
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
      <ErrorMessage errors={errors} />
      <Success message="thank you for registering" success={voterSuccess} />
      <Success message="thank you for registering" success={candidateSuccess} />
    </div>
  );
}

type CandidateProps = {
  position: string;
  setPosition: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  election: ElectionCandidatesVoters;
};

function CandidateForm({
  position,
  description,
  setDescription,
  setPosition,
  election,
}: CandidateProps) {
  const [query, setQuery] = useState("");

  const [openQuery, setOpenQuery] = useState(false);

  const filteredValue =
    query === ""
      ? election?.election_positions
      : election?.election_positions.filter((value) =>
          value
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="relative w-full ">
        <div
          className={`flex flex-col gap-y-2   w-full text-slate-800 font-medium`}
        >
          <label className="font-semibold"> positions </label>
          <button
            onClick={() => setOpenQuery(!openQuery)}
            className="w-full py-3 px-2 inline-flex items-center justify-between rounded-lg outline-none bg-slate-50 border  border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-300 ring-offset-1 hover:border-amber-500 "
          >
            {position.length > 0 ? position : "search available position"}{" "}
            <ChevronDownIcon className="w-6 h-6" />
          </button>
        </div>

        {openQuery && (
          <div className="bg-white px-2 w-full shadow-lg py-2 flex flex-col gap-y-2 z-10 rounded max-h-48 overflow-y-auto absolute top-24">
            <input
              name="query"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              className="flex-1 outline-none border-b border-amber-200 py-2 focus:border-amber-400"
              placeholder="search available positions"
            />
            {query.length > 0 &&
              filteredValue?.map((value: string, index: number) => (
                <span
                  className="rounded-lg py-2 px-2 bg-amber-200 text-amber-900 font-bold"
                  key={index}
                  onClick={() => {
                    setPosition(value);
                    setQuery("");
                    setOpenQuery(false);
                  }}
                >
                  {value}
                </span>
              ))}
          </div>
        )}
      </div>

      <TextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        name="description"
        label="description"
      />
    </div>
  );
}

function VoterForm() {
  return (
    <div className="text-slate-800 text-sm font-medium">
      <p>congratulations vote wisely! finalise by submiting your choice</p>
    </div>
  );
}
