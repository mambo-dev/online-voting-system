import {
  Candidate,
  Election,
  Profile,
  Result,
  Role,
  User,
  Voter,
} from "@prisma/client";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import prisma from "../../../lib/prisma";
import { exportToExcel } from "../../backend-utils/excel";
import {
  DecodedToken,
  ElectionReports,
  HandleError,
} from "../../backend-utils/types";
import DashboardLayout from "../../components/layout/dashboard";
import Button from "../../components/utils/button";
import ErrorMessage from "../../components/utils/error";
import Success from "../../components/utils/success";

type Props = { data: Data };

export default function Reports({ data }: Props) {
  const { user, token } = data;
  const [success, setSuccess] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<ElectionReports[]>(
    []
  );
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReports = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.get(
        `/api/reports/elections`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        generated,
        errors: serverErrors,
      }: {
        generated: ElectionReports[] | null;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !generated) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }

      setGeneratedReports(generated);
      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
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
  return (
    <div className="w-full  px-4 ">
      <div className="mx-auto  py-32">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
            />
          </svg>

          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-slate-700 font-medium">
            reports are generated for all elections
          </p>
          {generatedReports.length <= 0 ? (
            <div className="w-fit">
              <Button
                text="generate reports"
                onClick={() => generateReports()}
                loading={loading}
                svg={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`${
                      loading && "animate-spin ease-in-out "
                    } w-6 h-6`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                }
              />
            </div>
          ) : (
            <div className="w-fit">
              <button
                className="w-full py-2 px-4 inline-flex items-center justify-center gap-x-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 focus:border focus:ring-1 ring-offset-1 border-green-400 ring-green-300"
                onClick={() => {
                  let id = 0;
                  exportToExcel({
                    Dbdata: generatedReports,
                    filename: `${user?.user_username}-${
                      user?.user_role
                    }${(id += 1)}-cases`,
                    filetype:
                      "application/vnd.openxmlfromats-officedocument.spreadsheetml.sheet;charset=UTF-8",
                    fileExtension: ".xlsx",
                  });
                }}
              >
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                download
              </button>
            </div>
          )}
          <div className="flex w-fit items-center justify-center">
            <ErrorMessage errors={errors} />
            <Success
              message="succesfully generated reports"
              success={success}
            />
          </div>
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

  return {
    props: {
      data: {
        token: access_token,
        user: loggedInUser,
      },
    },
  };
};

Reports.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
