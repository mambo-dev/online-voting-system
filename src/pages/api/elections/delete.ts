// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";

type Data = {
  deleted: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "DELETE") {
      return res.status(403).json({
        deleted: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        deleted: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
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
        deleted: null,
        errors: [
          {
            message: "not authorized to perform this action",
          },
        ],
      });
    }

    const { election_id } = req.query;

    if (!election_id) {
      return res.status(404).json({
        deleted: null,
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
        deleted: null,
        errors: [
          {
            message: "election may have already been deleted",
          },
        ],
      });
    }

    await prisma.election.delete({
      where: {
        election_id: findElection.election_id,
      },
    });

    return res.status(200).json({
      deleted: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      deleted: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
