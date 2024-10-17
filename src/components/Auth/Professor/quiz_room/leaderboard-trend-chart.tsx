"use client";

import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LeaderboardEntry } from "@/lib/types";

interface LeaderboardChartProps {
  leaderboardData: LeaderboardEntry[];
}

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({
  leaderboardData,
}) => {
  const chartData = useMemo(() => {
    return leaderboardData
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => ({
        name: entry.student_name,
        score: entry.score,
      }));
  }, [leaderboardData]);

  const averageScore = useMemo(() => {
    const totalScore = chartData.reduce((sum, entry) => sum + entry.score, 0);
    return chartData.length > 0
      ? (totalScore / chartData.length).toFixed(2)
      : 0;
  }, [chartData]);

  const chartConfig = {
    score: {
      label: "Score",
      color: "#6b21a8",
    },
    label: {
      color: "#fff",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-fit dark:bg-zinc-800">
      <CardHeader>
        <CardTitle>Leaderboard Chart</CardTitle>
        <CardDescription>Top 10 Students' Scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="score" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="score"
              layout="vertical"
              fill="var(--color-score)"
              radius={4}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="score"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average Score: {averageScore} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing scores for top 10 students
        </div>
      </CardFooter>
    </Card>
  );
};

export default LeaderboardChart;
