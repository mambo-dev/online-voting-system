import {
  BanknotesIcon,
  Bars3Icon,
  BuildingLibraryIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  Square2StackIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Role } from "@prisma/client";
import Link from "next/link";
import React, { JSXElementConstructor, useState } from "react";
import MenuOptions from "../utils/menu";

type Props = {
  children: React.ReactElement<any, string | JSXElementConstructor<any>>;
  user?: {
    user_id: number;
    user_username: string;
    user_national_id: number;
    user_role: Role | null;
  } | null;
};

const sideLinks = [
  {
    name: "dashboard",
    link: "/dashboard",
    icon: (
      <PresentationChartBarIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-500 group-focus:text-amber-600 " />
    ),
  },
  {
    name: "users",
    link: "/dashboard/users",
    icon: (
      <UsersIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-500 group-focus:text-amber-600 " />
    ),
  },
  {
    name: "elections",
    link: "/dashboard/elections",
    icon: (
      <ChartBarIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-500 group-focus:text-amber-600 " />
    ),
  },

  {
    name: "reports",
    link: "/dashboard/reports",
    icon: (
      <DocumentChartBarIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-500 group-focus:text-amber-600 " />
    ),
  },
];

export default function DashboardLayout({ children }: Props) {
  const [openNavigation, setOpenNavigation] = useState(false);
  return (
    <main className="  w-full min-h-screen flex flex-col   items-center">
      <div className="w-full h-screen flex items-center ">
        <nav
          className={` ${
            !openNavigation && "hidden"
          } w-full  flex flex-col gap-y-3  px-2 top-0 bottom-0 left-0 right-0 shadow  absolute  md:relative md:w-[20%]  bg-white h-full `}
        >
          <div className="flex items-center justify-center h-16 px-2">
            <h1 className="text-2xl tracking-widest font-bold bg-clip-text text-transparent bg-gradient-to-tr from-amber-500 to-amber-600">
              MENTOR SACCO
            </h1>
          </div>
          <button
            onClick={() => setOpenNavigation(false)}
            className="md:hidden flex ml-auto"
          >
            <XMarkIcon className="w-7 h-7" />{" "}
          </button>
          <ul className="flex flex-col items-center justify-center gap-y-2 ">
            {sideLinks.map(
              (
                link: {
                  name: string;
                  link: string;
                  icon: any;
                },
                index: number
              ) => {
                return (
                  <div key={index} className="w-full">
                    <Link href={`${link.link}`}>
                      <li
                        onClick={() => {
                          window.innerWidth <= 780 && setOpenNavigation(false);
                        }}
                        className="py-3 group flex items-center  gap-x-2 justify-start  w-full rounded px-2 hover:bg-amber-100 focus:bg-blue-100 "
                      >
                        {link.icon}
                        <span className="font-semibold text-slate-500  group-hover:text-amber-500 group-focus:text-amber-600">
                          {link.name}{" "}
                        </span>
                      </li>
                    </Link>
                  </div>
                );
              }
            )}
          </ul>
        </nav>
        <div className=" w-full flex-1 h-full flex flex-col ">
          <header className="h-20 w-full bg-white shadow  flex items-center justify-between py-2 px-2">
            <button
              onClick={() => {
                setOpenNavigation(!openNavigation);
              }}
              className="w-24 h-full inline-flex items-center justify-center"
            >
              <Bars3Icon className="w-7 h-7 " />{" "}
            </button>
            <div>
              <MenuOptions profileLink="/dashboard/profile" />
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
