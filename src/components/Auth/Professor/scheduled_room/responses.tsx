import ClassAccuracy from "../quiz_room/class-accuracy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leaderboard from "../quiz_room/leaderboard";
import LiveQuestionChart from "../quiz_room/live-question-chart";
import LeaderboardChart from "../quiz_room/leaderboard-trend-chart";
import { useState } from "react";
import { useLeaderboard } from "../quiz_room/useLeaderboard";
import { useParams } from "react-router-dom";
import { calculateClassAccuracy } from "@/lib/helpers";

export default function Responses() {
  const { classId } = useParams();
  const leaderboardData = useLeaderboard(classId!);
  const classAccuracy = calculateClassAccuracy(leaderboardData);
  const [activeTab, setActiveTab] = useState("leaderboards");

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-8 text-center ${
        activeTab === "live-chart"
          ? "h-[calc(100vh+20rem)] sm:h-full"
          : "h-full"
      }`}
    >
      <ClassAccuracy accuracy={classAccuracy} />

      <div className="w-full">
        <Tabs
          defaultValue="leaderboards"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            <TabsTrigger value="live-chart">Live Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="leaderboards" className="w-full">
            <Leaderboard leaderboardData={leaderboardData} />
          </TabsContent>
          <TabsContent value="live-chart">
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <LeaderboardChart leaderboardData={leaderboardData} />
              <LiveQuestionChart leaderboardData={leaderboardData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
