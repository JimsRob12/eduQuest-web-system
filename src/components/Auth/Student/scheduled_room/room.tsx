import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { useMediaQuery } from "react-responsive";
import { QuizQuestions, LeaderboardEntry } from "@/lib/types";
import { submitAnswer, updateLeaderBoard } from "@/services/api/apiRoom";

// Components
import ProgressBar from "@/components/Shared/progressbar";
import GameForm from "../quiz_room/game-form";
import Summary from "../quiz_room/summary";
import LoadingSpinner from "../quiz_room/loader";
import QuestionHeader from "../quiz_room/question-header";
import QuestionContent from "../quiz_room/question-content";
import AnswerStatus from "../quiz_room/answer-status";
import FullScreenButton from "../quiz_room/full-screen";
import Leaderboard from "../quiz_room/leaderboard";

// Assets
import soundCorrect from "/sounds/correct-answer.mp3";
import soundWrong from "/sounds/wrong-answer.mp3";
import { getQuestionsForScheduledQuiz } from "@/services/api/apiScheduledQuiz";

// Types
type EffectType = "correct" | "wrong" | "noAnswer" | null;

interface ScheduledQuizLobbyProps {
  classCode: string;
  onComplete: () => void;
}

const ScheduledQuizLobby: React.FC<ScheduledQuizLobbyProps> = ({
  classCode,
  onComplete,
}) => {
  // Routing and Auth
  const { user } = useAuth();

  // Quiz State
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [rightAns, setRightAns] = useState(0);
  const [wrongAns, setWrongAns] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [effect, setEffect] = useState<EffectType>(null);
  const [userAccuracy, setUserAccuracy] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<
    {
      question: string;
      userAnswer: string;
      correctAnswer: string;
    }[]
  >([]);

  // Answer State
  const [answerInput, setAnswerInput] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Display Name State
  const [displayName, setDisplayName] = useState<string | null>(
    localStorage.getItem("displayName"),
  );
  const [displayNameRequired, setDisplayNameRequired] = useState(!displayName);

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const correctSound = useRef(new Audio(soundCorrect));
  const wrongSound = useRef(new Audio(soundWrong));

  // Theme and Responsive
  const { theme } = useTheme();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const currentQuestion = questions[currentQuestionIndex];

  // Fetch all questions at once
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const fetchedQuestions = await getQuestionsForScheduledQuiz(classCode);
      setQuestions(fetchedQuestions);
      if (fetchedQuestions.length > 0) {
        setTimeLeft(fetchedQuestions[0].time);
      }
      setIsLoading(false);
    };

    fetchQuestions();
  }, [classCode]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeLeft > 0 && !hasAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
          if (newTime === 0) {
            handleNoAnswer();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeft, hasAnswered]);

  const handleNoAnswer = async () => {
    if (!hasAnswered && currentQuestion && user) {
      setHasAnswered(true);
      setWrongAns((prev) => prev + 1);
      setEffect("noAnswer");
      wrongSound.current.play();

      // Record the no-answer in answered questions
      setAnsweredQuestions([
        ...answeredQuestions,
        {
          question: currentQuestion.question,
          userAnswer: "No answer",
          correctAnswer: currentQuestion.right_answer,
        },
      ]);

      // Calculate user accuracy
      const newAccuracy = (rightAns / (currentQuestionIndex + 1)) * 100;
      setUserAccuracy(newAccuracy);

      // Submit a blank answer to track the attempt
      await submitAnswer(currentQuestion.quiz_question_id, user.id, "");

      // Move to next question after delay
      setTimeout(handleNextQuestion, 2000);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(questions[currentQuestionIndex + 1].time);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerInput([]);
      setEffect(null);
    } else {
      // Pass current score values to finishQuiz
      const finalScore = score;
      const finalRightAns = rightAns;
      const finalWrongAns = wrongAns;
      await finishQuiz(finalScore, finalRightAns, finalWrongAns);
    }
  };

  const finishQuiz = async (
    finalScore: number,
    finalRightAns: number,
    finalWrongAns: number,
  ) => {
    if (classCode && user) {
      // Use the passed values instead of reading from state
      const finalLeaderboard = await updateLeaderBoard(
        classCode,
        user.id,
        user.name || displayName || "",
        user.avatar,
        user.email,
        finalScore,
        finalRightAns,
        finalWrongAns,
      );

      // Update all relevant states with final values
      setScore(finalScore);
      setRightAns(finalRightAns);
      setWrongAns(finalWrongAns);
      setLeaderboardData(finalLeaderboard || []);

      // Find user rank
      const userIndex =
        finalLeaderboard?.findIndex(
          (entry) => entry.quiz_student_id === user.id,
        ) ?? -1;
      setUserRank(userIndex + 1);

      // Show leaderboard first
      setShowLeaderboard(true);

      // After 8 seconds, show the summary
      setTimeout(() => {
        setShowLeaderboard(false);
        setShowSummary(true);
      }, 8000);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !user || hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    const isCorrect = await submitAnswer(
      currentQuestion.quiz_question_id,
      user.id,
      answer,
    );

    // Calculate new values
    const newScore = score + (isCorrect ? currentQuestion.points || 0 : 0);
    const newRightAns = rightAns + (isCorrect ? 1 : 0);
    const newWrongAns = wrongAns + (isCorrect ? 0 : 1);

    // Update states with new values
    setScore(newScore);
    setRightAns(newRightAns);
    setWrongAns(newWrongAns);

    if (isCorrect) {
      setEffect("correct");
      correctSound.current.play();
    } else {
      setEffect("wrong");
      wrongSound.current.play();
    }

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        question: currentQuestion.question,
        userAnswer: answer,
        correctAnswer: currentQuestion.right_answer,
      },
    ]);

    // Calculate user accuracy using new values
    const newAccuracy = (newRightAns / (currentQuestionIndex + 1)) * 100;
    setUserAccuracy(newAccuracy);

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex === questions.length - 1) {
        // If this is the last question, pass the final scores directly
        finishQuiz(newScore, newRightAns, newWrongAns);
      } else {
        handleNextQuestion();
      }
    }, 2000);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (displayNameRequired) {
    return (
      <GameForm
        classId={classCode!}
        user={user ? { ...user, role: user.role || "" } : null}
        setDisplayNameRequired={setDisplayNameRequired}
        setDisplayName={setDisplayName}
        setJoined={() => false}
      />
    );
  }

  if (showLeaderboard && user) {
    return (
      <>
        <FullScreenButton />
        <Leaderboard
          leaderboardData={leaderboardData}
          currentUserId={user.id}
        />
      </>
    );
  }

  if (showSummary) {
    return (
      <>
        <FullScreenButton />
        <Summary
          score={score}
          rightAns={rightAns}
          wrongAns={wrongAns}
          totalQuestions={questions.length}
          totalParticipants={leaderboardData.length}
          accuracy={userAccuracy}
          rank={userRank}
          questions={answeredQuestions}
          onFinish={onComplete}
        />
      </>
    );
  }

  return (
    <>
      <FullScreenButton />
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
        <QuestionHeader
          questionNumber={currentQuestionIndex + 1}
          points={currentQuestion.points!}
        />

        <div className="mb-4 w-full">
          <ProgressBar
            progress={(timeLeft / currentQuestion.time) * 100}
            height={24}
          />
        </div>

        <QuestionContent
          question={currentQuestion.question}
          questionType={currentQuestion.question_type}
          distractor={currentQuestion.distractor}
          rightAnswer={currentQuestion.right_answer}
          isTabletOrMobile={isTabletOrMobile}
          theme={theme}
          hasAnswered={hasAnswered}
          selectedAnswer={selectedAnswer}
          effect={effect}
          handleAnswer={handleAnswer}
          answerInput={answerInput}
          setAnswerInput={setAnswerInput}
          inputRefs={inputRefs}
        />

        <AnswerStatus
          hasAnswered={hasAnswered}
          effect={effect}
          timeLeft={timeLeft}
        />
      </div>
    </>
  );
};

export default ScheduledQuizLobby;
