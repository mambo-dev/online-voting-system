import { Election } from "@prisma/client";
import prisma from "../../lib/prisma";

export async function isExpired(election: Election) {
  const findElection = await prisma.election.findUnique({
    where: {
      election_id: election.election_id,
    },
  });

  if (!findElection) {
    return {
      expired: false,
      notFound: true,
    };
  }

  const endDate = new Date(findElection.election_end_date).getMilliseconds();
  const currentDate = new Date().getMilliseconds();
  if (currentDate >= endDate) {
    await prisma.election.update({
      where: {
        election_id: findElection.election_id,
      },
      data: {
        election_status: "closed",
      },
    });

    return {
      expired: true,
      notFound: false,
    };
  }

  return {
    expired: false,
    notFound: false,
  };
}
