import React from "react";

type Props = {
  value: string | number | readonly string[] | undefined;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  name: string;
  label: string;
};
export default function TextArea({ onChange, value, name, label }: Props) {
  return (
    <div className="flex flex-col gap-y-2  w-full text-slate-800 font-medium">
      <label className="text-emerald-600 font-semibold"> {label} </label>
      <textarea
        value={value}
        onChange={onChange}
        name={name}
        className="py-3 px-2 rounded-lg outline-none bg-slate-100 border-b-4 border-emerald-300 focus:border-emerald-600 hover:border-emerald-500 "
      />
    </div>
  );
}
