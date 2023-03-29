import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { daysInWeek, subDays, eachDayOfInterval, format } from "date-fns";
import { Election } from "@prisma/client";

type Props = {
  elections: Election[];
};

export default function GraphDisplay({ elections }: Props) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const electionsByDay = daysOfWeek.map((day) => {
    const returnElections = elections.filter(
      (election) =>
        format(new Date(election.election_start_date), "EEE") === day
    );
    return { day, count: returnElections.length };
  });

  const data = [
    {
      id: "Elections",
      data: electionsByDay.map(({ day, count }) => ({ x: day, y: count })),
    },
  ];

  return (
    <div className="h-[500px] w-full  md:col-span-6 bg-white rounded shadow-lg flex items-center justify-center px-2 py-4">
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
          min: 0,
        }}
        animate={true}
        curve="linear"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Day of the week",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Number of elections",
          legendOffset: -40,
          legendPosition: "middle",
        }}
      />
    </div>
  );
}
