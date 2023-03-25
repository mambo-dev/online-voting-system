import { Profile, Role } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../../../../lib/prisma";
import { DecodedToken } from "../../../../backend-utils/types";
import DashboardLayout from "../../../../components/layout/dashboard";

type Props = {};

export default function Results({}: Props) {
  return (
    <div className="w-full min-h-screen py-24">
      <div className="max-w-lg  bg-white shadow rounded-lg mx-auto flex items-center ">
        <div className="w-[50%] py-10 gap-y-2 h-[350px] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100  rounded-lg shadow p-3 flex flex-col items-center justify-center">
          <p>Michael Mambo</p>
          <div className="w-44 h-44 rounded-full bg-slate-50 shadow flex flex-col items-center justify-center">
            <p className="text-[50px] font-bold">40</p>
            <p className="text-sm font-medium">of 50</p>
          </div>
          <p>this person had the highest votes</p>
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

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
      },
    },
  };
};

Results.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
