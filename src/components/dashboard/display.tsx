import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  number?: boolean;
  link?: string;
  secondaryTitle?: string | number;
  tertiaryTitle: string;
  imageLink: string;
  className: string;
};

export default function Display({
  title,
  number,
  secondaryTitle,
  tertiaryTitle,
  imageLink,
  link,
  className,
}: Props) {
  if (number) {
    return (
      <div className={className}>
        <div className="w-full sm:w-3/4 text-left flex items-start justify-start flex-col gap-y-2 ">
          <h1 className="text-xl font-bold text-slate-700">{title}</h1>
          <span className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-slate-50 text-slate-700 ">
            {secondaryTitle}
          </span>
          <p className="text-slate-700">{tertiaryTitle}</p>
        </div>
        <div className="relative hidden sm:flex  h-[150px]">
          <Image
            alt="welcome"
            src={imageLink}
            width={100}
            height={100}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="w-full sm:w-3/4 text-left flex items-start justify-start flex-col gap-y-2 ">
        <h1 className="text-xl font-bold text-slate-700">{title}</h1>
        <p className="text-slate-700">{secondaryTitle}</p>
        <Link
          href={!link ? "/" : link}
          className="text-blue-500 hover:underline group flex items-center justify-center gap-x-1"
        >
          {tertiaryTitle}
          <ArrowLongRightIcon className="w-4 h-4 group-hover:animate-bounce " />
        </Link>
      </div>
      <div className="relative hidden sm:flex  h-[150px]">
        <Image
          alt="welcome"
          src="/images/welcome.svg"
          width={100}
          height={100}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
