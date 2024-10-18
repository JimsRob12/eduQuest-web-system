/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import React, { useEffect, useState } from "react";
import { LeaderboardEntry, QuizQuestions } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "@/components/Shared/progressbar";
import Leaderboard from "./leaderboard";
import LeaderboardTrendChart from "./leaderboard-trend-chart";
import LiveQuestionChart from "./live-question-chart";
import ClassAccuracy from "./class-accuracy";
import { sendEndGame, sendExitLeaderboard } from "@/services/api/apiRoom";

interface GameSessionProps {
  currentQuestion: QuizQuestions;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  questions: QuizQuestions[];
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  leaderboardData: LeaderboardEntry[];
  classAccuracy: number;
  classId: string;
  setGameStart: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameSession: React.FC<GameSessionProps> = ({
  currentQuestion,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questions,
  timeLeft,
  setTimeLeft,
  leaderboardData,
  classAccuracy,
  classId,
  setGameStart,
}) => {
  const [activeTab, setActiveTab] = useState("leaderboards");

  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
      return () => clearInterval(interval);
    }
    if (timeLeft === 0) {
      setTimeout(() => {
        handleNextQuestion();
        sendExitLeaderboard(classId);
      }, 10000);
    }
  }, [timeLeft, classId]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setTimeLeft(nextQuestion.time);
    } else {
      await endGame();
    }
  };

  const endGame = async () => {
    await sendEndGame(classId);
    // if (success) {
    //   setGameStart(false);
    // }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 text-center ${
        activeTab === "live-chart"
          ? "h-[calc(100vh+20rem)] sm:h-full"
          : "h-full"
      }`}
    >
      <ClassAccuracy accuracy={classAccuracy} />
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className="mb-4 text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <p className="text-xl font-bold">
            {currentQuestion?.points} point{currentQuestion?.points! > 1 && "s"}
          </p>
        </div>
        <div className="mb-4 w-full">
          <ProgressBar
            progress={(timeLeft / (currentQuestion?.time || 30)) * 100}
            height={24}
          />
        </div>
      </div>
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
              <LeaderboardTrendChart leaderboardData={leaderboardData} />
              <LiveQuestionChart
                currentQuestionIndex={currentQuestionIndex}
                questions={questions}
                leaderboardData={leaderboardData}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-lg font-bold">
          Time Left: {timeLeft} seconds
        </div>
      </div>
    </div>
  );
};

export default GameSession;
