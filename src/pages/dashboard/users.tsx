import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Profile, Role, User } from "@prisma/client";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useState } from "react";
import prisma from "../../../lib/prisma";
import { supabase } from "../../../lib/supabase";
import { DecodedToken } from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import AddUser from "../../components/users/add-user";
import UpdateUser from "../../components/users/update-user";
import Button from "../../components/utils/button";
import SidePanel from "../../components/utils/sidepanel";
import Table from "../../components/utils/table";

type Props = {
  data: Data;
};

export default function Users({ data }: Props) {
  const { token, user, users } = data;
  const [openAddPanel, setOpenAddPanel] = useState(false);
  const [openEditPanel, setOpenEditPanel] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    username: string;
    role: Role | null;
    nationalId: number;
    email: string | undefined;
    user_image: string;
    phone_number: string | undefined;
  } | null>(null);

  const isAdmin = user?.user_role === "admin";

  const headers = isAdmin
    ? [
        "picture",
        "username",
        "email",
        "national id",
        "phone number",
        "role",

        "edit",
        "delete",
      ]
    : ["picture", "username", "email", "national id", "phone number", "role"];

  return (
    <div className="w-full h-full flex flex-col gap-y-2 px-4 py-2">
      {isAdmin && (
        <div className="w-full flex  items-center justify-end">
          <div className="w-32">
            <Button text="add user" onClick={() => setOpenAddPanel(true)} />
          </div>
        </div>
      )}
      <Table headers={headers}>
        {users?.map((user, index) => {
          return (
            <tr key={index} className="border-b">
              <th
                scope="row"
                className="px-2 text-left py-4 font-medium text-gray-900 whitespace-nowrap "
              >
                <div className="relative w-16 h-16 rounded-full">
                  <Image
                    src={
                      user.user_image &&
                      user.user_image.length > 0 &&
                      user.user_image.split("es/")[1] !== "undefined"
                        ? user.user_image
                        : "/images/avatar.png"
                    }
                    alt="profile image"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full"
                  />
                </div>
              </th>
              <td className="py-4">{user.username}</td>
              <td className="py-4">{user.email || "not created"}</td>
              <td className="py-4">{user.nationalId || "not created"}</td>
              <td className="py-4">{user.phone_number || "not created"}</td>
              <td className="py-4 text-green-400 font-medium">
                {user.role ? user.role : "unassigned"}
              </td>

              {isAdmin && (
                <td className="py-4  pr-2">
                  <Button
                    edit
                    onClick={() => {
                      setOpenEditPanel(true);
                      setSelectedUser(user);
                    }}
                    type="button"
                    svg={<PencilSquareIcon className="w-5 h-5 font-medium  " />}
                  />
                </td>
              )}
              {isAdmin && (
                <td className="py-4 pr-2">
                  <Button
                    error
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setSelectedUser(user);
                    }}
                    type="button"
                    svg={<TrashIcon className="w-5 h-5 font-medium  " />}
                  />
                </td>
              )}
            </tr>
          );
        })}
      </Table>
      <SidePanel open={openAddPanel} setOpen={setOpenAddPanel}>
        <AddUser token={token} />
      </SidePanel>
      <SidePanel open={openEditPanel} setOpen={setOpenEditPanel}>
        <UpdateUser selectedUser={selectedUser} token={token} />
      </SidePanel>
    </div>
  );
}

type Data = {
  token: string;
  users: {
    username: string;
    role: Role | null;
    nationalId: number;
    email: string | undefined;
    user_image: string;
    phone_number: string | undefined;
  }[];
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
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

  const users = await prisma.user.findMany({
    select: {
      user_national_id: true,
      user_password: false,
      user_id: true,
      user_role: true,
      user_username: true,
      Profile: {
        select: {
          profile_description: false,
          profile_email: true,
          profile_image: true,
          profile_phone_number: true,
        },
      },
    },
  });

  const returnUsers = users.map((user) => {
    const { data } = supabase.storage
      .from("upload-images")
      .getPublicUrl(`${user?.Profile?.profile_image}`);
    return {
      username: user.user_username,
      role: user.user_role,
      nationalId: user.user_national_id,
      email: user.Profile?.profile_email || null,
      user_image: data.publicUrl || null,
      phone_number: user.Profile?.profile_phone_number || null,
    };
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        users: returnUsers,
      },
    },
  };
};

Users.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
