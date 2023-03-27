// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Candidate, Election, Profile, Result, Voter } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";

import { ElectionReports, HandleError } from "../../../backend-utils/types";

type Data = {
  generated: ElectionReports[] | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "GET") {
      return res.status(403).json({
        generated: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        generated: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const elections = await prisma.election.findMany({
      include: {
        Result: {
          include: {
            result_candidate: {
              include: {
                candidate_profile: {
                  include: {
                    profile_user: {
                      select: {
                        user_national_id: true,
                        user_password: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Voter: {
          include: {
            voter_profile: true,
          },
        },
      },
    });

    const reportData = elections
      .map((election) => {
        return election.Result.map((result) => {
          const candidate = result.result_candidate;
          return {
            election_id: election.election_id,
            election_name: election.election_name,
            election_status: election.election_status,
            election_start_date: format(
              election.election_start_date,
              "MM/dd/yyyy"
            ),
            election_end_date: format(election.election_end_date, "MM/dd/yyyy"),
            candidate_position: result.result_position,
            candidate_id: candidate.candidate_id,
            candidate_name: candidate.candidate_profile.profile_full_name,
            candidate_national_id:
              candidate.candidate_profile.profile_user.user_national_id,
            candiate_phone: candidate.candidate_profile.profile_phone_number,
            candidate_is_winner: result.result_position_winner,
          };
        });
      })
      .flat();

    return res.status(200).json({
      generated: reportData,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      generated: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
