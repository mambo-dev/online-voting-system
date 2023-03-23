// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
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
    if (req.method !== "PUT") {
      return res.status(403).json({
        created: null,
        errors: [
          {
            message: "invalid method",
          },
        ],
      });
    }

    if (!(await handleAuthorization(req))) {
      return res.status(401).json({
        created: null,
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
        created: null,
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

    const { user_username } = req.query;

    const findUserToUpdate = await prisma.user.findUnique({
      where: {
        user_username: String(user_username),
      },
    });

    const isAdmin = user?.user_role === "admin";

    if (!isAdmin || findUserToUpdate?.user_id === user.user_id) {
      return res.status(403).json({
        created: null,
        errors: [
          {
            message: "not authorized to perform this action",
          },
        ],
      });
    }

    const { username, nationalId, role } = req.body;

    await prisma.user.update({
      where: {
        user_username: String(user_username),
      },
      data: {
        user_national_id: Number(nationalId),
        user_username: username,
        user_role: role,
      },
    });

    return res.status(200).json({
      created: true,
      errors: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      created: null,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
}
