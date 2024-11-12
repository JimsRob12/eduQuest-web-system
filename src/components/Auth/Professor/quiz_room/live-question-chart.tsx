import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LeaderboardEntry } from "@/lib/types";

interface LiveQuestionChartProps {
  currentQuestionIndex?: number;
  questions?: { question: string }[];
  leaderboardData: LeaderboardEntry[];
}

const chartConfig = {
  correct: {
    label: "Correct",
    color: "#22c55e",
  },
  incorrect: {
    label: "Incorrect",
    color: "#ef4444",
  },
} satisfies ChartConfig;

const LiveQuestionChart: React.FC<LiveQuestionChartProps> = ({
  currentQuestionIndex,
  questions,
  leaderboardData,
}) => {
  const chartData = useMemo(() => {
    return leaderboardData.map((entry) => ({
      name: entry.student_name,
      correct: entry.right_answer,
      incorrect: entry.wrong_answer,
    }));
  }, [leaderboardData]);

  const totalAnswers = useMemo(() => {
    return leaderboardData.reduce(
      (total, entry) => total + entry.right_answer + entry.wrong_answer,
      0,
    );
  }, [leaderboardData]);

  const correctPercentage = useMemo(() => {
    const totalCorrect = leaderboardData.reduce(
      (total, entry) => total + entry.right_answer,
      0,
    );
    return totalAnswers > 0
      ? ((totalCorrect / totalAnswers) * 100).toFixed(1)
      : 0;
  }, [leaderboardData, totalAnswers]);

  return (
    <Card className="mb-4 h-fit w-full max-w-4xl dark:bg-zinc-800">
      <CardHeader>
        <CardTitle>
          {questions && currentQuestionIndex
            ? `Question ${currentQuestionIndex + 1} Results`
            : "Question Responses"}
        </CardTitle>
        <CardDescription>
          {questions && currentQuestionIndex
            ? `${questions[currentQuestionIndex]?.question || "Loading..."}`
            : "Review the responses to the questions below to understand how participants answered."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.slice(0, 10) + (value.length > 10 ? "..." : "")
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="correct"
              stackId="a"
              fill="var(--color-correct)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="incorrect"
              stackId="a"
              fill="var(--color-incorrect)"
              radius={[0, 0, 4, 4]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {correctPercentage}% correct answers{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing results for {totalAnswers} total answers
        </div>
      </CardFooter>
    </Card>
  );
};

export default LiveQuestionChart;
