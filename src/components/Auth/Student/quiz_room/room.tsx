import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { useMediaQuery } from "react-responsive";
import { QuizQuestions } from "@/lib/types";
import supabase from "@/services/supabase";
import {
  leaveRoom,
  gameEventHandler,
  getQuizQuestionsStud,
  updateLeaderBoard,
  submitAnswer,
  joinRoom,
  getExitLeaderboard,
} from "@/services/api/apiRoom";

// Components
import ProgressBar from "@/components/Shared/progressbar";
import GameForm from "./game-form";
import KickedDialog from "./kicked-dialog";
import Lobby from "./lobby";
import Leaderboard from "./leaderboard";
import LoadingSpinner from "./loader";

// Assets
import soundOnLobby from "/sounds/lobby-sound.mp3";
import soundCorrect from "/sounds/correct-answer.mp3";
import soundWrong from "/sounds/wrong-answer.mp3";
import soundNoAnswer from "/sounds/wrong-answer.mp3";
import QuestionHeader from "./question-header";
import QuestionContent from "./question-content";
import AnswerStatus from "./answer-status";

// Types
type EffectType = "correct" | "wrong" | "noAnswer" | null;

const SGameLobby: React.FC = () => {
  // Routing and Auth
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // Game State
  const [gameStart, setGameStart] = useState(false);
  const [joined, setJoined] = useState(false);
  const [score, setScore] = useState(0);
  const [rightAns, setRightAns] = useState(0);
  const [wrongAns, setWrongAns] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [effect, setEffect] = useState<EffectType>(null);

  // Answer State
  const [answerInput, setAnswerInput] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Display Name State
  const [displayName, setDisplayName] = useState<string | null>(
    localStorage.getItem("displayName"),
  );
  const [displayNameRequired, setDisplayNameRequired] = useState(!displayName);
  const [kickedDialogOpen, setKickedDialogOpen] = useState(false);

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lobbyMusic = useRef(new Audio(soundOnLobby));
  const correctSound = useRef(new Audio(soundCorrect));
  const wrongSound = useRef(new Audio(soundWrong));
  const noAnswerSound = useRef(new Audio(soundNoAnswer));

  // Theme and Responsive
  const { theme } = useTheme();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const currentQuestion = questions[currentQuestionIndex];

  // Auto-join effect
  useEffect(() => {
    const autoJoin = async () => {
      if (!classId || !user || joined || !displayName) return;

      const success = await joinRoom(classId, user.id, user, displayName);
      if (success) {
        setJoined(true);
        setDisplayNameRequired(false);
        localStorage.setItem("displayName", displayName);
      }
    };

    autoJoin();
  }, [classId, user, joined, displayName]);

  // Game status effect
  useEffect(() => {
    if (classId && joined) {
      gameEventHandler(classId, setGameStart);
    }
  }, [classId, joined]);

  // Question fetching effect
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!classId) return;

      const fetchedQuestions = await getQuizQuestionsStud(classId);
      setQuestions(
        fetchedQuestions.map((q) => ({
          ...q,
          quiz_id: q.quiz_id || "",
        })),
      );
      setTimeLeft(fetchedQuestions[0]?.time || 30);
    };

    fetchQuestions();
  }, [gameStart, classId]);

  // Timer effect
  useEffect(() => {
    if (!showLeaderboard && gameStart) {
      const nextQuestion = questions[currentQuestionIndex];
      setTimeLeft(nextQuestion.time);
    }
  }, [showLeaderboard, gameStart]);

  useEffect(() => {
    if (gameStart && timeLeft >= 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      if (timeLeft === 0) {
        clearInterval(interval);
        handleTimeUp();
      }

      return () => clearInterval(interval);
    }
  }, [timeLeft, gameStart]);

  // Resetter for next question
  useEffect(() => {
    if (!showLeaderboard && gameStart) {
      const nextQuestion = questions[currentQuestionIndex];
      setTimeLeft(nextQuestion.time);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerInput([]);
    }
  }, [showLeaderboard, gameStart, currentQuestionIndex, questions]);

  // Kicked student effect
  useEffect(() => {
    if (!classId || !user?.id) return;

    const channel = supabase
      .channel(classId)
      .on("broadcast", { event: "student_kicked" }, (payload) => {
        if (payload.payload.student_id === user.id) {
          setKickedDialogOpen(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, user?.id]);

  // Music effect
  useEffect(() => {
    const music = lobbyMusic.current;
    music.loop = true;

    const handleUserInteraction = () => {
      document.removeEventListener("click", handleUserInteraction);
      if (!gameStart) {
        music.play().catch(console.error);
      }
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      music.pause();
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [gameStart]);

  const handleTimeUp = async () => {
    if (!hasAnswered && currentQuestion && user) {
      setWrongAns((prev) => prev + 1);
      await submitAnswer(currentQuestion.quiz_question_id, user.id, "");
      setEffect("noAnswer");
      noAnswerSound.current.play();
    }

    setShowLeaderboard(true);

    if (classId && user) {
      await updateLeaderBoard(
        classId,
        user.id,
        user.name || "",
        score,
        rightAns,
        wrongAns + (hasAnswered ? 0 : 1),
      );
    }

    setTimeout(() => {
      handleNextQuestion();
      getExitLeaderboard(setShowLeaderboard);
      setEffect(null);
    }, 5000);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1 && classId) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowLeaderboard(true);
      setGameStart(false);
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

    if (isCorrect) {
      setScore((prev) => prev + (currentQuestion.points || 0));
      setRightAns((prev) => prev + 1);
      setEffect("correct");
      correctSound.current.play();
    } else {
      setWrongAns((prev) => prev + 1);
      setEffect("wrong");
      wrongSound.current.play();
    }
  };

  const handleLeave = () => {
    if (!classId || !user?.id) return;

    const response = leaveRoom(classId, user.id);
    if (!response) {
      alert("Can't leave the game");
      return;
    }

    navigate("/student/dashboard");
  };

  if (displayNameRequired) {
    return (
      <GameForm
        classId={classId!}
        user={user ? { ...user, role: user.role || "" } : null}
        setJoined={setJoined}
        setDisplayNameRequired={setDisplayNameRequired}
        setDisplayName={setDisplayName}
      />
    );
  }

  if (kickedDialogOpen) {
    return (
      <KickedDialog
        isOpen={kickedDialogOpen}
        onClose={() => setKickedDialogOpen(false)}
      />
    );
  }

  if (!joined) {
    return <LoadingSpinner message="Joining the game.." />;
  }

  if (!gameStart) {
    return <Lobby onLeave={handleLeave} />;
  }

  if (showLeaderboard) {
    return <Leaderboard />;
  }

  if (!currentQuestion) {
    return null;
  }

  return (
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
  );
};

export default SGameLobby;
