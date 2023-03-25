import { Candidate, Profile } from "@prisma/client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ElectionCandidatesVoters } from "../../pages/dashboard/elections/[id]";
import useDebounce from "../hooks/debounce";

type Props = {
  election: ElectionCandidatesVoters | null;
  token: string;
};

export default function SearchCandidate({ token }: Props) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<
    | (Candidate & {
        candidate_profile: Profile;
      })[]
  >([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(query, 500);
  useEffect(() => {
    if (debouncedSearch) {
      setLoading(true);
      axios
        .get(`/api/elections/search-candidate?query=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setLoading(false);
          setCandidates(response.data.candidates);
        })
        .catch((error) => {
          setLoading(false);
          console.log(error);
        });
    }
  }, [debouncedSearch, query, token]);
  return (
    <div className="w-full bg-white shadow py-2 px-3 rounded-lg relative">
      <div className="flex items-center justify-between gap-x-2">
        <input
          name="candidate"
          className="flex-1 outline-none border-b border-amber-200 py-2 focus:border-amber-400"
          placeholder="search for candidates "
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query.length > 0 &&
        (loading ? (
          <div className="bg-white rounded-lg shadow">
            <span className="italic mx-auto w-fit">Loading...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {candidates.map((candidate) => (
              <span
                className="rounded-lg py-2 px-2 bg-amber-200 text-amber-900 font-bold"
                key={candidate.candidate_id}
                onClick={() => {
                  setQuery("");
                }}
              >
                {candidate.candidate_profile.profile_full_name}
              </span>
            ))}
          </div>
        ))}
    </div>
  );
}
