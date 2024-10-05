/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "../supabase";
import { v4 as uuidv4 } from "uuid";
import { qgen } from "./apiUrl";
import axios from "axios";
import { Quiz, QuizQuestions } from "@/lib/types";

export async function createQuiz(ownerId: string): Promise<Quiz | null> {
  const newQuizId = uuidv4();
  const { data, error } = await supabase
    .from("quiz")
    .insert({
      title: "Untitled Quiz",
      quiz_id: newQuizId,
      owner_id: ownerId,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz:", error);
    return null;
  }

  // console.log("Quiz created:", data);
  return data;
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from("quiz")
    .select()
    .eq("quiz_id", quizId)
    .single();

  if (error) {
    console.error("Error fetching quiz:", error);
    return null;
  }

  return data;
}

export async function updateQuizSettings(updateData: {
  title: string;
  quizId: string;
  description: string;
  subject: string;
  cover_image?: File;
}): Promise<any> {
  const { quizId, title, description, subject, cover_image } = updateData;
  let coverImageUrl = null;

  console.log(quizId, title, description, subject, cover_image);

  if (cover_image) {
    const fileExt = cover_image.name.split(".").pop();
    const fileName = `${quizId}_cover.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, cover_image);

    if (uploadError) {
      throw new Error(`Error uploading cover image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    coverImageUrl = urlData.publicUrl;
  }

  const updateObject: any = {};
  if (title !== undefined) updateObject.title = title;
  if (description !== undefined) updateObject.description = description;
  if (subject !== undefined) updateObject.subject = subject;
  if (coverImageUrl) updateObject.cover_image = coverImageUrl;

  const { data, error } = await supabase
    .from("quiz")
    .update(updateObject)
    .eq("quiz_id", quizId)
    .single();

  if (error) {
    throw new Error(`Error updating quiz: ${error.message}`);
  }

  return data;
}

export async function updateQuizTitle(quizId: string, title: string) {
  const { data, error } = await supabase
    .from("quiz")
    .update({ title })
    .eq("quiz_id", quizId)
    .single();

  if (error) {
    throw new Error(`Error updating quiz title: ${error.message}`);
  }

  return data;
}

export async function editQuiz(
  ownerId: string,
  quizId: string,
  quizData: Quiz,
): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from("quiz")
    .update({
      title: quizData.title,
      subject: quizData.subject,
      description: quizData.description,
      total_points: quizData.total_points,
      status: quizData.status,
    })
    .eq("ownerId", ownerId)
    .eq("quizId", quizId)
    .select();

  if (error) throw new Error(error.message);
  const quiz: Quiz | null = data && data.length > 0 ? (data[0] as Quiz) : null;
  return quiz ? quiz : null;
}

export async function getQuizzesByOwnerId(
  ownerId: string,
): Promise<Quiz[] | null> {
  const { data, error } = await supabase
    .from("quiz")
    .select(
      `
      *,
      quiz_questions (
        *
      )
    `,
    )
    .eq("owner_id", ownerId)
    .order("order", {
      referencedTable: "quiz_questions",
      ascending: false,
    });

  if (error) {
    console.error("Error fetching quizzes:", error);
    return null;
  }
  return data;
}

export async function deleteQuiz(
  ownerId: string,
  quizId: string,
): Promise<Quiz | boolean> {
  const response = await supabase
    .from("quiz")
    .delete()
    .eq("owner_id", ownerId)
    .eq("quiz_id", quizId);

  if (response.status !== 204) throw new Error("Quiz not deleted!");

  return true;
}

export async function generateQuestions(
  file: File,
  questionType: string,
  numQuestions: string,
): Promise<QuizQuestions | null> {
  try {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("question_type", questionType);
    formData.append("num_questions", numQuestions);

    const generateQuestions = await axios.post(qgen, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (generateQuestions.status === 200) {
      // const response_data = { sample response for T/F and Q&A
      //   "questions": [
      //     {
      //       "right_answer": "false",
      //       "id": 1,
      //       "question": "Is there a class for reading visual arts?",
      //       "question_type": "boolean",
      //       "distractor" : ["1", "2", "3"] // if multiple choices
      //     },
      //     {
      //       "right_answer": "false",
      //       "id": 2,
      //       "question": "Is there a class in reading visual arts?",
      //       "question_type": "boolean"
      //       "distractor" : ["1", "2", "3"]
      //     },
      //   ]
      // }

      return generateQuestions.data.questions;
    } else {
      throw new Error("Something went wrong! Please try again later.");
    }
  } catch {
    console.log("Error generating questions:", generateQuestions);
    throw new Error("Something went wrong! Please try again later.");
  }
}

export async function getQuestions(
  quizId: string,
): Promise<QuizQuestions[] | null> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select()
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);
  const questions: QuizQuestions[] | null = data || [];

  return questions && questions.length > 0 ? questions : null;
}

export async function getQuestion(
  questionId: string,
): Promise<QuizQuestions | null> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select()
    .eq("quiz_question_id", questionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateBulkPointsAndTime(
  quizId: string,
  bulkPoints: string,
  bulkTime: string,
): Promise<QuizQuestions[] | null> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .update({
      points: bulkPoints,
      time: bulkTime,
    })
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);
  const questions: QuizQuestions[] | null = data || [];

  return questions && questions.length > 0 ? questions : null;
}

export async function updateSingleQuestion(
  quizId: string,
  questionId: string,
  points?: string,
  time?: string,
): Promise<QuizQuestions | null> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .update({
      points: points ? parseInt(points) : undefined,
      time: time ? parseInt(time) : undefined,
    })
    .eq("quiz_id", quizId)
    .eq("quiz_question_id", questionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateQuestionOrder(
  quizId: string,
  newOrder: { id: string; order: number }[],
) {
  const updates = newOrder.map(({ id, order }) =>
    supabase
      .from("quiz_questions")
      .update({ order })
      .eq("quiz_question_id", id)
      .eq("quiz_id", quizId),
  );

  const results = await Promise.all(updates);

  const errors = results.filter((result) => result.error);

  if (errors.length > 0) {
    console.error("Errors updating question order:", errors);
    throw new Error("Failed to update one or more question orders");
  }

  return results.map((result) => result.data).flat();
}

export async function createQuestion(quizId: string, questionType: string) {
  // First, get the current maximum order for the quiz
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from("quiz_questions")
    .select("order")
    .eq("quiz_id", quizId)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  if (maxOrderError && maxOrderError.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned, which is fine if there are no questions yet
    throw maxOrderError;
  }

  const newOrder = (maxOrderData?.order || 0) + 1;

  // Now create the new question with the calculated order
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      question_type: questionType,
      question: "",
      right_answer: "",
      points: 1,
      time: 30,
      order: newOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuestion(params: QuizQuestions) {
  const { quiz_question_id, ...updateData } = params;

  const { data, error } = await supabase
    .from("quiz_questions")
    .update(updateData)
    .eq("quiz_question_id", quiz_question_id);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteQuestion(questionId: string) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .delete()
    .match({ quiz_question_id: questionId });

  if (error) throw error;
  return data;
}

export async function duplicateQuestion(questionId: string) {
  // First, fetch the question to duplicate
  const { data: originalQuestion, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_question_id", questionId)
    .single();

  if (fetchError) throw fetchError;

  // Remove the id from the original question to create a new entry
  const { quiz_question_id, ...newQuestion } = originalQuestion;

  // Insert the new question
  const { data: duplicatedQuestion, error: insertError } = await supabase
    .from("quiz_questions")
    .insert({ ...newQuestion, order: newQuestion.order + 1 })
    .select();

  if (insertError) throw insertError;

  // Update the order of subsequent questions using a raw SQL query
  const { error: updateError } = await supabase.rpc(
    "increment_question_order",
    {
      min_order: newQuestion.order + 1,
      excluded_id: duplicatedQuestion[0].quiz_question_id,
    },
  );

  if (updateError) throw updateError;

  return duplicatedQuestion[0];
}
