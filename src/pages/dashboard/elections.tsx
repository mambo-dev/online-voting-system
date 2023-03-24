import {
  Candidate,
  Election,
  Profile,
  Role,
  Vote,
  Voter,
} from "@prisma/client";
import axios from "axios";
import { isAfter, sub } from "date-fns";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import prisma from "../../../lib/prisma";
import { supabase } from "../../../lib/supabase";
import { DecodedToken } from "../../backend-utils/types";
import ElectionsComponent from "../../components/elections/elections";
import NewElection from "../../components/elections/new-election";
import DashboardLayout from "../../components/layout/dashboard";
import Button from "../../components/utils/button";
import SidePanel from "../../components/utils/sidepanel";
import { ElectionCandidatesVoters } from "./elections/[id]";

type Props = {
  data: Data;
};

export default function Elections({ data }: Props) {
  const { elections, token, user } = data;
  const [openCreateElectionPanel, setOpenCreateElectionPanel] = useState(false);
  const isAdmin = user?.user_role === "admin";
  const isElectionClosed = (election: Election) => {
    if (!election) return false;
    return new Date() >= election?.election_end_date;
  };

  const closeElection = async (election: Election) => {
    try {
      await axios.get(
        `/api/elections/close-election?election_id=${election?.election_id}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  setInterval(() => {
    elections.forEach((election) => {
      if (election.election_status === "open" && isElectionClosed(election)) {
        //@ts-ignore
        const timeRemaining = Math.abs(election.election_end_date - new Date());

        setTimeout(() => closeElection(election), timeRemaining);
      }
    });
  }, 10000);
  return (
    <div className="w-full min-h-screen">
      {elections.length <= 0 ? (
        user?.user_role === "admin" ? (
          <div className="mx-auto  py-32">
            <div className="flex flex-col gap-y-2 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-slate-700 font-light"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
              <h1 className="text-xl font-semibold">No Elections</h1>
              <p className="text-slate-700 font-medium">
                Get started by creating an election
              </p>

              <div className="w-fit">
                <Button
                  text="New Election"
                  onClick={() => setOpenCreateElectionPanel(true)}
                  svg={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto  py-32">
            <div className="flex flex-col gap-y-2 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-slate-700 font-light"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13.5H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>

              <h1 className="text-xl font-semibold">No Elections</h1>
              <p className="text-slate-700 font-medium">
                No current elections being held
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="w-full h-full flex flex-col px-4 gap-y-4 py-5">
          {isAdmin && (
            <div className="ml-auto w-fit">
              <Button
                text="new election"
                onClick={() => setOpenCreateElectionPanel(true)}
                svg={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                }
              />
            </div>
          )}
          <ElectionsComponent elections={elections} token={token} user={user} />
        </div>
      )}

      <SidePanel
        open={openCreateElectionPanel}
        setOpen={setOpenCreateElectionPanel}
        span="max-w-3xl"
        title="New Election"
      >
        <NewElection token={token} />
      </SidePanel>
    </div>
  );
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
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
  elections: ElectionsWithUsers[];
};

export type ElectionsWithUsers = Election & {
  Vote: Vote[];
  Candidate: (Candidate & {
    candidate_profile: Profile;
  })[];
  Voter: (Voter & {
    voter_profile: Profile;
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

  const elections = await prisma.election.findMany({
    include: {
      Candidate: {
        include: {
          candidate_profile: true,
        },
      },
      Vote: true,
      Voter: {
        include: {
          voter_profile: true,
        },
      },
    },
  });

  const editedElections = elections.map((election) => {
    return {
      ...election,
      Candidate: election.Candidate.map((candidate) => {
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
      Voter: election.Voter.map((voter) => {
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
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        elections: JSON.parse(JSON.stringify(editedElections)),
      },
    },
  };
};

Elections.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
