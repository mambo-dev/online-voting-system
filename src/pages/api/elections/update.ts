// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

type Data = {
  updated: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "PUT") {
      return res.status(403).json({
        updated: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        updated: null,
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
        updated: null,
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
        updated: null,
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
    });

    if (!findElection) {
      return res.status(404).json({
        updated: null,
        errors: [
          {
            message: "election may have been deleted",
          },
        ],
      });
    }

    const { description, end_date, name, start_date, status, positions } =
      req.body;

    const positionsToAdd = positions.filter(
      (position: string) => !findElection.election_positions.includes(position)
    );
    if (positionsToAdd.length === 0) {
      await prisma.election.update({
        where: {
          election_id: findElection.election_id,
        },
        data: {
          election_desription: description,
          election_end_date: end_date,
          election_name: name,
          election_start_date: start_date,
          election_status: status,
        },
      });
      return res.status(200).json({
        updated: true,
        errors: [],
      });
    }

    await prisma.election.update({
      where: {
        election_id: findElection.election_id,
      },
      data: {
        election_desription: description,
        election_end_date: end_date,
        election_name: name,
        election_start_date: start_date,
        election_status: status,
        election_positions: [
          ...findElection.election_positions,
          ...positionsToAdd,
        ],
      },
    });

    return res.status(200).json({
      updated: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      updated: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
