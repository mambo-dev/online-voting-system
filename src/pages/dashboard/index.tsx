import { Election, Profile, Role, User } from "@prisma/client";
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

type Props = {
  data: Data;
};

export default function Home({ data }: Props) {
  const { electionsAnalysis, token, user } = data;

  const currentTime = new Date();
  const hour = getHours(currentTime);
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
    elections: Election[];
    totalElections: number;
    totalOpenElections: number;
    totalClosedElections: number;
    totalUpcomingElections: number;
  };
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

  const elections = await prisma.election.findMany({});

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
        },
      },
    },
  };
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
