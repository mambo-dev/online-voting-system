import { Profile } from "@prisma/client";
import React from "react";
type Props = {
  profile: Profile | null;
  token: string;
};

export default function UpdateProfile({}: Props) {
  return <div>update-profile</div>;
}
