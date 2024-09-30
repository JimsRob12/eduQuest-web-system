import supabase from "../supabase";
import { v4 as uuidv4 } from "uuid";

interface QuizData {
  id: string;
  owner_id: string;
  status: string;
}

export async function createQuiz(ownerId: string): Promise<QuizData | null> {
  const newQuizId = uuidv4();

  const { data, error } = await supabase
    .from("quiz")
    .insert({
      quiz_id: newQuizId,
      owner_id: ownerId,
      status: "draft",
    })
    .single();

  if (error) {
    console.error("Error creating quiz:", error);
    return null;
  }

  return data;
}
