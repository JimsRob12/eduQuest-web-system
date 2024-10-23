import { QuizQuestions } from "@/lib/types";
import supabase from "../supabase";
import { checkAnswer } from "./apiRoom";

export async function getQuestionsForScheduledQuiz(
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

// Modified function for handling scheduled quiz start
export async function startScheduledQuiz(classCode: string): Promise<void> {
  try {
    await supabase
      .from("quiz")
      .update({ status: "scheduled-in-game" })
      .eq("class_code", classCode);

    // Notify all enrolled students
    const channel = supabase.channel("scheduled_quiz");
    channel.send({
      type: "broadcast",
      event: "scheduled-quiz-started",
      payload: { classCode },
    });
    channel.unsubscribe();
  } catch (error) {
    console.error("Error starting scheduled quiz:", error);
    throw error;
  }
}

// Modified answer submission to handle batch processing
export async function submitQuizAnswer(
  questionId: string,
  studentId: string,
  answer: string,
  timeSpent: number,
): Promise<void> {
  try {
    const isCorrect = await checkAnswer(questionId, answer);

    await supabase.from("quiz_answers").insert([
      {
        quiz_question_id: questionId,
        student_id: studentId,
        answer: answer,
        is_correct: isCorrect,
        time_spent: timeSpent,
      },
    ]);
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}

// Modified function to end quiz and show final leaderboard
export async function endScheduledQuiz(classCode: string): Promise<void> {
  try {
    // Update quiz status
    await supabase
      .from("quiz")
      .update({ status: "completed" })
      .eq("class_code", classCode);

    // Calculate final scores and update leaderboard
    // const { data: answers } = await supabase
    //   .from("quiz_answers")
    //   .select("*")
    //   .eq("class_code", classCode);

    // Notify all participants of quiz completion
    const channel = supabase.channel("scheduled_quiz");
    channel.send({
      type: "broadcast",
      event: "scheduled-quiz-completed",
      payload: { classCode },
    });
    channel.unsubscribe();
  } catch (error) {
    console.error("Error ending scheduled quiz:", error);
    throw error;
  }
}
