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
import React, { useState } from "react";
import prisma from "../../../../lib/prisma";
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

  const isAdmin = user?.user_role === "admin";

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-6 px-4 md:px-20 gap-2 py-10">
      <div className="col-span-2 grid grid-cols-1 gap-2 ">
        <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100 h-48 w-full rounded-lg shadow p-3 flex flex-col">
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
      <div className="col-span-4 flex flex-col gap-y-2 items-center">
        <SearchCandidate election={election} token={token} />
        <Candidates election={election} token={token} />
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
  | (Election & {
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
    })
  | null;

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

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        election: JSON.parse(JSON.stringify(election)),
      },
    },
  };
};

ElectionPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
