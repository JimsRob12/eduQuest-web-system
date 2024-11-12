import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QuizQuestions, Student } from "@/lib/types";
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
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { calculateClassAccuracy } from "@/lib/helpers";

const ProfessorGameLobby: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const leaderboardData = useLeaderboard(classId!);
  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQuestion = questions[currentQuestionIndex];

  const { mutate: handleStartGame, isPending: isGameStarting } = useMutation({
    mutationFn: ({
      classId,
      studentId,
    }: {
      classId: string;
      studentId: string;
    }) => startGame(classId, studentId),
    onError: () => {
      toast.error("Unable to start the game!");
    },
  });

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

  if (!gameStart) {
    return (
      <WaitingLobby
        students={students}
        setStudents={setStudents}
        classId={classId!}
        onStartGame={async (classId: string, studentId: string) =>
          handleStartGame({ classId, studentId })
        }
        isGameStarting={isGameStarting}
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
