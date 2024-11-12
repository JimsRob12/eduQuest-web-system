import { QuizQuestions, User } from "@/lib/types";
import supabase from "../supabase";

interface QuizStatusResponse {
  hasTaken: boolean;
  canRetake: boolean;
}
interface QuizStudentData {
  quiz_student_id: string;
  class_code: string;
  quiz_id: string;
  quiz_taken: boolean;
}

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

export async function updateQuizTaken({
  classCode,
  userId,
}: {
  classCode: string;
  userId: string;
}) {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from("quiz")
      .select("quiz_id")
      .eq("class_code", classCode)
      .single();

    if (quizError || !quizData) {
      throw new Error(quizError?.message || "Quiz not found");
    }

    const { data, error } = await supabase
      .from("quiz_students")
      .update({ quiz_taken: true })
      .eq("class_code", classCode)
      .eq("quiz_student_id", userId)
      .select();

    if (error) {
      throw new Error(`Error updating quiz_taken status: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error updating quiz_taken status:", error);
    throw error;
  }
}

export async function getQuizById(classCode: string) {
  const { data: quizData, error: quizError } = await supabase
    .from("quiz")
    .select("quiz_id, retake")
    .eq("class_code", classCode)
    .single();

  if (quizError) {
    throw new Error("Quiz not found");
  }

  return quizData;
}

export async function getQuizStudent(
  classCode: string,
  studentId: string,
): Promise<QuizStudentData | null> {
  const { data, error } = await supabase
    .from("quiz_students")
    .select("*")
    .eq("class_code", classCode)
    .eq("quiz_student_id", studentId)
    .single();

  if (error) {
    console.error("Error fetching quiz student data:", error);
    return null;
  }

  return data;
}

export async function insertQuizStudent(
  user: User,
  classCode: string,
  name?: string,
) {
  const { data, error } = await supabase
    .from("quiz_students")
    .insert([
      {
        quiz_student_id: user.id,
        class_code: classCode,
        student_name: name || user.name,
        student_email: user.email,
        student_avatar: user.avatar,
        quiz_taken: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function checkQuizStatus(
  classCode: string,
  user: User,
  name?: string,
): Promise<QuizStatusResponse> {
  // Get quiz data
  const quizData = await getQuizById(classCode);
  if (!quizData) {
    throw new Error("Quiz not found");
  }

  // Check if student exists in quiz_students
  let quizStudent = await getQuizStudent(classCode, user.id);

  // If student doesn't exist, insert them
  if (!quizStudent) {
    quizStudent = await insertQuizStudent(user, classCode, name);
  }

  return {
    hasTaken: quizStudent?.quiz_taken || false,
    canRetake: quizData.retake || false,
  };
}
