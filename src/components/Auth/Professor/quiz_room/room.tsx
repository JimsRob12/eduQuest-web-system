/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getParticipants,
  startGame,
  endGame,
  gameEventHandler,
  getQuestionsProf,
  sendNextQuestion,
  sendEndGame,
  sendExitLeaderboard,
  kickStudent,
} from "@/services/api/apiRoom";
import { QuizQuestions as Questions, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CircleX, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/ThemeProvider";
import { useMediaQuery } from "react-responsive";
import ProgressBar from "@/components/Shared/progressbar";
import supabase from "@/services/supabase";
import { useAuth } from "@/contexts/AuthProvider";

// interface Participant {
//   student_name: string;
//   student_avatar: string;
//   student_email: string;
// }

const GameLobby: React.FC = () => {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [leaderBoard, setLeaderBoard] = useState(false);
  const [copied, setCopied] = useState(false);

  const { theme } = useTheme();
  const isTabletorMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33"];
  const lightColors = ["#FF8C66", "#37a753", "#668CFF", "#FF66C2", "#FFB366"];

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
          (question: any) => ({
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
      setLeaderBoard(true);
      setTimeout(() => {
        handleNextQuestion();
        if (classId) {
          sendExitLeaderboard(classId);
        }
        setLeaderBoard(false);
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
        })
        .subscribe();

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
      // await sendNextQuestion(
      //   {
      //     quiz_question_id: nextQuestion.quiz_question_id,
      //     question: nextQuestion.question,
      //     distractor: nextQuestion.distractor,
      //     time: nextQuestion.time,
      //     image_url: nextQuestion.image_url,
      //     points: nextQuestion.points,
      //     question_type: nextQuestion.question_type,
      //     order: nextQuestion.order,
      //     quiz_id: nextQuestion.quiz_id,
      //     right_answer: nextQuestion.right_answer,
      //   },
      //   classId,
      // );
            
      setTimeLeft(nextQuestion.time);
    } else if (classId) {
      sendEndGame(classId);
      setGameStart(false);
    }
  };

  const handleKickStudent = async (studentId: string) => {
    if (classId) {
      const success = await kickStudent(classId, studentId);
      if (success) {
        toast.success("Student kicked successfully");
        // Update the students list
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

  const leaveHandler = () => {
    if (students.length && classId) {
      endGame(classId);
    } else {
      console.log("No students have joined yet");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMultipleChoice = () => {
    if (!currentQuestion) return null;

    return (
      <div
        className="mt-4 grid gap-2 rounded-lg"
        style={{
          gridTemplateColumns: isTabletorMobile
            ? `repeat(1, 1fr)`
            : `repeat(${currentQuestion.distractor?.length || 0}, 1fr)`,
        }}
      >
        {currentQuestion.distractor?.map((answer, index) => {
          const bgColor =
            theme === "dark"
              ? lightColors[index % lightColors.length]
              : colors[index % colors.length];

          return (
            <div
              key={index}
              className="rounded-lg p-1 transition-transform duration-200 ease-in-out hover:translate-y-1 md:h-56"
              style={{
                backgroundColor: bgColor,
                color: "#fff",
              }}
            >
              <div className="mt-2 flex h-full items-center justify-center rounded-lg border-none p-2 text-lg">
                {answer}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTrueFalse = () => {
    if (!currentQuestion) return null;

    return (
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["True", "False"].map((option) => (
          <div
            key={option}
            className="rounded-lg bg-purple-800 bg-opacity-20 p-4 text-left transition-transform duration-200 ease-in-out hover:translate-y-1 md:h-56"
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  const renderFillInTheBlank = () => {
    if (!currentQuestion) return null;

    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-zinc-200 p-4 dark:bg-zinc-800">
        <h1 className="mb-4 text-center font-bold opacity-70">
          Type your answer in the boxes
        </h1>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              currentQuestion.right_answer.length,
              isTabletorMobile ? 5 : 10,
            )}, 1fr)`,
          }}
        >
          {currentQuestion.right_answer.split("").map((_, index) => (
            <div
              key={index}
              className="flex size-12 items-center justify-center rounded-lg bg-zinc-700 text-center text-white"
            />
          ))}
        </div>
      </div>
    );
  };

  if (leaderBoard) {
    return <h1 className="text-center text-2xl font-bold">LeaderBoard</h1>;
  }

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
                  <Tooltip>
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
                  </Tooltip>
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

  return currentQuestion ? (
    <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-4 text-2xl font-bold">
          Question {currentQuestionIndex + 1}
        </h1>
        <p className="text-xl font-bold">
          {currentQuestion.points} point{currentQuestion.points! > 1 && "s"}
        </p>
      </div>
      <div className="mb-4 w-full">
        <ProgressBar
          progress={(timeLeft / currentQuestion.time) * 100}
          height={24}
        />
      </div>
      <div className="mb-6 w-full">
        <h2 className="mb-4 flex h-44 items-center justify-center rounded-lg bg-zinc-200 text-xl dark:bg-zinc-800">
          {currentQuestion.question}
        </h2>
        {currentQuestion.question_type.toLowerCase() === "mcq" &&
          renderMultipleChoice()}
        {currentQuestion.question_type.toLowerCase() === "boolean" &&
          renderTrueFalse()}
        {currentQuestion.question_type.toLowerCase() === "short" &&
          renderFillInTheBlank()}
      </div>
      <div className="text-lg font-bold">Time Left: {timeLeft} seconds</div>
    </div>
  ) : null;
};

export default GameLobby;
