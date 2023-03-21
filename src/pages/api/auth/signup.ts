// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";
import * as argon2 from "argon2";

type Data = {
  created: boolean | null;
  errors: HandleError[] | [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(403).json({
        created: false,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }
    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        created: false,
        errors: [...noEmptyValues],
      });
    }
    const { national_id, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(200).json({
        created: false,
        errors: [
          {
            message: "passwords must match",
          },
        ],
      });
    }

    const hash = await argon2.hash(password, {
      hashLength: 10,
    });

    await prisma.user.create({
      data: {
        user_national_id: national_id,
        user_password: hash,
        user_username: username,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      created: false,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
