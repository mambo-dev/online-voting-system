import { Profile as ProfileType, Role, User } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useEffect } from "react";
import prisma from "../../../lib/prisma";
import { DecodedToken } from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import CreateProfile from "../../components/profile/create-profile";
import Button from "../../components/utils/button";
import { supabase } from "../../../lib/supabase";
import Cookies from "js-cookie";
import ViewProfile from "../../components/profile/view-profile";

type Props = {
  data: Data;
};

export default function Profile({ data }: Props) {
  const { token, user, url: imageUrl } = data;

  useEffect(() => {
    Cookies.set("profile", imageUrl);
  }, [imageUrl]);

  if (!user?.Profile) {
    return <CreateProfile token={token} />;
  }

  return (
    <div className="container mx-auto py-4 min-h-screen flex flex-row gap-x-4 px-4 ">
      <div className="hidden md:flex flex-col items-center justify-between gap-x-4 relative w-[30%] py-2  px-4 h-fit bg-white shadow rounded-lg">
        <div className="rounded-full  w-40 h-40 left-4 top-24 bottom-0">
          <Image
            src={
              imageUrl && imageUrl?.length > 0 ? imageUrl : "/images/avatar.png"
            }
            alt="profile image"
            width={200}
            height={200}
            className="rounded-full w-full h-full"
          />
        </div>
        <div className="mx-auto w-fit py-4 ">
          <h1 className="text-2xl text-center font-semibold text-slate-800">
            Welcome {`${user.Profile.profile_full_name.split(" ")[0]}`}
          </h1>
          <p className="text-sm text-center  font-medium text-slate-700">
            your profile is filled with important contact information that can
            be used to identify you{" "}
          </p>
        </div>
      </div>
      <ViewProfile profile={user.Profile} token={token} />
    </div>
  );
}

type Data = {
  token: string;
  url: string;
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

  const { data } = supabase.storage
    .from("upload-images")
    .getPublicUrl(`${loggedInUser?.Profile?.profile_image}`);

  const { publicUrl } = data;

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        url: publicUrl,
      },
    },
  };
};

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
