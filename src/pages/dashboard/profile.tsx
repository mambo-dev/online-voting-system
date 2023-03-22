import { Profile as ProfileType, Role, User } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import CreateProfile from "../../components/profile/create-profile";
import Button from "../../components/utils/button";

type Props = {
  data: Data;
};

export default function Profile({ data }: Props) {
  const { token, user } = data;

  if (!user?.Profile) {
    return <CreateProfile token={token} />;
  }
  return <div className="w-full ">view and update profile</div>;
}

type Data = {
  token: string;
  user: {
    Profile: ProfileType | null;
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

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
