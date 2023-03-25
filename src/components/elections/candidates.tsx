import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Candidate as CandidateType, Profile, Role } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { truncate } from "../../pages/dashboard/elections";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";

type Props = {
  election: ElectionCandidatesVoters;
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  token: string;
};

export default function Candidates({ election, token, user }: Props) {
  const { Candidate: candidates } = election;
  return (
    <div className="flex flex-col gap-y-2 w-full">
      {candidates.map((candidate) => (
        <Candidate
          key={candidate.candidate_id}
          candidate={candidate}
          elections={election}
          user={user}
          token={token}
        />
      ))}
    </div>
  );
}

function Candidate({
  candidate,
  elections,
  user,
}: {
  candidate: CandidateType & {
    candidate_profile: Profile;
  };
  elections: ElectionCandidatesVoters;
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  token: string;
}) {
  const totalCandidateVotes = elections.Vote.map((vote) => {
    return vote.vote_candidate_id === candidate.candidate_id;
  }).length;
  const totalVotes = elections.Vote.length;

  const candidatePercentage =
    totalCandidateVotes > 0 ? (totalCandidateVotes / totalVotes) * 100 : 0;

  const isRegistered = elections.Voter.some(
    (voter) => voter.voter_profile.profile_user_id === user?.user_id
  );

  async function handleVote() {}

  return (
    <div className="py-2 bg-white rounded-lg shadow w-full flex px-2 flex-col">
      <div className="w-full flex items-center justify-start gap-x-4">
        <div className="h-14 w-14 rounded-full ring-2 ring-white">
          <Image
            src={
              candidate.candidate_profile.profile_image &&
              candidate.candidate_profile.profile_image.length > 0 &&
              candidate.candidate_profile.profile_image.split("es/")[1] !==
                "undefined"
                ? candidate.candidate_profile.profile_image
                : "/images/avatar.png"
            }
            alt="profile image"
            width={50}
            height={50}
            className="rounded-full w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center flex-col gap-y-2 justify-start text-left">
          <div className="w-full flex items-center justify-center gap-x-3">
            <h1 className="text-slate-700 font-semibold">
              {candidate.candidate_profile.profile_full_name}
            </h1>
            <span className="py-1 px-4 bg-green-100 rounded-full text-sm text-slate-700 font-medium ">
              {candidate.candidate_vying_position}
            </span>
          </div>
          <span className="flex items-center gap-x-2  mr-auto">
            <EnvelopeIcon className="w-4 h-4 text-green-400" />{" "}
            {candidate.candidate_profile.profile_email}
          </span>
        </div>
      </div>
      <div className="w-full mt-2">
        <p className="first-letter:uppercase  text-slate-900">
          {truncate(candidate.candidate_vying_description, 300)}{" "}
        </p>
      </div>
      <VoteBar percentage={candidatePercentage} />
      {isRegistered ? (
        <div className="w-fit mt-2 ml-auto">
          <button
            onClick={handleVote}
            className="w-full py-2 inline-flex items-center justify-center rounded-lg gap-x-2 text-white font-semibold px-4 bg-green-400 focus:border border-green-300 focus:ring-2 ring-green-400 ring-offset-1 "
          >
            Vote
          </button>
        </div>
      ) : (
        <div className="w-fit mt-2 ml-auto">
          <button
            disabled
            className="w-full  py-2 inline-flex items-center justify-center rounded-lg gap-x-2 text-white font-semibold px-4 bg-red-400 focus:border border-red-300 focus:ring-2 ring-red-400 ring-offset-1 "
          >
            register first to vote
          </button>
        </div>
      )}
    </div>
  );
}

function VoteBar({ percentage }: { percentage: number }) {
  let bgColor = "";
  if (percentage >= 70) {
    bgColor = "bg-green-500";
  } else if (percentage >= 30) {
    bgColor = "bg-yellow-500";
  } else {
    bgColor = "bg-red-500";
  }

  return (
    <div
      className={`h-2 rounded-full ${bgColor}`}
      style={{ width: `${percentage}%` }}
    />
  );
}
