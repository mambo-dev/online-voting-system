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
      className="mt-2 bg-emerald-500 rounded-lg py-2 px-2 text-white font-semibold inline-flex items-center justify-center gap-x-2"
    >
      {svg}
      {loading ? <p className="italic">loading... </p> : text}
    </button>
  );
}
