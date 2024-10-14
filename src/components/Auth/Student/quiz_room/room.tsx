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
  getParticipants,
  leaveRoom,
  gameEventHandler,
  getQuizQuestionsStud,
  updateLeaderBoard,
  getEndGame,
  getExitLeaderboard,
  submitAnswer,
  joinRoom,
} from "@/services/api/apiRoom";
import { QuizQuestions as Question } from "@/lib/types";

interface Student {
  student_name: string;
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const SGameLobby: React.FC = () => {
  const { user } = useAuth();
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [gameStart, setGameStart] = useState(false);
  const [joined, setJoined] = useState(false);
  const [score, setScore] = useState(0);
  const [rightAns, setRightAns] = useState(0);
  const [wrongAns, setWrongAns] = useState(0);
  const [questions, setQuestions] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [leaderBoard, setLeaderBoard] = useState(false);
  const [displayNameRequired, setDisplayNameRequired] = useState(false);

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
        const name = user.name || "";
        if (!name) {
          setDisplayNameRequired(true);
        } else {
          const success = await joinRoom(classId, studentId, user);
          if (success) {
            setJoined(true);
          } else {
            console.error("Failed to auto-join the room");
          }
        }
      }
    };

    autoJoin();
  }, [classId, user, joined]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (classId && joined) {
        await getParticipants(classId, setStudents);
      }
    };

    const checkGameStatus = async () => {
      if (classId && joined) {
        await gameEventHandler(classId, setGameStart);
      }
    };

    if (joined) {
      fetchParticipants();
      checkGameStatus();
    }
  }, [classId, joined]);

  useEffect(() => {
    const getQuestion = async () => {
      if (gameStart && classId) {
        const question = (await getQuizQuestionsStud(
          classId,
          setTimeLeft,
        )) as unknown as Question;
        setQuestions(question);
      }
    };
    getQuestion();
  }, [gameStart, classId]);

  useEffect(() => {
    if (gameStart && timeLeft >= 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      if (timeLeft <= 0) {
        setLeaderBoard(true);

        setTimeout(() => {
          getExitLeaderboard(setLeaderBoard);
          handleNextQuestion();
        }, 10000);
      }
      return () => clearInterval(interval);
    }
  }, [timeLeft, gameStart]);

  const handleNextQuestion = async () => {
    if (classId) {
      await getEndGame(setGameStart);
      setCurrentQuestionIndex((prev) => prev + 1);
      const question = (await getQuizQuestionsStud(
        classId,
        setTimeLeft,
      )) as unknown as Question;
      setQuestions(question);
    }
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
  };

  useEffect(() => {
    const updateLeaderBoardData = async () => {
      if (
        rightAns !== 0 &&
        wrongAns !== 0 &&
        score !== 0 &&
        classId &&
        user?.id
      ) {
        await updateLeaderBoard(
          classId,
          user.id,
          user.name || "",
          score,
          rightAns,
          wrongAns,
        );
      }
    };
    updateLeaderBoardData();
  }, [rightAns, wrongAns, score, classId, user]);

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
      } else {
        console.error("Failed to join the room");
      }
    }
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

  if (!joined) {
    return (
      <div className="flex h-[calc(100%-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Joining the game...</span>
      </div>
    );
  }

  if (leaderBoard) {
    return (
      <div className="flex h-[calc(100%-5rem)] items-center justify-center">
        <h1 className="text-3xl font-bold">LeaderBoard</h1>
      </div>
    );
  }

  if (!gameStart) {
    return (
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">Game Lobby</h1>
          <Button onClick={leaveHandler} variant="destructive">
            Leave Game
          </Button>
        </div>
        <div className="w-full max-w-md space-y-4">
          {students.length > 0 ? (
            students.map((student, index) => (
              <div key={index} className="rounded-lg p-4 shadow">
                {student.student_name}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              No students currently joined.
            </div>
          )}
        </div>
      </div>
    );
  }

  return questions ? (
    <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-3xl font-bold">
        Question {currentQuestionIndex + 1}
      </h1>
      <div className="mb-8 w-full max-w-2xl">
        <h2 className="mb-4 text-xl">{questions.question}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {questions.distractor &&
            questions.distractor.map((choice, index) => (
              <Button
                key={index}
                onClick={() =>
                  handleAnswer(
                    questions.quiz_question_id,
                    user?.id || "",
                    choice,
                    questions.points!,
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
