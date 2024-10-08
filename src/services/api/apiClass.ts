import supabase from "../supabase";

export async function getClassById(classId: string) {
  const { data: quizzes, error } = await supabase
    .from("quiz")
    .select(
      `
        *,
        quiz_questions(*)
        `,
    )
    .eq("class_code", classId);

  if (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error(
      "We encountered an issue while fetching the class data. Please try again later.",
    );
  }

  if (!quizzes || quizzes.length === 0) {
    throw new Error(
      "There are no quizzes available for this class at the moment.",
    );
  }

  return quizzes;
}
