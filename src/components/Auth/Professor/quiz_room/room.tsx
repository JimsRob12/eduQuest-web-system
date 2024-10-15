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
import { Copy, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

// interface Participant {
//   student_name: string;
//   student_avatar: string;
//   student_email: string;
// }

const GameLobby: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [leaderBoard, setLeaderBoard] = useState(false);
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
      startGame(classId);
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

  if (leaderBoard) {
    return <h1 className="text-center text-2xl font-bold">LeaderBoard</h1>;
  }

  if (!gameStart) {
    return (
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
        <div className="mb-5">
          <h1 className="mb-4 text-3xl font-bold">Game Lobby</h1>
          <Button
            className="rounded-md shadow-[0px_4px_0px_#3b1b55] transition-all duration-300 hover:translate-y-1 hover:shadow-none dark:shadow-[0px_4px_0px_#aaa4b1] dark:hover:shadow-none"
            onClick={startHandler}
            disabled={!(students.length > 0)}
          >
            Start Game
          </Button>
          <Button
            className="rounded-md shadow-[0px_4px_0px_#3b1b55] ml-2 transition-all duration-300 hover:translate-y-1 hover:shadow-none dark:shadow-[0px_4px_0px_#aaa4b1] dark:hover:shadow-none"
            onClick={leaveHandler}
            disabled={!(students.length > 0)}
          >
            Leave Game
          </Button>
        </div>
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold">Share Link</h2>
          <div className="flex items-center space-x-2">
            <Input value={shareableLink} readOnly className="w-64" />
            <Button onClick={handleCopyLink} className="">
              {copied ? "Copied!" : <Copy size={20} />}
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md border-t border-gray-300 pt-4">
          {students.length > 0 ? (
            students.map((student, index) => {
              return (
                <TooltipProvider delayDuration={100} key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-pointer items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center">
                          <img
                            src={student.student_avatar}
                            alt={`${student.student_name}'s avatar`}
                            className="size-12 rounded-full object-cover"
                          />
                          <p className="ml-4">{student.student_name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleKickStudent(student.quiz_student_id)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
      </div>
    );
  }

  return currentQuestion ? (
    <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">
        Question {currentQuestionIndex + 1}
      </h1>
      <div className="mb-6">
        <h2 className="mb-4 text-xl">{currentQuestion.question}</h2>
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.distractor &&
            currentQuestion.distractor.map((choice, index) => (
              <Button
                key={index}
                className="rounded border border-gray-300 bg-gray-200 px-4 py-2 text-lg font-semibold hover:bg-gray-300"
              >
                {choice}
              </Button>
            ))}
        </div>
      </div>
      <div className="text-lg font-bold">Time Left: {timeLeft} seconds</div>
    </div>
  ) : null;
};

export default GameLobby;
