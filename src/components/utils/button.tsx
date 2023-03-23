import React from "react";

type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  text?: string;
  svg?: any;
  type?: "button" | "submit" | "reset" | undefined;
  loading?: boolean;
  error?: boolean;
  edit?: boolean;
  expand?: boolean;
};

export default function Button({
  onClick,
  text,
  svg,
  type,
  loading,
  error,
  edit,
  expand,
}: Props) {
  if (error) {
    return (
      <button
        onClick={onClick}
        className="py-2 px-1 w-full shadow rounded-md inline-flex items-center justify-center gap-x-2 bg-red-100 text-red-600 hover:bg-red-200 focus:bg-red-200  font-medium hover:ring-1 focus:ring-2  ring-red-400 ring-opacity-50 focus:border focus:border-red-500  "
        type={type}
      >
        {svg}
        {text}
      </button>
    );
  }
  if (expand) {
    return (
      <button
        onClick={onClick}
        className="py-2 px-1 w-full shadow rounded-md inline-flex items-center justify-center gap-x-2 bg-gray-100 text-slate-600 hover:bg-gray-200 focus:bg-gray-200  font-medium hover:ring-1 focus:ring-2  ring-gray-400 ring-opacity-50 focus:border focus:border-gray-500  "
        type={type}
      >
        {svg}
        {text}
      </button>
    );
  }

  if (edit) {
    return (
      <button
        onClick={onClick}
        className="py-2 px-1 w-full shadow rounded-md inline-flex items-center justify-center gap-x-2 bg-blue-100 text-blue-600 hover:bg-blue-200 focus:bg-blue-200  font-medium hover:ring-1 focus:ring-2  ring-blue-400 ring-opacity-50 focus:border focus:border-blue-500  "
        type={type}
      >
        {svg}
        {text}
      </button>
    );
  }
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
