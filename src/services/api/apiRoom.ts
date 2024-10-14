/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  QuizQuestions,
  Student,
  TempQuizQuestionPayload,
  User,
} from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import supabase from "../supabase";

// Function to start the game and notify all subscribers
export async function startGame(classCode: string): Promise<void> {
  try {
    await supabase
      .from("quiz")
      .update({ status: "in game" })
      .eq("class_code", classCode)
      .select();

    const channel = supabase.channel("room1");
    channel.send({
      type: "broadcast",
      event: "quiz-game-started",
      payload: { classCode },
    });
    channel.unsubscribe();
    console.log(`Game started for quiz ID: ${classCode}`);
  } catch (error) {
    console.error("Error updating quiz status:", error);
  }
}

export async function reconnectGame(classCode: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("quiz")
      .select("status")
      .eq("class_code", classCode)
      .single();
    return data?.status === "in game";
  } catch (error) {
    console.error("Error checking quiz status:", error);
    return false;
  }
}

export async function endGame(classCode: string): Promise<boolean> {
  try {
    await supabase
      .from("quiz")
      .update({ status: "active" })
      .eq("class_code", classCode)
      .select();
    return true;
  } catch (error) {
    console.error("Error updating quiz status:", error);
    return false;
  }
}

export async function getParticipants(
  classCode: string,
  setStudents: Dispatch<SetStateAction<Student[]>>,
): Promise<void> {
  try {
    const { data: initialParticipants } = await supabase
      .from("temp_room")
      .select("*")
      .eq("class_code", classCode);

    if (initialParticipants) {
      const formattedParticipants: Student[] = initialParticipants.map(
        (student) => ({
          placement: 0,
          quiz_student_id: student.quiz_student_id,
          right_answer: 0,
          score: 0,
          student_name: student.student_name,
          student_avatar: student.student_avatar,
          student_email: student.student_email,
          wrong_answer: 0,
        }),
      );

      setStudents(formattedParticipants);

      // Set up real-time subscription for participant changes
      supabase
        .channel("db-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "temp_room" },
          (payload) => {
            if (classCode === payload.new.class_code) {
              const newStudent: Student = {
                placement: 0,
                quiz_student_id: payload.new.quiz_student_id,
                right_answer: 0,
                score: 0,
                student_name: payload.new.student_name,
                student_avatar: payload.new.student_avatar,
                student_email: payload.new.student_email,
                wrong_answer: 0,
              };
              setStudents((prevStudents) => [...prevStudents, newStudent]);
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "temp_room" },
          (payload) => {
            setStudents((prevStudents) =>
              prevStudents.filter(
                (student) =>
                  student.quiz_student_id !== payload.old.quiz_student_id,
              ),
            );
          },
        )
        .subscribe();
    }
  } catch (error) {
    console.error("Error fetching participants:", error);
  }
}

export async function joinRoom(
  classCode: string,
  studentId: string,
  user: User,
  username?: string,
): Promise<boolean> {
  try {
    const { data: existingRecord } = await supabase
      .from("temp_room")
      .select("*")
      .match({
        quiz_student_id: studentId,
        class_code: classCode,
      })
      .single();

    if (existingRecord) {
      console.log("Record already exists:", existingRecord);
      return true;
    }

    const studentName = user.name || username;

    await supabase
      .from("temp_room")
      .insert({
        quiz_student_id: studentId,
        class_code: classCode,
        student_name: studentName,
        student_avatar: user.avatar,
        student_email: user.email,
      })
      .select()
      .single();

    return true;
  } catch (error) {
    console.error("Error joining room:", error);
    return false;
  }
}

export async function leaveRoom(
  classCode: string,
  studentId: string,
): Promise<boolean> {
  try {
    await supabase.from("temp_room").delete().match({
      quiz_student_id: studentId,
      class_code: classCode,
    });
    return true;
  } catch (error) {
    console.error("Error leaving the room:", error);
    return false;
  }
}

// Game event handling functions
export function gameEventHandler(
  classCode: string,
  setGameStart: Dispatch<SetStateAction<boolean>>,
): () => void {
  const channel = supabase
    .channel(`room1`)
    .on("broadcast", { event: "quiz-game-started" }, () => {
      setGameStart(true);
    })
    .subscribe();

  return () => channel.unsubscribe();
}

export async function getQuestionsProf(
  classCode: string,
): Promise<QuizQuestions[]> {
  try {
    const { data: quizData } = await supabase
      .from("quiz")
      .select("quiz_id")
      .eq("class_code", classCode)
      .single();

    if (!quizData) {
      throw new Error("Quiz not found");
    }

    const { data: questionsData } = await supabase
      .from("quiz_questions")
      .select(
        "quiz_question_id, right_answer, question, distractor, time, image_url, points, question_type, order",
      )
      .eq("quiz_id", quizData.quiz_id)
      .order("order", { ascending: true });

    if (questionsData && questionsData.length > 0) {
      await sendNextQuestion(
        { ...questionsData[0], quiz_id: quizData.quiz_id },
        classCode,
      );
    }

    return (
      questionsData?.map((question) => ({
        ...question,
        quiz_id: quizData.quiz_id,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
}

export async function sendNextQuestion(
  question: QuizQuestions,
  classCode: string,
): Promise<boolean> {
  try {
    const startTime = new Date().toISOString();
    const endTime = new Date(
      new Date().getTime() + question.time * 1000,
    ).toISOString();

    const { data: existingQuestion } = await supabase
      .from("temp_room_questions")
      .select("id")
      .eq("class_code", classCode)
      .single();

    if (existingQuestion) {
      await supabase
        .from("temp_room_questions")
        .update({
          ...question,
          start_time: startTime,
          end_time: endTime,
        })
        .eq("id", existingQuestion.id);
    } else {
      await supabase.from("temp_room_questions").insert([
        {
          ...question,
          class_code: classCode,
          start_time: startTime,
          end_time: endTime,
        },
      ]);
    }

    return true;
  } catch (error) {
    console.error("Error sending next question:", error);
    return false;
  }
}

// Timer functions
export function sendTimer(classCode: string, time: number): void {
  const channel = supabase.channel("room1");
  const startTime = new Date().toISOString();
  const endTime = new Date(new Date().getTime() + time * 1000).toISOString();

  channel.send({
    type: "broadcast",
    event: "timer",
    payload: {
      classCode,
      startTime,
      endTime,
    },
  });
  channel.unsubscribe();
}

export function getTimer(
  setTimeLeft: Dispatch<SetStateAction<number>>,
): () => void {
  const channel = supabase
    .channel("room1")
    .on("broadcast", { event: "timer" }, (payload) => {
      const { startTime, endTime } = payload.payload;
      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(endTime);
      const currentTime = new Date();

      const totalDuration = Math.floor(
        (endTimeDate.getTime() - startTimeDate.getTime()) / 1000,
      );
      const elapsedTime = Math.floor(
        (currentTime.getTime() - startTimeDate.getTime()) / 1000,
      );
      const remainingTime = Math.max(totalDuration - elapsedTime, 0);

      setTimeLeft(() => remainingTime);
    })
    .subscribe();

  return () => channel.unsubscribe();
}

export async function sendEndGame(classCode: string) {
  const channel = supabase.channel("room1");

  channel.send({
    type: "broadcast",
    event: "quiz-game-ended",
    payload: { classCode },
  });
  channel.unsubscribe();

  endGame(classCode);
}

export async function getEndGame(
  setGameStart: Dispatch<SetStateAction<boolean>>,
) {
  const channel = supabase
    .channel(`room1`)
    .on("broadcast", { event: "quiz-game-ended" }, (payload) => {
      console.log("Game started event received:", payload);
      setGameStart(false);
    })
    .subscribe();

  return () => channel.unsubscribe();
}

export function sendExitLeaderboard(classCode: string): () => void {
  const channel = supabase.channel("room1");

  channel.send({
    type: "broadcast",
    event: "quiz-next-question",
    payload: { classCode },
  });

  console.log("Exit leaderboard signal sent");
  return () => channel.unsubscribe();
}

export function getExitLeaderboard(
  setLeaderBoard: Dispatch<SetStateAction<boolean>>,
): () => void {
  const channel = supabase
    .channel(`room1`)
    .on("broadcast", { event: "quiz-next-question" }, (payload) => {
      console.log("Next question event received:", payload);
      setLeaderBoard(false);
    })
    .subscribe();

  return () => channel.unsubscribe();
}

// Time calculation function
function getRemainingTime(start: string, end: string): number {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const timeDifferenceInMillis = endTime.getTime() - startTime.getTime();
  return Math.floor(timeDifferenceInMillis / 1000);
}

// Student question retrieval function
export function getQuizQuestionsStud(
  classCode: string,
  setTimeLeft: Dispatch<SetStateAction<number>>,
): Promise<TempQuizQuestionPayload> {
  return new Promise((resolve, reject) => {
    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "temp_room_questions",
        },
        (payload: { new: Partial<TempQuizQuestionPayload> }) => {
          try {
            // Ensure the necessary fields are present
            if (classCode === payload.new.class_code) {
              const newQuestion: TempQuizQuestionPayload = {
                quiz_question_id: payload.new.quiz_question_id!,
                class_code: classCode,
                question: payload.new.question!,
                distractor: payload.new.distractor!,
                time: payload.new.time!,
                image_url: payload.new.image_url!,
                points: payload.new.points!,
                question_type: payload.new.question_type!,
                order: payload.new.order!,
                start_time: payload.new.start_time!,
                end_time: payload.new.end_time!,
              };

              console.log("Question received: ", newQuestion);
              setTimeLeft(
                getRemainingTime(newQuestion.start_time, newQuestion.end_time),
              );
              resolve(newQuestion);
            }
          } catch (error) {
            console.error("Error processing payload:", error);
            reject(error);
          }
        },
      )
      .subscribe();
  });
}

// Answer checking function
async function checkAnswer(
  questionId: string,
  answer: string,
): Promise<boolean> {
  try {
    const { count } = await supabase
      .from("quiz_questions")
      .select("quiz_question_id", { count: "exact" })
      .eq("quiz_question_id", questionId)
      .eq("right_answer", answer)
      .single();

    return count ? count > 0 : false;
  } catch (error) {
    console.error("Error checking answer:", error);
    return false;
  }
}

// Leaderboard update function
export async function updateLeaderBoard(
  classCode: string,
  studentId: string,
  studentName: string,
  score: number,
  rightAns: number,
  wrongAns: number,
): Promise<any[] | undefined> {
  try {
    const { data: existingStudent } = await supabase
      .from("quiz_students")
      .select("quiz_student_id, score")
      .match({
        quiz_student_id: studentId,
        class_code: classCode,
      })
      .single();

    if (!existingStudent) {
      await supabase.from("quiz_students").insert([
        {
          quiz_student_id: studentId,
          student_name: studentName,
          score: score,
          class_code: classCode,
        },
      ]);
      console.log("New student added:", studentId);
    } else {
      await supabase
        .from("quiz_students")
        .update({
          score: score,
          right_answer: rightAns,
          wrong_answer: wrongAns,
        })
        .match({
          quiz_student_id: studentId,
          class_code: classCode,
        });
      console.log("Student score updated:", studentId);
    }

    const { data: allStudents } = await supabase
      .from("quiz_students")
      .select(
        "quiz_student_id, score, id, right_answer, wrong_answer, student_name",
      )
      .eq("class_code", classCode)
      .order("score", { ascending: false });

    if (allStudents) {
      const updates = allStudents.map((student, index) => ({
        id: student.id,
        quiz_student_id: student.quiz_student_id,
        placement: index + 1,
      }));

      await supabase.from("quiz_students").upsert(updates);
      console.log("Leaderboard updated successfully.");
      return allStudents;
    }
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
}

// Answer submission function
export async function submitAnswer(
  questionId: string,
  studentId: string,
  answer: string,
): Promise<boolean> {
  const isCorrect = await checkAnswer(questionId, answer);
  console.log("Answer is correct:", isCorrect);
  return isCorrect;
}
