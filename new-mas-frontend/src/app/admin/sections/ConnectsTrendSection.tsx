"use client";
import React, { JSX, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const legendItems = [
  { label: "Completed", color: "#00d100" },
  { label: "Scheduled", color: "#0228ff" },
  { label: "Cancelled", color: "#ff1f00" },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-black rounded-xl px-3 py-1.5">
        <p className="[font-family:'Inter',Helvetica] font-medium text-white text-sm text-right tracking-[-0.30px]">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

interface ConnectsTrendProps {
  connectsTrend: {
    completed: Array<{ day: string; value: number }>;
    scheduled: Array<{ day: string; value: number }>;
    cancelled: Array<{ day: string; value: number }>;
  };
}

export const ConnectsTrendSection = ({ connectsTrend }: ConnectsTrendProps): JSX.Element => {
  // Combine the trend data into chart data
  const chartData = connectsTrend.completed.map((item, index) => ({
    day: item.day,
    completed: item.value,
    scheduled: connectsTrend.scheduled[index]?.value || 0,
    cancelled: connectsTrend.cancelled[index]?.value || 0,
  }));
  return (
    <Card className="w-full rounded-2xl overflow-hidden bg-[linear-gradient(180deg,rgba(163,255,229,0.1)_0%,rgba(0,147,163,0.1)_79%)] border-0">
      <CardContent className="p-6 flex flex-col gap-2">
        <header className="flex items-center justify-between pb-4">
          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#4e4e4e] text-2xl tracking-[-0.48px] uppercase">
            Connects Trend
          </h2>

          <div className="flex items-start gap-2">
            {legendItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-end gap-3 flex-1"
              >
                <span className="[font-family:'Inter',Helvetica] font-medium text-[#4e4e4e] text-sm tracking-[-0.28px]">
                  {item.label}
                </span>
                <div
                  className="w-6 h-2.5 rounded-[20px]"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            ))}
          </div>
        </header>

        <div className="relative h-[236px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#f1f1f1"
                vertical={true}
                horizontal={true}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#000000",
                  fontSize: 14,
                  fontFamily: "Inter, Helvetica",
                  fontWeight: 500,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#000000",
                  fontSize: 14,
                  fontFamily: "Inter, Helvetica",
                  fontWeight: 500,
                }}
                ticks={[0, 10, 20, 50, 100]}
                domain={[0, 100]}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#000000",
                  strokeWidth: 1,
                }}
              />
              <Line
                type="linear"
                dataKey="completed"
                stroke="#00d100"
                strokeWidth={2}
                dot={{ fill: "#00d100", r: 3 }}
                activeDot={{ r: 6, fill: "#00d100" }}
              />
              <Line
                type="linear"
                dataKey="scheduled"
                stroke="#0228ff"
                strokeWidth={2}
                dot={{ fill: "#0228ff", r: 3 }}
                activeDot={{ r: 6, fill: "#0228ff" }}
              />
              <Line
                type="linear"
                dataKey="cancelled"
                stroke="#ff1f00"
                strokeWidth={2}
                dot={{ fill: "#ff1f00", r: 3 }}
                activeDot={{ r: 6, fill: "#ff1f00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
