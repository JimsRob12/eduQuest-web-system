import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { LeaderboardEntry, QuizQuestions, Student } from "@/lib/types";
import supabase from "@/services/supabase";
import { useLeaderboard } from "./useLeaderboard";

// Components
import WaitingLobby from "./waiting-lobby";
import GameSession from "./game-session";
import {
  getParticipants,
  startGame,
  gameEventHandler,
  getQuestionsProf,
} from "@/services/api/apiRoom";

const ProfessorGameLobby: React.FC = () => {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const leaderboardData = useLeaderboard(classId!);
  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = questions[currentQuestionIndex];

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

  const handleStartGame = () => {
    if (students.length && classId) {
      startGame(classId, user!.id);
    }
  };

  const calculateClassAccuracy = (leaderboardData: LeaderboardEntry[]) => {
    if (leaderboardData.length === 0) return 0;
    const totalRight = leaderboardData.reduce(
      (sum, entry) => sum + entry.right_answer,
      0,
    );
    const totalQuestions = leaderboardData.reduce(
      (sum, entry) => sum + entry.right_answer + entry.wrong_answer,
      0,
    );
    return totalQuestions > 0 ? (totalRight / totalQuestions) * 100 : 0;
  };

  if (!gameStart) {
    return (
      <WaitingLobby
        students={students}
        setStudents={setStudents}
        classId={classId!}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <GameSession
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
      questions={questions}
      timeLeft={timeLeft}
      setTimeLeft={setTimeLeft}
      leaderboardData={leaderboardData}
      classAccuracy={calculateClassAccuracy(leaderboardData)}
      classId={classId!}
      setGameStart={setGameStart}
    />
  );
};

export default ProfessorGameLobby;
