import { Election, Profile, Role, User } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import { getHours } from "date-fns";
import Link from "next/link";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

type Props = {
  data: Data;
};

export default function Home({ data }: Props) {
  const { electionsAnalysis, token, user } = data;

  const currentTime = new Date();
  const hour = getHours(currentTime);
  return (
    <div className="w-full flex flex-col py-4">
      <div className="grid grid-cols-1 md:grid-cols-6 py-4 px-2">
        <div className="col-span-2 bg-white shadow rounded-lg py-2 px-2 h-full flex items-center">
          <div className="w-full sm:w-3/4 text-left flex items-start justify-start flex-col gap-y-2 ">
            <h1 className="text-xl font-bold text-slate-700">
              {hour < 12
                ? `Good morning ${user?.user_username}`
                : hour < 18
                ? `Good afternoon ${user?.user_username}`
                : `Good evening ${user?.user_username}`}
            </h1>
            <p className="text-slate-700">
              {electionsAnalysis.totalUpcomingElections > 0
                ? `you have ${electionsAnalysis.totalUpcomingElections}`
                : "you have no upcoming elections"}
            </p>
            <Link
              href="/dashboard/elections"
              className="text-blue-500 hover:underline group flex items-center justify-center gap-x-1"
            >
              view all elections{" "}
              <ArrowLongRightIcon className="w-4 h-4 group-hover:animate-bounce " />
            </Link>
          </div>
          <div className="relative hidden sm:flex  h-[150px]">
            <Image
              alt="welcome"
              src="/images/welcome.svg"
              width={100}
              height={100}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className=""></div>
        <div className=""></div>
        <div className=""></div>
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
