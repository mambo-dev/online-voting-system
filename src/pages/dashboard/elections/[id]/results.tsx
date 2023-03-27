import {
  CheckBadgeIcon,
  ChevronDoubleRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  Candidate,
  Election,
  Profile,
  Result,
  Role,
  Vote,
} from "@prisma/client";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import prisma from "../../../../../lib/prisma";
import { DecodedToken, HandleError } from "../../../../backend-utils/types";
import DashboardLayout from "../../../../components/layout/dashboard";
import Button from "../../../../components/utils/button";
import DisclosureComp from "../../../../components/utils/disclosure";
import ErrorMessage from "../../../../components/utils/error";
import Success from "../../../../components/utils/success";

type Props = {
  data: Data;
};

export default function Results({ data }: Props) {
  const { token, user, results, election } = data;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const publishResults = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.get(
        `/api/elections/results?election_id=${election?.election_id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        published,
        errors: serverErrors,
      }: {
        published: boolean | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !published) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }
      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.reload();
      }, 2000);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  };

  const isAdmin = user?.user_role === "admin";
  const isPublished = election?.results_published;

  console.log(results);
  return (
    <div className="relative w-full min-h-screen py-4 px-2">
      {(success || errors.length > 0) && (
        <div className="absolute top-10 bottom-0 left-0 right-0 w-fit h-fit mx-auto ">
          <ErrorMessage errors={errors} />
          <Success message="results have been published" success={success} />
        </div>
      )}
      <div className="w-full flex items-center justify-end">
        {isAdmin && (
          <div className="ml-auto w-fit">
            <Button
              text="publish results"
              onClick={() => publishResults()}
              svg={<CheckBadgeIcon className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        )}
      </div>
      {!isPublished && (
        <div className="mx-auto  py-32">
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-slate-700 font-light"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>

            <h1 className="text-xl font-semibold">unpublished</h1>
            <p className="text-slate-700 font-medium">
              publish this elections for users to see the results
            </p>
          </div>
        </div>
      )}

      <div className="w-full py-10">
        <div className="w-full md:w-1/2 mx-auto px-2 py-5">
          <ul
            role="list"
            className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {results.length > 0 ? (
              results.map((result) => (
                <DisclosureComp
                  key={result.result_id}
                  button={
                    <div className="w-full flex items-center justify-start gap-x-4 py-2">
                      <div className="flex-1 flex items-center gap-x-4">
                        <span>
                          {
                            result.result_candidate.candidate_profile
                              .profile_full_name
                          }
                        </span>
                        <span>
                          {result.result_candidate.candidate_vying_position}
                        </span>

                        <span>
                          {result.result_position_winner ? (
                            <span className="py-1 bg-green-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                              {" "}
                              winner{" "}
                            </span>
                          ) : (
                            <span className="py-1 bg-yellow-300 rounded-full   px-8 text-sm font-bold text-slate-800">
                              runners up
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="mr-10 text-xs font-semibold rounded border-slate-300 border shadow bg-gradient-to-tr from-white to-slate-50 flex items-center justify-center py-1 px-2">
                        {result.result_votes}
                      </span>
                    </div>
                  }
                  panel={
                    <div className="py-2 flex flex-col">
                      <span>
                        {result.result_candidate.candidate_vying_description}
                      </span>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="py-2 px-1 text-red-500 font-semibold text-sm">
                <span>no results yet</span>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

type Data = {
  token: string;
  user: {
    Profile: Profile | null;
    user_national_id: number;
    user_id: number;
    user_role: Role | null;
    user_username: string;
  } | null;
  results: (Result & {
    result_candidate: Candidate & {
      candidate_profile: Profile;
    };
  })[];
  election:
    | (Election & {
        Candidate: (Candidate & {
          candidate_profile: Profile;
        })[];
        Vote: Vote[];
      })
    | null;
};

export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const { req } = context;

  const access_token = req.cookies.access_token;
  if (!access_token || access_token.trim() === "") {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const decodedToken: DecodedToken = jwtDecode(access_token);

  if (decodedToken.exp < Date.now() / 1000) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const loggedInUser = await prisma.user.findUnique({
    where: {
      user_id: decodedToken.user_id,
    },
    select: {
      Profile: true,
      user_national_id: true,
      user_password: false,
      user_id: true,
      user_role: true,
      user_username: true,
    },
  });

  const election_id = context.query.id;

  const findElection = await prisma.election.findUnique({
    where: {
      election_id: Number(election_id),
    },
    include: {
      Candidate: {
        include: {
          candidate_profile: true,
        },
      },
      Vote: true,
    },
  });

  const isAdmin = loggedInUser?.user_role === "admin";

  if (findElection?.election_status !== "closed") {
    return {
      redirect: {
        permanent: false,
        destination: `/dashboard/elections/${election_id}`,
      },
    };
  }
  const results = await prisma.result.findMany({
    where: {
      result_election: {
        election_id: findElection?.election_id,
      },
    },
    orderBy: {
      result_position_winner: "desc",
    },
    include: {
      result_candidate: {
        include: {
          candidate_profile: true,
        },
      },
    },
  });

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
        results: results,
        election: JSON.parse(JSON.stringify(findElection)),
      },
    },
  };
};

Results.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
