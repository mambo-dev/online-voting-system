// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { isExpired } from "../../../backend-utils/electionTime";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

type Data = {
  registered: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        registered: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        registered: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const { election_id, profile_id, register_as } = req.query;

    const findProfile = await prisma.profile.findUnique({
      where: {
        profile_id: Number(profile_id),
      },
    });

    const findElection = await prisma.election.findUnique({
      where: {
        election_id: Number(election_id),
      },
      include: {
        Voter: true,
        Candidate: true,
      },
    });

    const alreadyRegistered =
      findElection?.Voter.some(
        (voter) => voter.voter_profile_id === findProfile?.profile_id
      ) ||
      findElection?.Candidate.some(
        (candidate) =>
          candidate.candidate_profile_id === findProfile?.profile_id
      );

    if (alreadyRegistered) {
      return res.status(200).json({
        registered: null,
        errors: [
          {
            message: "you have already registered for this election",
          },
        ],
      });
    }

    if (!findElection || !findProfile) {
      return res.status(200).json({
        registered: null,
        errors: [
          {
            message: `${
              !findElection
                ? "election may have been deleted"
                : "kindly create a profile first"
            }`,
          },
        ],
      });
    }

    if ((await isExpired(findElection)).expired) {
      return res.status(403).json({
        registered: null,
        errors: [
          {
            message: "election time has already passed",
          },
        ],
      });
    }

    if (register_as === "voter") {
      await prisma.voter.create({
        data: {
          voter_profile: {
            connect: {
              profile_id: findProfile.profile_id,
            },
          },

          voter_election: {
            connect: {
              election_id: findElection.election_id,
            },
          },
        },
      });

      return res.status(200).json({
        registered: true,
        errors: [],
      });
    }

    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        registered: null,
        errors: [...noEmptyValues],
      });
    }

    const { description, position } = req.body;
    //registers both as a voter and a candidate
    await prisma.voter.create({
      data: {
        voter_profile: {
          connect: {
            profile_id: findProfile.profile_id,
          },
        },

        voter_election: {
          connect: {
            election_id: findElection.election_id,
          },
        },
      },
    });

    await prisma.candidate.create({
      data: {
        candidate_vying_description: description,
        candidate_vying_position: position,
        candidate_profile: {
          connect: {
            profile_id: findProfile.profile_id,
          },
        },
        candidate_election: {
          connect: {
            election_id: findElection.election_id,
          },
        },
      },
    });

    return res.status(200).json({
      registered: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      registered: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
