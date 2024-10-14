/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getParticipants,
  startGame,
  gameEventHandler,
  getQuestionsProf,
  sendNextQuestion,
  sendEndGame,
  sendExitLeaderboard,
} from "@/services/api/apiRoom";
import { QuizQuestions as Questions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

interface Student {
  student_name: string;
}

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
      await sendNextQuestion(
        nextQuestion.quiz_question_id,
        nextQuestion.question,
        nextQuestion.distractor,
        nextQuestion.time,
        nextQuestion.image_url,
        nextQuestion.points,
        nextQuestion.question_type,
        nextQuestion.order,
        classId,
      );
      setTimeLeft(nextQuestion.time);
    } else if (classId) {
      sendEndGame(classId);
      setGameStart(false);
    }
  };

  const startHandler = () => {
    if (students.length && classId) {
      startGame(classId);
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
            students.map((student, index) => (
              <div key={index} className="border-b border-gray-200 py-2">
                {student.student_name}
              </div>
            ))
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
