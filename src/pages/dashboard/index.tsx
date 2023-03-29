import {
  Candidate,
  Election,
  Profile,
  Result,
  Role,
  User,
} from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import { formatRelative, getHours, subDays } from "date-fns";
import Link from "next/link";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Display from "../../components/dashboard/display";
import GraphDisplay from "../../components/dashboard/graph";
import { supabase } from "../../../lib/supabase";

type Props = {
  data: Data;
};

export default function Home({ data }: Props) {
  const { electionsAnalysis, token, user } = data;

  const currentTime = new Date();
  const hour = getHours(currentTime);
  console.log(electionsAnalysis.latestElection);
  return (
    <div className="w-full flex flex-col py-4">
      <div className="grid grid-cols-1 md:grid-cols-9 py-4 px-2 gap-2 h-[250px] ">
        <Display
          className="col-span-3 bg-white shadow rounded-lg py-2 px-2 h-full flex items-center"
          title={
            hour < 12
              ? `Good morning ${user?.user_username}`
              : hour < 18
              ? `Good afternoon ${user?.user_username}`
              : `Good evening ${user?.user_username}`
          }
          imageLink=""
          link="/dashboard/elections"
          secondaryTitle={
            electionsAnalysis.totalUpcomingElections > 0
              ? `you have ${electionsAnalysis.totalUpcomingElections} upcoming elections`
              : "you have no upcoming elections"
          }
          tertiaryTitle="view all elections"
        />
        <Display
          number
          className="w-full col-span-2 bg-white shadow rounded-lg py-2 px-2 h-full flex items-center"
          title="Total elections"
          secondaryTitle={electionsAnalysis.totalElections}
          tertiaryTitle={`since ${formatRelative(
            subDays(new Date(), 3),
            new Date()
          )}`}
          imageLink="/images/totals.svg"
        />
        <Display
          number
          className="w-full col-span-2 bg-white shadow rounded-lg py-2 px-2 h-full flex items-center"
          title="open elections"
          secondaryTitle={electionsAnalysis.totalOpenElections}
          tertiaryTitle={`since ${formatRelative(
            subDays(new Date(), 3),
            new Date()
          )}`}
          imageLink="/images/open.svg"
        />
        <Display
          number
          className="w-full col-span-2 bg-white shadow rounded-lg py-2 px-2 h-full flex items-center"
          title="closed elections"
          secondaryTitle={electionsAnalysis.totalClosedElections}
          tertiaryTitle={`since ${formatRelative(
            subDays(new Date(), 3),
            new Date()
          )}`}
          imageLink="/images/closed.svg"
        />
      </div>
      <div className="relative w-full grid grid-cols-1 md:grid-cols-9 py-4 md:py-0 px-2 gap-2 ">
        <GraphDisplay elections={electionsAnalysis.elections} />
        <div className="w-full bg-white rounded-lg shadow text-center">
          <h1>recent election winners</h1>
        </div>
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
  electionsAnalysis: {
    elections: ElectionsResults;
    latestElection:
      | {
          candidate_id: number;
          candidate_name: string;
          candidate_is_winner: boolean;
          candidate_profile_picture: string;
          candidate_position: string;
        }[]
      | undefined;
    totalElections: number;
    totalOpenElections: number;
    totalClosedElections: number;
    totalUpcomingElections: number;
  };
};

export type ElectionsResults = (Election & {
  Result: (Result & {
    result_candidate: Candidate & {
      candidate_profile: Profile;
    };
  })[];
})[];

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
    orderBy: {
      election_end_date: "desc",
    },
    include: {
      Result: {
        include: {
          result_candidate: {
            include: {
              candidate_profile: true,
            },
          },
        },
      },
      Voter: {
        include: {
          voter_profile: true,
        },
      },
    },
  });

  const totalElections = elections.length;
  const totalOpenElections = elections.filter(
    (election) => election.election_status === "open"
  ).length;
  const totalClosedElections = elections.filter(
    (election) => election.election_status === "closed"
  ).length;
  const totalUpcomingElections = elections.filter(
    (election) => election.election_status === "upcoming"
  ).length;

  const latestElection = elections[0]?.Result.map((results) => {
    const { data } = supabase.storage
      .from("upload-images")
      .getPublicUrl(
        `${results.result_candidate.candidate_profile.profile_image}`
      );
    return {
      candidate_id: results.result_candidate.candidate_id,
      candidate_name:
        results.result_candidate.candidate_profile.profile_full_name,
      candidate_is_winner: results.result_position_winner,
      candidate_profile_picture: data.publicUrl,
      candidate_position: results.result_position,
    };
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        electionsAnalysis: {
          elections: JSON.parse(JSON.stringify(elections)),
          totalElections,
          totalOpenElections,
          totalClosedElections,
          totalUpcomingElections,
          latestElection,
        },
      },
    },
  };
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
