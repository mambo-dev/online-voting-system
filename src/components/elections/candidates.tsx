import React from "react";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";

type Props = {
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function Candidates({}: Props) {
  return <div>Candidates</div>;
}
