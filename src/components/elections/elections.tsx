import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Election, Profile, Role } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { truncate } from "../../pages/dashboard/elections";
import Button from "../utils/button";

type Props = {
  token: string;
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  elections: Election[];
};

export default function ElectionsComponent({ elections, user, token }: Props) {
  return (
    <div className="w-full  grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-y-4  md:gap-x-4 ">
      {elections.map((election) => {
        return <Election key={election.election_id} election={election} />;
      })}
    </div>
  );
}

type ElectionProps = {
  election: Election;
};

function Election({ election }: ElectionProps) {
  return (
    <div className="w-full h-fit  bg-white shadow rounded-lg border border-slate-300 py-2 px-2">
      <div className="w-full flex items-center justify-between ">
        <h1 className="font-bold text-slate-800 text-lg">
          {election.election_name}
        </h1>
        <span
          className={`rounded-full py-1  px-4 flex items-center justify-center font-semibold ${
            election.election_status === "open"
              ? "bg-emerald-300 text-emerald-900 border border-emerald-400"
              : election.election_status === "closed"
              ? "bg-red-300 text-red-800 border border-red-400"
              : "bg-amber-300 text-amber-800 border border-amber-400"
          }`}
        >
          {election.election_status}
        </span>
      </div>
      <div className="flex  justify-between items-center py-2">
        <span className="text-sm font-semibold">
          start date:{" "}
          <p className="font-medium">
            {format(new Date(`${election.election_start_date}`), "MM/dd/yyyy")}
          </p>
        </span>
        <span className="text-sm font-semibold">
          closing date:{" "}
          <p className="font-medium">
            {format(new Date(`${election.election_end_date}`), "MM/dd/yyyy")}
          </p>
        </span>
      </div>
      <div className="flex py-2 font-medium  ">
        <p className="first-letter:uppercase">
          {truncate(election.election_desription, 65)}
        </p>
      </div>
      <div className="ml-auto mt-auto w-fit">
        <Link href={`/dashboard/elections/${election.election_id}`}>
          <Button
            expand
            svg={
              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-blue-500 hover:text-blue-600 focus:text-blue-600" />
            }
          />
        </Link>
      </div>
    </div>
  );
}
