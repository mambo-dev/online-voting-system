// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import jwtDecode from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { handleAuthorization } from "../../../backend-utils/authorization";
import { DecodedToken, HandleError } from "../../../backend-utils/types";
import { handleBodyNotEmpty } from "../../../backend-utils/validation";

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

    const noEmptyValues = handleBodyNotEmpty(req.body);

    if (noEmptyValues.length > 0) {
      return res.status(200).json({
        profile: null,
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

    if (!user) {
      return res.status(200).json({
        profile: false,
        errors: [
          {
            message: "user not found",
          },
        ],
      });
    }

    const {
      url,
      phoneNumber,
      firstName,
      secondName,
      lastName,
      description,
      email,
    } = req.body;

    await prisma.profile.create({
      data: {
        profile_description: description,
        profile_email: email,
        profile_full_name: `${firstName} ${secondName} ${lastName}`,
        profile_phone_number: phoneNumber,
        profile_status: "active",
        profile_image: url,
        profile_user: {
          connect: {
            user_id: user.user_id,
          },
        },
      },
    });

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
