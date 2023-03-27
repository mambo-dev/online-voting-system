// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

type Data = {
  published: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        published: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        published: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        published: null,
        errors: [...noEmptyValues],
      });
    }

    const token = req.headers.authorization?.split(" ")[1];

    const decodedToken: DecodedToken = await jwtDecode(`${token}`);

    const user = await prisma.user.findUnique({
      where: {
        user_id: decodedToken.user_id,
      },
    });

    const isAdmin = user?.user_role === "admin";

    if (!isAdmin) {
      return res.status(401).json({
        published: null,
        errors: [
          {
            message: "not authorized to perform this action",
          },
        ],
      });
    }

    const { election_id } = req.query;

    const findElection = await prisma.election.findUnique({
      where: {
        election_id: Number(election_id),
      },
      include: {
        Vote: {
          include: {
            vote_candidate: true,
          },
        },
        Candidate: true,
        Voter: true,
      },
    });

    if (!findElection) {
      return res.status(404).json({
        published: null,
        errors: [
          {
            message: "could not find thid election user may have deleted it",
          },
        ],
      });
    }

    if (
      findElection.election_status === "open" ||
      findElection.results_published
    ) {
      return res.status(403).json({
        published: null,
        errors: [
          {
            message:
              findElection.election_status === "open"
                ? "cannot publish results of an open election"
                : findElection.results_published
                ? "results have already been published"
                : "",
          },
        ],
      });
    }
    const results: any = {};
    const winners: any = {};

    // Aggregate votes by position and candidate
    findElection.Vote.forEach((vote) => {
      const position = vote.vote_candidate.candidate_vying_position;
      const candidateId = vote.vote_candidate.candidate_id;

      if (!results[position]) {
        results[position] = {};
      }

      if (!results[position][candidateId]) {
        results[position][candidateId] = {
          candidate: vote.vote_candidate,
          votes: 0,
        };
      }
      if (
        !winners[position] ||
        results[position][candidateId].votes > winners[position].votes
      ) {
        winners[position] = {
          candidate: vote.vote_candidate,
          votes: results[position][candidateId].votes,
        };
      }

      results[position][candidateId].votes++;
    });

    // Create result objects and save to database
    const resultData: any[] = [];
    Object.keys(results).forEach((position) => {
      Object.keys(results[position]).forEach((candidateId) => {
        const candidate = results[position][candidateId].candidate;
        const votes = results[position][candidateId].votes;
        const isWinner =
          candidate.candidate_id === winners[position].candidate.candidate_id;
        resultData.push({
          result_election_id: findElection.election_id,
          result_position: position,
          result_candidate_id: Number(candidateId),
          result_position_winner: isWinner,
          result_votes: votes,
        });
      });
    });

    const computedResults = await prisma.result.createMany({
      data: resultData,
    });

    if (!computedResults) {
      return res.status(400).json({
        published: null,
        errors: [
          {
            message: "something went wrong while calculating",
          },
        ],
      });
    }

    await prisma.election.update({
      where: {
        election_id: findElection.election_id,
      },
      data: {
        results_published: true,
      },
    });

    return res.status(200).json({
      published: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      published: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
