import React, { useState, useEffect } from "react";
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
  getEndGame,
  getExitLeaderboard,
} from "@/services/api/apiRoom";
import { QuizQuestions as Question } from "@/lib/types";
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(
    localStorage.getItem("displayName"),
  );
  const currentQuestion = questions[currentQuestionIndex];

  const [displayNameRequired, setDisplayNameRequired] = useState(!displayName);
  const [kickedDialogOpen, setKickedDialogOpen] = useState(false);

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
        (question: any) => ({
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
      setGameStart(false)
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
          handleNextQuestion()
          getExitLeaderboard(setShowLeaderboard)
        }, 10000);
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

  const handleAnswer = async (
    questionId: string,
    studentId: string,
    answer: string,
    qScore: number,
  ) => {
    const response = await submitAnswer(questionId, studentId, answer);
    if (!response) {
      setWrongAns((prev) => prev + 1);
    } else {
      setScore((prev) => prev + qScore);
      setRightAns((prev) => prev + 1);
    }
    setTimeLeft(0); // Force show leaderboard after answering
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
    <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-3xl font-bold">Question</h1>
      <div className="mb-8 w-full max-w-2xl">
        <h2 className="mb-4 text-xl">{currentQuestion.question}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {currentQuestion.distractor &&
            currentQuestion.distractor.map((choice, index) => (
              <Button
                key={index}
                onClick={() =>
                  handleAnswer(
                    currentQuestion.quiz_question_id,
                    user?.id || "",
                    choice,
                    currentQuestion.points!,
                  )
                }
                className="w-full"
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

export default SGameLobby;
