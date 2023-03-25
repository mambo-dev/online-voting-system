// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Candidate, Profile } from "@prisma/client";
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

type Data = {
  candidates:
    | (Candidate & {
        candidate_profile: Profile;
      })[]
    | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        candidates: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        candidates: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const { query } = req.query;

    const candidates = await prisma.candidate.findMany({
      where: {
        candidate_profile: {
          profile_full_name: {
            search: String(query),
          },
        },
      },
      include: {
        candidate_profile: true,
      },
    });

    return res.status(200).json({
      candidates: candidates,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      candidates: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
