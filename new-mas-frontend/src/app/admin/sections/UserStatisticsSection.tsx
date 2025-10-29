"use client";
import React, { JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-black rounded-xl px-3 py-1.5">
        <p className="[font-family:'Inter',Helvetica] font-medium text-white text-sm text-right tracking-[-0.30px]">
          {payload[0].value} Users
        </p>
      </div>
    );
  }
  return null;
};

interface UserStatisticsProps {
  usersTrend: Array<{ day: string; value: number }>;
}

export const UserStatisticsSection = ({ usersTrend }: UserStatisticsProps): JSX.Element => {
  const usersData = usersTrend.map(item => ({
    day: item.day,
    users: item.value,
  }));
  return (
    <Card className="w-full rounded-2xl overflow-hidden bg-[linear-gradient(180deg,rgba(163,255,229,0.1)_0%,rgba(0,147,163,0.1)_79%)] border-0">
      <CardContent className="flex flex-col items-start gap-2 p-6">
        <header className="flex items-center gap-2 pt-0 pb-4 px-0 w-full">
          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#4e4e4e] text-2xl tracking-[-0.48px] leading-[normal] uppercase">
            Users Trends
          </h2>
        </header>

        <div className="relative h-[236px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={usersData}
              margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d100" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00d100" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                  stroke: "#00d100",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Area
                type="linear"
                dataKey="users"
                stroke="#00d100"
                strokeWidth={2}
                fill="url(#colorUsers)"
                dot={{ fill: "#00d100", r: 3 }}
                activeDot={{ r: 6, fill: "#00d100" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
