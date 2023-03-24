// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";

type Data = {
  closed: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        closed: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    const { election_id } = req.query;

    if (!election_id) {
      return res.status(404).json({
        closed: null,
        errors: [
          {
            message: "invalid election id",
          },
        ],
      });
    }

    const findElection = await prisma.election.findUnique({
      where: {
        election_id: Number(election_id),
      },
    });

    if (!findElection) {
      return res.status(404).json({
        closed: null,
        errors: [
          {
            message: "election may have already been deleted",
          },
        ],
      });
    }

    await prisma.election.update({
      where: {
        election_id: findElection.election_id,
      },
      data: {
        election_status: "closed",
      },
    });

    return res.status(200).json({
      closed: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      closed: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
