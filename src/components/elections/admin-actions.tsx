import { Profile, Role } from "@prisma/client";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";
import Modal from "../utils/Modal";
import SidePanel from "../utils/sidepanel";
import DeleteElection from "./delete-election";
import UpdateElections from "./update-elections";

type Props = {
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function AdminElectionActions({ election, token, user }: Props) {
  const [openUpdatePanel, setOpenUpdatePanel] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = () => {};

  return (
    <div className="flex items-center justify-between mt-auto py-4">
      <div className="w-32">
        <button
          onClick={() => setOpenUpdatePanel(true)}
          className="py-2 px-4 w-full rounded-lg bg-blue-500 text-white font-semibold focus:ring-2 ring-blue-300 ring-offset-1"
        >
          update
        </button>
      </div>
      <div className="w-32">
        <button
          onClick={() => setOpenDeleteModal(true)}
          className="py-2 px-4 w-full rounded-lg bg-red-500 text-white font-semibold focus:ring-2 ring-red-400 ring-offset-1"
        >
          delete
        </button>
      </div>
      <SidePanel
        span="max-w-2xl"
        open={openUpdatePanel}
        setOpen={setOpenUpdatePanel}
      >
        <UpdateElections election={election} token={token} />
      </SidePanel>
      <Modal isOpen={openDeleteModal} setIsOpen={setOpenDeleteModal}>
        <DeleteElection
          election={election}
          setIsOpen={setOpenDeleteModal}
          token={token}
        />
      </Modal>
    </div>
  );
}
