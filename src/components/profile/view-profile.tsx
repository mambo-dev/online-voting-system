import { Profile } from "@prisma/client";
import React, { useState } from "react";
import Button from "../utils/button";
import SidePanel from "../utils/sidepanel";
import UpdateProfile from "./update-profile";

type Props = {
  profile: Profile | null;
  token: string;
};

export default function ViewProfile({ profile, token }: Props) {
  const [openUpdatePanel, setOpenUpdatePanel] = useState(false);
  return (
    <div className="bg-white w-full  md:w-[70%] shadow mx-auto    rounded-lg h-fit">
      <div className="py-2 w-full flex items-center justify-end px-4 pt-2">
        <div className="w-32">
          <Button text="update" onClick={() => setOpenUpdatePanel(true)} />
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {`${profile?.profile_full_name.split(" ")[0]}`}{" "}
              <span className="first-letter:uppercase">
                {`${profile?.profile_full_name.split(" ")[1]}`}{" "}
              </span>
              <span className="first-letter:uppercase">
                {`${profile?.profile_full_name.split(" ")[2]}`}{" "}
              </span>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {`${profile?.profile_email}`}{" "}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">phone number</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {`${profile?.profile_phone_number}`}{" "}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">desription</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {`${profile?.profile_description}`}{" "}
            </dd>
          </div>
        </dl>
      </div>
      <SidePanel
        span="max-w-2xl"
        open={openUpdatePanel}
        setOpen={setOpenUpdatePanel}
      >
        <UpdateProfile currentProfile={profile} token={token} />
      </SidePanel>
    </div>
  );
}
