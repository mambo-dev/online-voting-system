import React from "react";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";

type Props = {
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function SearchCandidate({}: Props) {
  return (
    <div className="w-full bg-white shadow py-2 px-3 rounded-lg">
      <div className="flex items-center justify-between gap-x-2">
        <input
          name="candidate"
          className="flex-1 outline-none border-b border-amber-200 py-2 focus:border-amber-400"
          placeholder="search for candidates "
        />
      </div>
    </div>
  );
}
