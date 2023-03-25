import {
  Candidate,
  Election,
  Profile,
  Role,
  Vote,
  Voter,
} from "@prisma/client";
import { format } from "date-fns";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import prisma from "../../../../lib/prisma";
import { supabase } from "../../../../lib/supabase";
import { DecodedToken } from "../../../backend-utils/types";
import AdminElectionActions from "../../../components/elections/admin-actions";
import Candidates from "../../../components/elections/candidates";
import RegisterForElection from "../../../components/elections/election-register";
import SearchCandidate from "../../../components/elections/search-cadidate";
import DashboardLayout from "../../../components/layout/dashboard";

type Props = {
  data: Data;
};

export default function ElectionPage({ data }: Props) {
  const { election, token, user } = data;
  const [openCreateElectionPanel, setOpenCreateElectionPanel] = useState(false);
  const remainingCandidates = election?.Candidate.slice(
    4,
    election.Candidate.length - 1
  ).length;
  const remainingVoters = election?.Voter.slice(
    4,
    election.Voter.length - 1
  ).length;
  const isAdmin = user?.user_role === "admin";

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-6 px-4 md:px-20 gap-2 py-10">
      <div className="  col-span-2 grid grid-cols-1 gap-2 h-fit">
        <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100 h-fit w-full rounded-lg shadow p-3 flex flex-col">
          <div className="w-full flex items-center justify-between ">
            <h1 className="font-bold text-slate-800 text-lg">
              {election?.election_name}
            </h1>
            <span
              className={`rounded-full py-1  px-4 flex items-center justify-center font-semibold ${
                election?.election_status === "open"
                  ? " text-emerald-500  "
                  : election?.election_status === "closed"
                  ? " text-red-800  "
                  : " text-amber-800  "
              }`}
            >
              {election?.election_status}
            </span>
          </div>
          <div className="flex  justify-between items-center py-2">
            <span className="text-sm font-semibold">
              start date:{" "}
              <p className="font-medium">
                {format(
                  new Date(`${election?.election_start_date}`),
                  "MM/dd/yyyy"
                )}
              </p>
            </span>
            <span className="text-sm font-semibold">
              closing date:{" "}
              <p className="font-medium">
                {format(
                  new Date(`${election?.election_end_date}`),
                  "MM/dd/yyyy"
                )}
              </p>
            </span>
          </div>
          <div className="flex py-2 font-medium  ">
            <p className="first-letter:uppercase">
              {election?.election_desription}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 py-2 font-medium">
            <div className="col-span-1">
              <label className="text-slate-800 font-semibold">candidates</label>
            </div>
            <div className="col-span-3 flex -space-x-2 overflow-hidden">
              {election?.Candidate &&
                election.Candidate.slice(0, 4).map((candidate) => {
                  return (
                    <div
                      key={candidate.candidate_id}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                    >
                      <Image
                        src={
                          candidate.candidate_profile.profile_image &&
                          candidate.candidate_profile.profile_image.length >
                            0 &&
                          candidate.candidate_profile.profile_image.split(
                            "es/"
                          )[1] !== "undefined"
                            ? candidate.candidate_profile.profile_image
                            : "/images/avatar.png"
                        }
                        alt="profile image"
                        width={50}
                        height={50}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              {remainingCandidates && remainingCandidates > 0 && (
                <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-white shadow-lg text-slate-800 font-bold">
                  +{remainingCandidates}
                </span>
              )}
            </div>
            <div className="col-span-1">
              <label className="text-slate-800 font-semibold">voters</label>
            </div>
            <div className="col-span-3 flex -space-x-2 overflow-hidden">
              {election?.Voter &&
                election.Voter.slice(0, 4).map((voter) => {
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
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              {remainingVoters && remainingVoters > 0 && (
                <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-white shadow-lg text-slate-800 font-bold">
                  +{remainingVoters}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/elections/${election.election_id}/results`}
            className="text-blue-500 w-fit ml-auto mt-2 hover:underline"
          >
            results
          </Link>
        </div>
        <RegisterForElection election={election} token={token} user={user} />
        {isAdmin && (
          <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100 h-fit w-full rounded-lg shadow p-3 flex flex-col">
            <p>admin can delete or edit the elections details</p>
            <AdminElectionActions
              user={user}
              token={token}
              election={election}
            />
          </div>
        )}
      </div>
      <div className=" col-span-4 flex flex-col gap-y-2 items-center pb-10">
        <Candidates election={election} token={token} user={user} />
      </div>
    </div>
  );
}

type Data = {
  token: string;
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  election: ElectionCandidatesVoters;
};

export type ElectionCandidatesVoters =
  | Election & {
      Candidate: (Candidate & {
        candidate_profile: Profile;
      })[];
      Voter: (Voter & {
        voter_profile: Profile;
      })[];
      Vote: (Vote & {
        vote_candidate: Candidate;
        vote_voter: Voter;
      })[];
    };

//@ts-ignore
export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const { req } = context;

  const access_token = req.cookies.access_token;
  if (!access_token || access_token.trim() === "") {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const decodedToken: DecodedToken = jwtDecode(access_token);

  if (decodedToken.exp < Date.now() / 1000) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const loggedInUser = await prisma.user.findUnique({
    where: {
      user_id: decodedToken.user_id,
    },
    select: {
      Profile: true,
      user_national_id: true,
      user_password: false,
      user_id: true,
      user_role: true,
      user_username: true,
    },
  });

  const { id } = context.query;

  const election = await prisma.election.findUnique({
    where: {
      election_id: Number(id),
    },
    include: {
      Vote: {
        include: {
          vote_candidate: true,
          vote_voter: true,
        },
      },
      Candidate: {
        include: { candidate_profile: true },
      },
      Voter: {
        include: { voter_profile: true },
      },
    },
  });

  if (!election) {
    return {
      redirect: {
        permanent: false,
        destination: "/dashboard/elections",
      },
    };
  }

  const editedElections = {
    ...election,
    Candidate: election?.Candidate.map((candidate) => {
      const { data } = supabase.storage
        .from("upload-images")
        .getPublicUrl(`${candidate.candidate_profile.profile_image}`);
      return {
        ...candidate,
        candidate_profile: {
          ...candidate.candidate_profile,
          profile_image: data.publicUrl,
        },
      };
    }),
    Voter: election?.Voter.map((voter) => {
      const { data } = supabase.storage
        .from("upload-images")
        .getPublicUrl(`${voter.voter_profile.profile_image}`);
      return {
        ...voter,
        voter_profile: {
          ...voter.voter_profile,
          profile_image: data.publicUrl,
        },
      };
    }),
  };

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        election: JSON.parse(JSON.stringify(editedElections)),
      },
    },
  };
};

ElectionPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
