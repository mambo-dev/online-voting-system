// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

import { parseForm } from "../../../../lib/parse-form";

type Data = {
  profile: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        profile: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        profile: null,
        errors: [
          {
            message: "unauthorized access please login",
          },
        ],
      });
    }

    const { fields, files } = await parseForm(req);

    const noEmptyValues = handleBodyNotEmpty(fields);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        profile: null,
        errors: [...noEmptyValues],
      });
    }
    console.log(files, fields);

    return res.status(200).json({
      profile: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      profile: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
