import React, { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  leaveRoom,
  gameEventHandler,
  getQuizQuestionsStud,
  updateLeaderBoard,
  submitAnswer,
  joinRoom,
  getExitLeaderboard,
} from "@/services/api/apiRoom";
import { QuizQuestions as Question, QuizQuestions } from "@/lib/types";
import toast from "react-hot-toast";
import supabase from "@/services/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import soundOnMount from "/sounds/game-start.mp3";
import soundOnLoop from "/sounds/lobby-sound.mp3";
import { useTheme } from "@/contexts/ThemeProvider";
import { useMediaQuery } from "react-responsive";
import ProgressBar from "@/components/Shared/progressbar";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const SGameLobby: React.FC = () => {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [joined, setJoined] = useState(false);
  const [score, setScore] = useState(0);
  const [rightAns, setRightAns] = useState(0);
  const [wrongAns, setWrongAns] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answerInput, setAnswerInput] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(
    localStorage.getItem("displayName"),
  );
  const [displayNameRequired, setDisplayNameRequired] = useState(!displayName);
  const [kickedDialogOpen, setKickedDialogOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { theme } = useTheme();
  const isTabletorMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33"];
  const lightColors = ["#FF8C66", "#37a753", "#668CFF", "#FF66C2", "#FFB366"];

  const currentQuestion = questions[currentQuestionIndex];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    const autoJoin = async () => {
      if (classId && user && !joined) {
        const studentId = user.id ?? "";
        const name = displayName || user.name || "";
        if (!name) {
          setDisplayNameRequired(true);
        } else {
          const success = await joinRoom(classId, studentId, user, name);
          if (success) {
            setJoined(true);
            setDisplayNameRequired(false);
            if (displayName) localStorage.setItem("displayName", displayName);
          } else {
            console.error("Failed to auto-join the room");
          }
        }
      }
    };

    autoJoin();
  }, [classId, user, joined, displayName]);

  useEffect(() => {
    const checkGameStatus = async () => {
      if (classId && joined) {
        await gameEventHandler(classId, setGameStart);
      }
    };

    if (joined) {
      checkGameStatus();
    }
  }, [classId, joined]);

  const getQuestion = async () => {
    if (classId) {
      const fetchedQuestions = (await getQuizQuestionsStud(classId)).map(
        (question: QuizQuestions) => ({
          ...question,
          quiz_id: question.quiz_id || "",
        }),
      );
      setQuestions(fetchedQuestions);
      setTimeLeft(fetchedQuestions[0]?.time || 30);
    }
  };
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1 && classId) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    } else if (classId) {
      setShowLeaderboard(true);
      setGameStart(false);
    }
  };
  useEffect(() => {
    getQuestion();
  }, [gameStart, classId]);
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
        setShowLeaderboard(true);
        updateLeaderBoard(
          classId!,
          user!.id,
          user!.name || "",
          score,
          rightAns,
          wrongAns,
        );

        setTimeout(() => {
          handleNextQuestion();
          getExitLeaderboard(setShowLeaderboard);
        }, 5000);
      }

      return () => clearInterval(interval);
    }
  }, [timeLeft, gameStart]);

  useEffect(() => {
    if (classId && user?.id) {
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
    }
  }, [classId, user?.id]);

  useEffect(() => {
    if (!showLeaderboard && gameStart) {
      const nextQuestion = questions[currentQuestionIndex];
      setTimeLeft(nextQuestion.time);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerInput([]);
    }
  }, [showLeaderboard, gameStart, currentQuestionIndex, questions]);

  const handleKickedDialogClose = () => {
    setKickedDialogOpen(false);
    navigate("/student/dashboard");
  };

  const leaveHandler = () => {
    if (classId && user?.id) {
      const response = leaveRoom(classId, user.id);
      if (!response) alert("Can't leave the game");
      navigate("/student/dashboard");
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !user || hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);
    const response = await submitAnswer(
      currentQuestion.quiz_question_id,
      user.id,
      answer,
    );
    if (!response) {
      setWrongAns((prev) => prev + 1);
    } else {
      setScore((prev) => prev + (currentQuestion.points || 0));
      setRightAns((prev) => prev + 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (classId && user) {
      const success = await joinRoom(
        classId,
        user.id ?? "",
        user,
        values.username,
      );
      if (success) {
        setJoined(true);
        setDisplayNameRequired(false);
        setDisplayName(values.username);
        localStorage.setItem("displayName", values.username);
      } else {
        toast.error("Failed to join the room");
      }
    }
  };

  useEffect(() => {
    let soundMount: HTMLAudioElement | null = null;
    let soundLoop: HTMLAudioElement | null = null;

    // Preload the audio files
    const preloadSounds = () => {
      soundMount = new Audio(soundOnMount);
      soundMount.preload = "auto"; // Preload the mount sound
      soundLoop = new Audio(soundOnLoop);
      soundLoop.preload = "auto"; // Preload the loop sound
    };

    const playSounds = () => {
      if (soundMount) {
        // Attempt to play the mount sound
        soundMount.play().catch((error) => {
          console.error("Mount sound blocked by autoplay policies:", error);
        });

        soundMount.onended = () => {
          if (soundLoop) {
            soundLoop.loop = true;
            // Attempt to play the loop sound
            soundLoop.play().catch((error) => {
              console.error("Loop sound blocked by autoplay policies:", error);
            });
          }
        };
      }
    };

    // Preload sounds initially
    preloadSounds();

    // Trigger sound play after the first user interaction (click/tap)
    const handleUserInteraction = () => {
      document.removeEventListener("click", handleUserInteraction); // Remove listener after interaction
      playSounds(); // Play sound instantly after interaction
    };

    document.addEventListener("click", handleUserInteraction);

    // Cleanup event listeners and sounds on unmount
    return () => {
      if (soundMount) soundMount.pause();
      if (soundLoop) soundLoop.pause();
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

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
          const isSelected = selectedAnswer === answer;
          const isDisabled = hasAnswered;

          return (
            <Button
              key={index}
              className={`h-full rounded-lg p-1 transition-transform duration-200 ease-in-out hover:translate-y-1 md:h-56 ${
                isDisabled && !isSelected ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor: isSelected
                  ? bgColor
                  : isDisabled
                    ? "gray"
                    : bgColor,
                color: "#fff",
              }}
              onClick={() => handleAnswer(answer)}
              disabled={isDisabled}
            >
              <div className="mt-2 flex h-full items-center justify-center rounded-lg border-none p-2 text-lg">
                {answer.charAt(0).toUpperCase() + answer.slice(1)}
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

  const renderTrueFalse = () => {
    if (!currentQuestion) return null;

    return (
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["True", "False"].map((option) => {
          const isSelected = selectedAnswer === option;
          const isDisabled = hasAnswered;

          return (
            <Button
              key={option}
              className={`rounded-lg bg-purple-800 bg-opacity-20 p-4 text-left transition-transform duration-200 ease-in-out hover:translate-y-1 md:h-56 ${isDisabled && !isSelected ? "opacity-50" : ""}`}
              style={{
                backgroundColor: isSelected
                  ? "purple"
                  : isDisabled
                    ? "gray"
                    : "purple",
                opacity: isDisabled && !isSelected ? 0.5 : 1,
              }}
              onClick={() => handleAnswer(option)}
              disabled={isDisabled}
            >
              {option}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderFillInTheBlank = () => {
    if (!currentQuestion) return null;

    const handleInputChange = (index: number, value: string) => {
      const newInput = [...answerInput];
      newInput[index] = value;
      setAnswerInput(newInput);

      if (index < currentQuestion.right_answer.length - 1 && value !== "") {
        inputRefs.current[index + 1]?.focus();
      }

      if (
        newInput.filter(Boolean).length ===
          currentQuestion.right_answer.length &&
        !hasAnswered
      ) {
        handleAnswer(newInput.join(""));
      }
    };

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
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              className="flex size-12 items-center justify-center rounded-lg bg-zinc-700 text-center text-white"
              maxLength={1}
              value={answerInput[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={hasAnswered}
            />
          ))}
        </div>
      </div>
    );
  };

  if (displayNameRequired) {
    return (
      <div className="flex h-[calc(100%-5rem)] items-center justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg bg-zinc-200 p-4 dark:bg-zinc-800 md:p-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your display name"
                      className="dark:border-zinc-950"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This name will be visible to your teachers and classmates
                    and will be used for recording your quiz scores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full rounded-md shadow-[0px_4px_0px_#3b1b55] transition-all duration-300 hover:translate-y-1 hover:shadow-none dark:shadow-[0px_4px_0px_#aaa4b1] dark:hover:shadow-none"
            >
              Join Game
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  if (kickedDialogOpen)
    return (
      <Dialog open={kickedDialogOpen} onOpenChange={handleKickedDialogClose}>
        <DialogContent className="dark:text-white">
          <DialogHeader>
            <DialogTitle>You have been removed from the game</DialogTitle>
            <DialogDescription>
              The game owner has removed you from this game session. You will be
              redirected to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleKickedDialogClose}>OK</Button>
        </DialogContent>
      </Dialog>
    );

  if (!joined) {
    return (
      <div className="flex h-[calc(100%-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Joining the game...</span>
      </div>
    );
  }

  if (!gameStart) {
    return (
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center">
        <h1 className="mb-5 text-7xl font-bold uppercase text-purple-800 md:text-9xl">
          Game Lobby
        </h1>
        <div className="w-full max-w-md space-y-4">
          <div className="text-center text-gray-500">
            Waiting for the game to start...
          </div>
        </div>
        <Button className="mt-8" onClick={leaveHandler} variant="destructive">
          Leave Game
        </Button>
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <div className="flex h-[calc(100%-5rem)] items-center justify-center">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        {/* Add leaderboard content here */}
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
      {hasAnswered ? (
        <div className="mt-4 text-lg font-bold">
          Answer submitted! Waiting for other player's answer...
        </div>
      ) : (
        <div className="text-lg font-bold">Time Left: {timeLeft} seconds</div>
      )}
    </div>
  ) : null;
};

export default SGameLobby;
