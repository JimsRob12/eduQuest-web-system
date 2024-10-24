import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ScheduledQuizLobby from "./room";
import { useGame } from "@/contexts/GameProvider";
import { ArrowLeft, Calendar } from "lucide-react";

interface QuizData {
  title: string;
  openTime: string;
  closeTime: string;
  classCode: string;
}

// Separate component for scheduled quiz info display
const ScheduledQuizInfo: React.FC<{
  quizData: QuizData;
  onStartQuiz: () => void;
}> = ({ quizData, onStartQuiz }) => {
  const navigate = useNavigate();
  const now = new Date();
  const openDate = new Date(quizData.openTime);
  const closeDate = new Date(quizData.closeTime);
  const isQuizOpen = now >= openDate && now <= closeDate;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <Calendar className="h-8 w-8 text-purple-500" />
      <h1 className="text-3xl font-bold text-purple-500">{quizData.title}</h1>
      <div className="space-y-2">
        <p className="text-gray-600">
          Opens: {new Date(quizData.openTime).toLocaleString()}
        </p>
        <p className="text-gray-600">
          Closes: {new Date(quizData.closeTime).toLocaleString()}
        </p>
      </div>
      {isQuizOpen ? (
        <Button onClick={onStartQuiz} className="mt-4">
          Start Quiz
        </Button>
      ) : now < openDate ? (
        <>
          <p className="text-yellow-600">Quiz has not opened yet</p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-red-600">Quiz has closed</p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const ScheduledQuizRoute: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { classId } = useParams();
  const { setGameStarted } = useGame();

  // Get quiz data from router state
  const { title, openTime, closeTime } = location.state || {};

  // If we don't have the required data, redirect to dashboard
  if (!title || !openTime || !closeTime || !classId) {
    navigate("/student/dashboard");
    return null;
  }

  const quizData = {
    title,
    openTime,
    closeTime,
    classCode: classId,
  };

  // Handle quiz start
  const handleStartQuiz = () => {
    setShowQuiz(true);
    setGameStarted(true);
  };

  // Handle quiz completion
  const handleComplete = () => {
    navigate("/student/dashboard");
    setGameStarted(false);
  };

  // Show quiz lobby if started, otherwise show info screen
  if (showQuiz) {
    return (
      <ScheduledQuizLobby classCode={classId} onComplete={handleComplete} />
    );
  }

  return (
    <div className="flex h-[calc(100%-5rem)] items-center justify-center">
      <ScheduledQuizInfo quizData={quizData} onStartQuiz={handleStartQuiz} />
    </div>
  );
};

export default ScheduledQuizRoute;
