import React from "react";

type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  text: string;
  svg?: any;
  type?: "button" | "submit" | "reset" | undefined;
  loading?: boolean;
};

export default function Button({ onClick, text, svg, type, loading }: Props) {
  return (
    <button
      onClick={onClick}
      type={type}
      className="mt-2 py-3 inline-flex items-center justify-center gap-x-2 w-full rounded-lg  bg-gradient-to-tr from-amber-600 to-amber-500 shadow text-white text-sm font-medium focus:ring-1 focus:border ring-amber-400 border-amber-300"
    >
      {svg}
      {loading ? <p className="italic">loading... </p> : text}
    </button>
  );
}
