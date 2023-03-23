import { Election, Profile, Role } from "@prisma/client";
import React from "react";

type Props = {
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

export default function ElectionsComponent({ elections, user, token }: Props) {
  return <div>elections</div>;
}

type ElectionProps = {};

function Election({}: ElectionProps) {
  return <div></div>;
}
