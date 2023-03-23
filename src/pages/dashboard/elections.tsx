import { Election, Profile, Role } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import ElectionsComponent from "../../components/elections/elections";
import DashboardLayout from "../../components/layout/dashboard";
import Button from "../../components/utils/button";

type Props = {
  data: Data;
};

export default function Elections({ data }: Props) {
  const { elections, token, user } = data;

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
                  d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
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
        <ElectionsComponent />
      )}
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
  elections: Election[];
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

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        elections,
      },
    },
  };
};

Elections.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
