import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Profile, Role } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ElectionsWithUsers, truncate } from "../../pages/dashboard/elections";
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
  elections: ElectionsWithUsers[];
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
  election: ElectionsWithUsers;
};

function Election({ election }: ElectionProps) {
  const remainingCandidates = election.Candidate.slice(
    5,
    election.Candidate.length - 1
  ).length;
  const remainingVoters = election.Voter.slice(
    5,
    election.Voter.length - 1
  ).length;
  return (
    <div className="w-full h-fit bg-white shadow rounded-lg border border-slate-300 py-2 px-2">
      <div className="w-full flex items-center justify-between">
        <h1 className="font-bold text-slate-800 text-lg">
          {election.election_name}
        </h1>
        <span
          className={`rounded-full py-1 px-4 flex items-center justify-center font-semibold 
        ${
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
      <div className="flex justify-between items-center py-2">
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
      <div className="flex py-2 font-medium">
        <p className="first-letter:uppercase">
          {truncate(election.election_desription, 65)}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 py-2 font-medium">
        <div className="col-span-1">
          <label className="text-slate-800 font-semibold">candidates</label>
        </div>
        <div className="col-span-3 flex -space-x-2 overflow-hidden">
          {election.Candidate &&
            election.Candidate.slice(0, 5).map((candidate) => {
              return (
                <div
                  key={candidate.candidate_id}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                >
                  <Image
                    src={
                      candidate.candidate_profile.profile_image &&
                      candidate.candidate_profile.profile_image.length > 0 &&
                      candidate.candidate_profile.profile_image.split(
                        "es/"
                      )[1] !== "undefined"
                        ? candidate.candidate_profile.profile_image
                        : "/images/avatar.png"
                    }
                    alt="profile image"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full"
                  />
                </div>
              );
            })}
          {remainingCandidates > 0 && (
            <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-white shadow-lg text-slate-800 font-bold">
              +{remainingCandidates}
            </span>
          )}
        </div>
        <div className="col-span-1">
          <label className="text-slate-800 font-semibold">voters</label>
        </div>
        <div className="col-span-3 flex -space-x-2 overflow-hidden">
          {election.Voter &&
            election.Voter.slice(0, 5).map((voter) => {
              return (
                <div
                  key={voter.voter_id}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                >
                  <Image
                    src={
                      voter.voter_profile.profile_image &&
                      voter.voter_profile.profile_image.length > 0 &&
                      voter.voter_profile.profile_image.split("es/")[1] !==
                        "undefined"
                        ? voter.voter_profile.profile_image
                        : "/images/avatar.png"
                    }
                    alt="profile image"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full"
                  />
                </div>
              );
            })}
          {remainingVoters > 0 && (
            <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-white shadow-lg text-slate-800 font-bold">
              +{remainingVoters}
            </span>
          )}
        </div>
      </div>

      <div className="ml-auto mt-2 w-fit ">
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
