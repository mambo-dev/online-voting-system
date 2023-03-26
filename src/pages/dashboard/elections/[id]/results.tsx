import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Profile, Result, Role } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../../../lib/prisma";
import { DecodedToken } from "../../../../backend-utils/types";
import DashboardLayout from "../../../../components/layout/dashboard";
import Button from "../../../../components/utils/button";

type Props = {
  data: Data;
};

export default function Results({ data }: Props) {
  const { token, user, results } = data;

  const publishResults = () => {};

  const isAdmin = user?.user_role === "admin";
  return (
    <div className="w-full min-h-screen py-4 px-2">
      <div className="w-full flex items-center justify-end">
        {isAdmin && (
          <div className="ml-auto w-fit">
            <Button
              text="publish results"
              onClick={() => publishResults()}
              svg={<CheckBadgeIcon className="w-5 h-5" />}
            />
          </div>
        )}
      </div>
      <div className="bg-white max-w-xl"></div>
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
  results: Result[];
};

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

  const election_id = context.query.id;

  const findElection = await prisma.election.findUnique({
    where: {
      election_id: Number(election_id),
    },
    include: {
      Candidate: {
        include: {
          candidate_profile: true,
        },
      },
      Vote: true,
    },
  });

  if (findElection?.election_status !== "closed") {
    return {
      redirect: {
        permanent: false,
        destination: `/dashboard/elections/${election_id}`,
      },
    };
  }
  const results = await prisma.result.findMany({
    where: {
      result_election: {
        election_id: findElection.election_id,
      },
    },
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        results: results,
      },
    },
  };
};

Results.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
