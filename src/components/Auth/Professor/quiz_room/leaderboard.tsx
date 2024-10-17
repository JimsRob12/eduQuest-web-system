import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardEntry as LeaderboardType } from "@/lib/types";
import { UsersRound } from "lucide-react";

interface LeaderboardEntryProps {
  entry: LeaderboardType;
  index: number;
  prevRank: number;
}

const LeaderboardEntry = ({
  entry,
  index,
  prevRank,
}: LeaderboardEntryProps) => {
  const [prevScore, setPrevScore] = useState(entry.score);
  const [prevRight, setPrevRight] = useState(entry.right_answer);
  const [prevWrong, setPrevWrong] = useState(entry.wrong_answer);

  useEffect(() => {
    setPrevScore(entry.score);
    setPrevRight(entry.right_answer);
    setPrevWrong(entry.wrong_answer);
  }, [entry]);

  const total = entry.right_answer + entry.wrong_answer;
  const rightPercentage = total > 0 ? (entry.right_answer / total) * 100 : 0;
  const wrongPercentage = total > 0 ? (entry.wrong_answer / total) * 100 : 0;

  const scoreChanged = prevScore !== entry.score;
  const positionChanged = index !== prevRank;

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        y: 0,
        backgroundColor: positionChanged
          ? "rgba(147, 51, 234, 0.1)"
          : "#6b21a8",
        transition: { duration: 0.6, ease: "easeInOut" },
      }}
      className="mb-2 grid grid-cols-[0.1fr_1fr_0.5fr_1fr] gap-2 rounded p-2 text-left text-white"
    >
      <motion.p
        animate={{
          scale: positionChanged ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {index + 1}.
      </motion.p>
      <p>{entry.student_name}</p>
      <motion.p
        animate={{
          scale: scoreChanged ? [1, 1.2, 1] : 1,
          color: scoreChanged ? ["inherit", "#22c55e", "inherit"] : "inherit",
        }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {entry.score}
      </motion.p>
      <div className="flex items-center">
        <div className="flex h-4 w-full overflow-hidden rounded bg-gray-300">
          <motion.div
            className="bg-green-500"
            initial={{
              width: `${(prevRight / (prevRight + prevWrong)) * 100}%`,
            }}
            animate={{ width: `${rightPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="bg-red-500"
            initial={{
              width: `${(prevWrong / (prevRight + prevWrong)) * 100}%`,
            }}
            animate={{ width: `${wrongPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <motion.div
          className="ml-2 text-sm"
          animate={{
            scale:
              prevRight !== entry.right_answer ||
              prevWrong !== entry.wrong_answer
                ? [1, 1.2, 1]
                : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {entry.right_answer}/{entry.wrong_answer}
        </motion.div>
      </div>
    </motion.div>
  );
};

const Leaderboard = ({
  leaderboardData,
}: {
  leaderboardData: LeaderboardType[];
}) => {
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    setPrevRanks(
      leaderboardData.reduce((acc: Record<string, number>, entry, index) => {
        acc[entry.quiz_student_id] = index;
        return acc;
      }, {}),
    );
  }, [leaderboardData]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <h3 className="flex items-center gap-3 text-left">
          <UsersRound size={24} />
          {leaderboardData.length} Participant
          {leaderboardData.length > 1 && "s"}
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto rounded-sm bg-zinc-500 bg-opacity-20 px-4 py-3">
        <div className="mb-2 grid grid-cols-[0.1fr_1fr_0.5fr_1fr] gap-2">
          <h1>Rank</h1>
          <h1 className="text-left">Name</h1>
          <h1>Score</h1>
          <h1></h1>
        </div>
        <AnimatePresence>
          {leaderboardData.map((entry, index) => (
            <LeaderboardEntry
              key={entry.quiz_student_id}
              entry={entry}
              index={index}
              prevRank={prevRanks[entry.quiz_student_id]}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Leaderboard;
