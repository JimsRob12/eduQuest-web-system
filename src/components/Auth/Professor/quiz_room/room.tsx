/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getParticipants,
  startGame,
  gameEventHandler,
  getQuestionsProf,
  sendEndGame,
  sendExitLeaderboard,
  kickStudent,
} from "@/services/api/apiRoom";
import { QuizQuestions, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleX, Copy } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import ProgressBar from "@/components/Shared/progressbar";
import supabase from "@/services/supabase";
import { useAuth } from "@/contexts/AuthProvider";
import { useLeaderboard } from "./useLeaderboard";

const ProfessorGameLobby: React.FC = () => {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const leaderboardData = useLeaderboard(classId!);
  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const shareableLink = `${window.location.origin}/student/join/${classId}/gamelobby`;

  useEffect(() => {
    const fetchParticipants = async () => {
      if (classId) {
        await getParticipants(classId, setStudents);
      }
    };

    const checkGameStatus = async () => {
      if (classId) {
        await gameEventHandler(classId, setGameStart);
      }
    };

    fetchParticipants();
    checkGameStatus();
  }, [classId]);

  useEffect(() => {
    const getQuestions = async () => {
      if (gameStart && classId) {
        const fetchedQuestions = (await getQuestionsProf(classId)).map(
          (question: QuizQuestions) => ({
            ...question,
            quiz_id: question.quiz_id || "",
          }),
        );
        setQuestions(fetchedQuestions);
        setTimeLeft(fetchedQuestions[0]?.time || 30);
      }
    };
    getQuestions();
  }, [gameStart, classId]);

  useEffect(() => {
    if (gameStart && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }

    if (gameStart && timeLeft === 0) {
      setTimeout(() => {
        handleNextQuestion();
        if (classId) {
          sendExitLeaderboard(classId);
        }
      }, 10000);
    }
  }, [timeLeft, gameStart, classId]);

  useEffect(() => {
    if (classId) {
      const channel = supabase
        .channel(classId)
        .on("broadcast", { event: "student_left" }, (payload) => {
          setStudents((prevStudents) =>
            prevStudents.filter(
              (student) =>
                student.quiz_student_id !== payload.payload.student_id,
            ),
          );
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [classId]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1 && classId) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setTimeLeft(nextQuestion.time);
    } else if (classId) {
      await endGame();
    }
  };

  const endGame = async () => {
    if (classId) {
      const success = await sendEndGame(classId);
      if (success) {
        setGameStart(false);
      }
    }
  };

  const handleKickStudent = async (studentId: string) => {
    if (classId) {
      const success = await kickStudent(classId, studentId);
      if (success) {
        toast.success("Student kicked successfully");
        setStudents(
          students.filter((student) => student.quiz_student_id !== studentId),
        );
      } else {
        toast.error("Failed to kick student");
      }
    }
  };

  const startHandler = () => {
    if (students.length && classId) {
      startGame(classId, user!.id);
    } else {
      console.log("No students have joined yet");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameStart) {
    return (
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
        <h1 className="mb-5 text-7xl font-bold uppercase text-purple-800 md:text-9xl">
          Game Lobby
        </h1>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold">Share Link</h2>
          <div className="flex items-center space-x-2">
            <Input value={shareableLink} readOnly className="w-64" />
            <Button onClick={handleCopyLink} className="">
              {copied ? "Copied!" : <Copy size={20} />}
            </Button>
          </div>
        </div>
        <div className="flex w-full max-w-md flex-wrap justify-center gap-6 border-t border-gray-300 pt-4">
          {students.length > 0 ? (
            students.map((student, index) => {
              const ghostNumber = (index % 4) + 1;
              return (
                <TooltipProvider delayDuration={100} key={index}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="flex w-24 cursor-pointer flex-col items-center justify-between border-gray-200 pb-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleKickStudent(student.quiz_student_id)
                          }
                        >
                          <CircleX className="h-4 w-4" />
                        </Button>
                        <img
                          src={`/ghost-${ghostNumber}.png`}
                          alt={`${student.student_name}'s avatar`}
                          className="w-12 object-cover text-xs"
                        />
                        <p className="text-sm font-semibold">
                          {student.student_name}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-left">
                      <p className="text-sm font-bold">
                        {student.student_name}
                      </p>
                      <p>{student.student_email}</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              );
            })
          ) : (
            <div>Waiting for students to join..</div>
          )}
        </div>
        <Button
          className="mt-8 rounded-md shadow-[0px_4px_0px_#3b1b55] transition-all duration-300 hover:translate-y-1 hover:shadow-none dark:shadow-[0px_4px_0px_#aaa4b1] dark:hover:shadow-none"
          onClick={startHandler}
          disabled={!(students.length > 0)}
        >
          Start Game
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
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
      <div className="w-full">
        <h2 className="mb-4 text-2xl font-semibold">Leaderboard</h2>
        <div className="max-h-96 overflow-y-auto">
          {leaderboardData.map((entry, index) => (
            <div
              key={entry.quiz_student_id}
              className="mb-2 grid grid-cols-[0.1fr_1fr_0.5fr_1fr] gap-2 rounded bg-gray-100 p-2 text-left dark:bg-gray-800"
            >
              <p>{index + 1}.</p>
              <p>{entry.student_name}</p>
              <p>{entry.score}</p>
              <div>
                {/* bar of check and wrong {entry.right_answer}/{entry.wrong_answer} */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-lg font-bold">
        Time Left: {timeLeft} seconds
      </div>
    </div>
  );
};

export default ProfessorGameLobby;
