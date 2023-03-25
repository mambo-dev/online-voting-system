// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { isExpired } from "../../../backend-utils/electionTime";

type Data = {
  voted: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        voted: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        voted: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const { election_id, candidate_id, voter_profile_id } = req.body;
    console.log(candidate_id);

    if (!election_id || !candidate_id || !voter_profile_id) {
      return res.status(404).json({
        voted: null,
        errors: [
          {
            message: "invalid id",
          },
        ],
      });
    }

    const findElection = await prisma.election.findUnique({
      where: {
        election_id: Number(election_id),
      },
      include: {
        Voter: {
          include: {
            voter_profile: true,
          },
        },
      },
    });

    const findProfile = await prisma.profile.findUnique({
      where: {
        profile_id: Number(voter_profile_id),
      },
      include: {
        Voter: true,
      },
    });

    const findVoter = await prisma.voter.findFirst({
      where: {
        voter_profile: {
          profile_id: findProfile?.profile_id,
        },
      },
    });

    const findCandidate = await prisma.candidate.findUnique({
      where: {
        candidate_id: Number(candidate_id),
      },
      include: {
        candidate_election: {
          include: {
            Vote: {
              include: {
                vote_voter: true,
              },
            },
          },
        },
      },
    });

    if (!findElection || !findCandidate || !findVoter) {
      return res.status(404).json({
        voted: null,
        errors: [
          {
            message: "resource may have already been deleted",
          },
        ],
      });
    }

    if ((await isExpired(findElection)).expired) {
      return res.status(403).json({
        voted: null,
        errors: [
          {
            message: "election time has already passed",
          },
        ],
      });
    }

    //ensure voter is registered //may be moot as if no voter table it means you have not registred
    //to be reviewed
    const isRegistered = findElection.Voter.some(
      (voter) => voter.voter_id === findVoter.voter_id
    );

    if (!isRegistered) {
      return res.status(403).json({
        voted: null,
        errors: [
          {
            message: "register to vote",
          },
        ],
      });
    }
    //check the votes if voter has already voted for this candidate return error else create a vote

    // const voterHasVoted = findCandidate.candidate_election.Vote.some((vote) => {
    //   return vote.vote_voter_id === findVoter.voter_id;
    // });

    // if (voterHasVoted) {
    //   return res.status(200).json({
    //     voted: false,
    //     errors: [{ message: "you have already voted for this candidate" }],
    //   });
    // }

    await prisma.vote.create({
      data: {
        vote_candidate: {
          connect: {
            candidate_id: findCandidate.candidate_id,
          },
        },
        vote_voter: {
          connect: {
            voter_id: findVoter.voter_id,
          },
        },
        vote_election: {
          connect: {
            election_id: findElection.election_id,
          },
        },
      },
    });

    return res.status(200).json({
      voted: true,
      errors: [],
    });
  } catch (error: any) {
    console.error(
      error.message ===
        "\nInvalid `prisma.vote.create()` invocation:\n\n\nUnique constraint failed on the fields: (`vote_voter_id`,`vote_candidate_id`)"
    );

    if (
      error.message ===
      "\nInvalid `prisma.vote.create()` invocation:\n\n\nUnique constraint failed on the fields: (`vote_voter_id`,`vote_candidate_id`)"
    ) {
      return res.status(500).json({
        voted: null,
        errors: [
          {
            message: "cannot vote for the same candidate twice",
          },
        ],
      });
    }
    return res.status(500).json({
      voted: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
