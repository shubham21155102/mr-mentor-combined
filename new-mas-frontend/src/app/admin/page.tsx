"use client"
import React, { JSX, useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { ConnectsTrendSection } from "./sections/ConnectsTrendSection";
import { RevenueOverviewSection } from "./sections/RevenueOverviewSection";
import { TokensTrendSection } from "./sections/TokensTrendSection";
import { UserStatisticsSection } from "./sections/UserStatisticsSection"
import { TrendingDown, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";

interface DashboardData {
  connects: {
    completed: number;
    scheduled: number;
    cancelled: number;
  };
  revenue: {
    amount: number;
    fromTokens: number;
  };
  tokens: {
    total: number;
    used: number;
    remaining: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
  connectsTrend: {
    completed: Array<{ day: string; value: number }>;
    scheduled: Array<{ day: string; value: number }>;
    cancelled: Array<{ day: string; value: number }>;
  };
  revenueTrend: Array<{ day: string; value: number }>;
  tokensTrend: Array<{ day: string; value: number }>;
  usersTrend: Array<{ day: string; value: number }>;
}
const statsData = [
  {
    title: "CONNECTS",
    value: "160",
    trend: "+12%",
    trendUp: true,
    trendIcon: TrendingUp,
    details: [
      { label: "Completed", value: "120" },
      { label: "Scheduled", value: "120" },
      { label: "Cancelled", value: "120" },
    ],
  },
  {
    title: "REVENUE",
    value: "90,000",
    prefix: "₹",
    trend: "+12%",
    trendUp: true,
    trendIcon: TrendingUp,
    details: [
      { label: "From 300 Tokens", value: "" },
      { label: "*1 token = 300 INR", value: "", muted: true },
    ],
  },
  {
    title: "TOKENS",
    value: "300",
    trend: "+12%",
    trendUp: true,
    trendIcon: TrendingUp,
    details: [
      { label: "Used", value: "120" },
      { label: "Remaining", value: "120" },
    ],
  },
  {
    title: "USERS",
    value: "90",
    trend: "+12%",
    trendUp: false,
    trendIcon: TrendingDown,
    details: [
      { label: "Active", value: "65" },
      { label: "New", value: "25" },
    ],
  },
];

 const AdminDashboard = (): JSX.Element => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.backendToken) return;

      try {
        const response = await fetch('http://localhost:8000/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDashboardData(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard data</div>;
  }

  const statsData = [
    {
      title: "CONNECTS",
      value: (dashboardData.connects.completed + dashboardData.connects.scheduled + dashboardData.connects.cancelled).toString(),
      trend: "+12%", // You might want to calculate actual trend
      trendUp: true,
      trendIcon: TrendingUp,
      details: [
        { label: "Completed", value: dashboardData.connects.completed.toString() },
        { label: "Scheduled", value: dashboardData.connects.scheduled.toString() },
        { label: "Cancelled", value: dashboardData.connects.cancelled.toString() },
      ],
    },
    {
      title: "REVENUE",
      value: (dashboardData.revenue.amount / 1000).toFixed(0) + "K", // Assuming amount is in rupees
      prefix: "₹",
      trend: "+12%",
      trendUp: true,
      trendIcon: TrendingUp,
      details: [
        { label: "From 300 Tokens", value: "" },
        { label: "*1 token = 300 INR", value: "", muted: true },
      ],
    },
    {
      title: "TOKENS",
      value: dashboardData.tokens.total.toString(),
      trend: "+12%",
      trendUp: true,
      trendIcon: TrendingUp,
      details: [
        { label: "Used", value: dashboardData.tokens.used.toString() },
        { label: "Remaining", value: dashboardData.tokens.remaining.toString() },
      ],
    },
    {
      title: "USERS",
      value: dashboardData.users.total.toString(),
      trend: "+12%",
      trendUp: false,
      trendIcon: TrendingDown,
      details: [
        { label: "Active", value: dashboardData.users.active.toString() },
        { label: "New", value: dashboardData.users.new.toString() },
      ],
    },
  ];
  return (
    <div className="w-full px-8 py-6">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-[32px] font-semibold text-[#000c17] tracking-[-0.64px] mb-8 [font-family:'Inter',Helvetica]">
          Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card
              key={stat.title}
              className="rounded-3xl bg-[linear-gradient(180deg,rgba(163,255,229,0.2)_0%,rgba(0,147,163,0.2)_79%)] border-0"
            >
              <CardContent className="p-6 flex flex-col gap-[19px]">
                <div className="flex flex-col gap-[18px]">
                  <h2 className="text-2xl font-semibold text-[#4e4e4e] tracking-[-0.48px] [font-family:'Inter',Helvetica]">
                    {stat.title}
                  </h2>

                  <div className="flex items-center gap-3">
                    {stat.prefix && (
                      <span className="text-[64px] font-semibold text-[#030303] tracking-[-1.28px] [font-family:'Inter',Helvetica]">
                        {stat.prefix}
                      </span>
                    )}
                    <span className="text-[64px] font-semibold text-[#030303] tracking-[-1.28px] [font-family:'Inter',Helvetica]">
                      {stat.value}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-[7px]">
                  {/* <img
                    className="w-6 h-6"
                    alt="Trending"
                    src={stat.trendIcon}
                  /> */}
                  {stat.trendIcon && <stat.trendIcon className={`w-6 h-6 ${stat.trendUp ? "text-[#00b000]" : "text-[#ff1f00]"}`}/>}
                  <span
                    className={`text-2xl font-medium tracking-[-0.48px] whitespace-nowrap [font-family:'Inter',Helvetica] ${
                      stat.trendUp ? "text-[#00b000]" : "text-[#ff1f00]"
                    }`}
                  >
                    {stat.trend.replace("+", "")}
                  </span>
                </div>

                <div className="relative w-full h-px -mx-6">
                  <img
                    className="absolute top-[-3px] left-0 w-full h-[3px]"
                    alt="Line"
                    src="/line-328.svg"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {stat.details.map((detail, detailIndex) => (
                    <div
                      key={`${stat.title}-detail-${detailIndex}`}
                      className={`flex items-center ${
                        detail.value ? "justify-between" : "justify-around"
                      }`}
                    >
                      <span
                        className={`text-lg font-medium tracking-[-0.36px] [font-family:'Inter',Helvetica] ${
                          "muted" in detail && detail.muted ? "text-[#8d9fa6]" : "text-black"
                        }`}
                      >
                        {detail.label}
                      </span>
                      {detail.value && (
                        <span className="text-lg font-medium text-black tracking-[-0.36px] [font-family:'Inter',Helvetica]">
                          {detail.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ConnectsTrendSection connectsTrend={dashboardData.connectsTrend} />
          <RevenueOverviewSection revenueTrend={dashboardData.revenueTrend} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokensTrendSection tokensTrend={dashboardData.tokensTrend} />
          <UserStatisticsSection usersTrend={dashboardData.usersTrend} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;