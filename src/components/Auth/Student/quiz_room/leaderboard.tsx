import { useState, useEffect } from "react";
import { Check, Triangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./loader";
import { LeaderboardEntry } from "@/lib/types";
import CircleTimer from "@/components/Shared/circle-timer";
import { calculateRanks } from "@/lib/helpers";

type LeaderboardProps = {
  leaderboardData: LeaderboardEntry[];
  currentUserId: string;
};

type PodiumCardProps = {
  entry: LeaderboardEntry;
  rank: number;
  size: "sm" | "md" | "lg";
  isCurrentUser: boolean;
  showTie?: boolean;
  tiedWithNext?: boolean;
  tiedWithPrevious?: boolean;
};

const sizeClasses = {
  sm: "size-24",
  md: "size-28",
  lg: "size-36",
  "sm-tied": "size-28",
  "md-tied": "size-36",
  "lg-tied": "size-36",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  "sm-tied": "text-base",
  "md-tied": "text-xl",
  "lg-tied": "text-xl",
};

const PodiumCard = ({
  entry,
  rank,
  size,
  isCurrentUser,
  showTie,
  tiedWithNext,
  tiedWithPrevious,
}: PodiumCardProps) => {
  const effectiveSize: keyof typeof sizeClasses = showTie
    ? (`${size}-tied` as keyof typeof sizeClasses)
    : size;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex w-full flex-col items-center gap-2 rounded-lg p-4 ${tiedWithNext || tiedWithPrevious ? "bg-gray-50 dark:bg-gray-800" : ""}`}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs">
          {rank === 1 ? (
            <div className="flex items-center justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2545/2545603.png"
                alt="Winner"
                className="w-8"
              />
            </div>
          ) : (
            rank
          )}
        </div>
      </div>
      <Triangle
        className="fill-zinc-900 text-transparent dark:fill-zinc-200"
        size={12}
      />
      <img
        src={entry.student_avatar || "/api/placeholder/100/100"}
        className={`rounded-full object-cover ${sizeClasses[effectiveSize]}`}
        alt={isCurrentUser ? "You" : entry.student_name || "Anonymous"}
      />
      <div className="text-center">
        <p
          className={`font-bold ${textSizeClasses[effectiveSize]} ${
            isCurrentUser ? "text-green-400" : ""
          }`}
        >
          {isCurrentUser ? "You" : entry.student_name || "Anonymous"}
        </p>
        <p className="font-default text-xs">{entry.student_email}</p>
      </div>
      <ScoreDisplay entry={entry} />
    </motion.div>
  );
};

const ScoreDisplay = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className="flex w-full justify-between">
    <div className="text-center">
      <p className="text-xl font-bold">{entry.score}</p>
      <p className="text-sm">points</p>
    </div>
    <div className="text-center">
      <p className="text-xl font-bold">
        {entry.right_answer}/{entry.wrong_answer}
      </p>
      <div className="flex items-center text-sm">
        <Check size={14} className="text-green-600" />/<X size={12} />
      </div>
    </div>
  </div>
);

export default function Leaderboard({
  leaderboardData,
  currentUserId,
}: LeaderboardProps) {
  const [prevData, setPrevData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (JSON.stringify(prevData) !== JSON.stringify(leaderboardData)) {
      setTimeout(() => {
        setPrevData(leaderboardData);
      }, 600);
    }
  }, [leaderboardData, prevData]);

  const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
  const ranks = calculateRanks(sortedData);
  const topThree = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  // Determine if there are ties in the top 3
  const hasTies = topThree.some(
    (entry, index) => index > 0 && entry.score === topThree[index - 1].score,
  );

  if (sortedData.length === 0) {
    return (
      <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LoadingSpinner message="Fetching leaderboards.." />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100%-5rem)] flex-col items-center p-8">
      <CircleTimer initialTime={8} />

      <motion.h1
        className="mb-8 text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Leaderboard
      </motion.h1>

      <div className="w-full max-w-2xl">
        <div className="mb-8 grid grid-cols-3 items-end gap-1 md:gap-4">
          <AnimatePresence mode="popLayout">
            {[1, 0, 2].map((index) => (
              <motion.div
                key={topThree[index]?.id || `empty-${index}`}
                layout
                className={`flex justify-${index === 0 ? "center" : index === 1 ? "start" : "end"}`}
              >
                {topThree[index] && (
                  <PodiumCard
                    entry={topThree[index]}
                    rank={ranks.get(topThree[index].id) || index + 1}
                    size={index === 0 ? "lg" : index === 1 ? "md" : "sm"}
                    isCurrentUser={
                      topThree[index].quiz_student_id === currentUserId
                    }
                    showTie={
                      hasTies &&
                      index > 0 &&
                      topThree[index].score === topThree[index - 1].score
                    }
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {rest.length > 0 && (
          <>
            <div className="mb-4 grid grid-cols-[0.2fr_1fr_0.5fr_1fr] gap-4 font-semibold">
              <div>Rank</div>
              <div>Name</div>
              <div className="text-center">Score</div>
              <div className="text-center">Correct/Wrong</div>
            </div>

            <AnimatePresence mode="popLayout">
              {rest.map((entry, index) => {
                const actualRank = ranks.get(entry.id) || index + 4;
                const isCurrentUser = entry.quiz_student_id === currentUserId;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mb-2 grid grid-cols-[0.2fr_1fr_0.5fr_1fr] gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
                  >
                    <motion.div className="flex items-center gap-2">
                      {actualRank}
                      {/* {hasTieWithPrevious && (
                        <span className="text-xs text-gray-500">(Tied)</span>
                      )} */}
                    </motion.div>
                    <motion.div
                      className={isCurrentUser ? "text-green-400" : ""}
                    >
                      {isCurrentUser
                        ? "You"
                        : entry.student_name || "Anonymous"}
                    </motion.div>
                    <motion.div
                      className="text-center font-bold"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      {entry.score}
                    </motion.div>
                    <motion.div className="text-center">
                      {entry.right_answer}/{entry.wrong_answer}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
