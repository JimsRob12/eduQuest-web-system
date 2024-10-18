import React from "react";
import ClassAccuracy from "../../Professor/quiz_room/class-accuracy";
import { Computer, Medal, Stars, X } from "lucide-react";

interface SummaryProps {
  score: number;
  rightAns: number;
  wrongAns: number;
  totalParticipants: number;
  totalQuestions: number;
  accuracy: number;
  rank: number;
  questions: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }[];
  onFinish: () => void;
}

const Summary: React.FC<SummaryProps> = ({
  score,
  rightAns,
  wrongAns,
  totalParticipants,
  totalQuestions,
  accuracy,
  rank,
  questions,
  onFinish,
}) => {
  const getAnalysis = () => {
    const percentage = (score / totalQuestions) * 100;

    if (percentage >= 90) {
      return "Excellent job! You've mastered this topic. Keep up the great work!";
    } else if (percentage >= 80) {
      return "Great performance! You have a solid understanding of the subject. A little more practice and you'll be an expert!";
    } else if (percentage >= 70) {
      return "Good effort! You're on the right track. Focus on the areas you missed to improve your score.";
    } else if (percentage >= 60) {
      return "Not bad! You're making progress. Review the questions you got wrong and try again to boost your score.";
    } else {
      return "Keep practicing! Don't get discouraged. Review the material and try the quiz again. You'll improve with each attempt!";
    }
  };

  return (
    <div className="relative my-16 flex w-full items-center justify-center">
      <button
        className="absolute -top-16 left-0 rounded-md bg-slate-500 bg-opacity-10 p-1.5"
        onClick={onFinish}
      >
        <X />
      </button>
      <div className="flex w-full items-center justify-center sm:w-[70vw]">
        <div className="flex w-full flex-col items-center rounded-md bg-slate-500 bg-opacity-50 p-4 text-center sm:min-w-[70vw]">
          <h1 className="text-3xl font-bold md:text-4xl">Game Summary</h1>
          <p className="my-2 flex w-fit items-center gap-1 rounded bg-slate-400 bg-opacity-50 px-2 py-1 text-xs md:text-xs">
            <Computer size={16} /> Live Quiz
          </p>
          <p className="mt-6 text-base font-bold md:text-lg">{getAnalysis()}</p>

          <div className="mt-8 w-full space-y-8">
            <div className="w-full space-y-2">
              <div className="w-full rounded-xl bg-slate-700 px-4 py-2">
                <p className="mb-2 text-left text-sm text-white">Accuracy</p>
                <ClassAccuracy
                  accuracy={accuracy}
                  height={6}
                  bgColor="bg-white"
                  noHeader
                />
              </div>
              <div className="grid w-full grid-cols-2 gap-2 text-left">
                <div className="flex items-center justify-between rounded-xl bg-slate-700 px-4 py-2 text-white">
                  <div>
                    <p className="text-xs">Rank</p>
                    <p>
                      <span className="font-bold">{rank}</span>/
                      {totalParticipants}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-700 p-1">
                    <Medal className="text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-700 px-4 py-2 text-white">
                  <div>
                    <p className="text-xs">Score</p>
                    <p>{score}</p>
                  </div>
                  <div className="rounded-lg bg-green-700 p-1">
                    <Stars className="fill-white text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <h2 className="col-span-3 mb-2">Performance Stats</h2>
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-700 px-4 py-2 text-white">
                <div>
                  <p className="text-2xl font-bold">{rightAns}</p>
                  <p className="text-xs">Correct</p>
                </div>
                <div className="absolute -bottom-2 -left-2 flex size-16 -rotate-12 items-center justify-center rounded-full bg-green-500 p-3 opacity-40">
                  <span className="mb-3 text-[40px] font-black text-slate-700">
                    ✓
                  </span>
                </div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-700 px-4 py-2 text-white">
                <div>
                  <p className="text-2xl font-bold">{wrongAns}</p>
                  <p className="text-xs">Incorrect</p>
                </div>
                <div className="absolute -bottom-2 -left-2 flex size-16 -rotate-12 items-center justify-center rounded-full bg-red-500 p-3 opacity-40">
                  <span className="mb-3 text-[40px] font-black text-slate-700">
                    ×
                  </span>
                </div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-700 px-4 py-2 text-white">
                <div>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-xs">Total Questions</p>
                </div>
                <div className="absolute -bottom-2 -left-2 flex size-16 -rotate-12 items-center justify-center rounded-full bg-yellow-500 p-3 opacity-40">
                  <span className="mb-1 text-[40px] font-black text-slate-700">
                    ?
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-8 flex w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-700 p-6 text-left font-default text-white">
              <div className="mb-4 self-start">
                <h2 className="text-lg font-bold">Detailed Question Review</h2>
                <p className="text-sm">
                  Review the questions and your answers below to understand your
                  performance.
                </p>
              </div>
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="relative mb-4 w-full rounded-xl bg-zinc-100 p-4 text-black shadow"
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-2 rounded-l-xl ${
                      q.userAnswer === q.correctAnswer
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  ></div>
                  <div className="ml-4">
                    <div className="mb-2 font-semibold">Q: {q.question}</div>
                    <div className="text-sm">
                      Your answer:{" "}
                      <span
                        className={
                          q.userAnswer === q.correctAnswer
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {q.userAnswer}
                      </span>
                    </div>
                    {q.userAnswer !== q.correctAnswer && (
                      <div className="text-sm">
                        Correct answer:{" "}
                        <span className="text-green-600">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
