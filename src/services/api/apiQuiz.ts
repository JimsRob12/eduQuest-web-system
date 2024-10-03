/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "../supabase";
import { v4 as uuidv4 } from "uuid";
import { qgen } from "./apiUrl";
import axios from "axios";

interface QuizData {
  quiz_id: string;
  owner_id: string;
  status: string;
  title: string;
  subject: string;
  description: string;
  total_points: string;
  question_type: string;
}

interface QuizQuestions {
  id: string;
  quiz_id: string;
  right_answer: string;
  question: string;
  distractor: string[];
  time: number;
  image_url: string;
}

export async function createQuiz(ownerId: string): Promise<QuizData | null> {
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

  console.log("Quiz created:", data);
  return data;
}

export async function getQuizById(quizId: string): Promise<QuizData | null> {
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
  quizData: QuizData,
): Promise<QuizData | null> {
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
  const quiz: QuizData | null =
    data && data.length > 0 ? (data[0] as QuizData) : null;
  return quiz ? quiz : null;
}

export async function getQuiz(ownerId: string): Promise<QuizData[] | null> {
  const { data, error } = await supabase
    .from("quiz")
    .select()
    .eq("ownerId", ownerId);

  if (error) throw new Error(error.message);
  const quiz: QuizData[] | null = data || [];
  return quiz && quiz.length > 0 ? quiz : null;
}

export async function deleteQuiz(
  ownerId: string,
  quizId: string,
): Promise<QuizData | boolean> {
  const response = await supabase
    .from("quiz")
    .delete()
    .eq("ownerId", ownerId)
    .eq("ownerId", quizId);

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

export async function createQuestions(
  quizId: string,
  quizQuestions: QuizQuestions[],
): Promise<QuizQuestions[] | null> {
  // const final_quiz_question_data = [
  //   {
  //     "right_answer": "false",
  //     "id": 1,
  //     "question": "Is there a class for reading visual arts?",
  //     "question_type": "boolean",
  //     "distractor" : [], // if T/F and Q&A empty else may choices
  //     "time" : 30, // in seconds
  //     "image_url" : File
  //   },
  //   {
  //     "answer": "false",
  //     "id": 2,
  //     "question": "Is there a class in reading visual arts?",
  //     "question_type": "boolean",
  //     "distractor" : [],
  //     "time" : 30,
  //     "image_url" : File
  //   }
  // ];
  // not tested
  const insertedQuestions: QuizQuestions[] = [];

  for (const quizQuestion of quizQuestions) {
    let filename = "";

    if (quizQuestion.image_url) {
      filename = `avatar-${quizId}-${quizQuestion.id}-${Math.random()}`;

      const { error: storageError } = await supabase.storage
        .from("images")
        .upload(filename, quizQuestion.image_url, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw new Error(storageError.message);
    }

    // Insert the question into the database
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        right_answer: quizQuestion.right_answer,
        question: quizQuestion.question,
        distractor: quizQuestion.distractor || [],
        time: quizQuestion.time || 30, // Default to 30 if time is not provided
        image_url: filename,
      })
      .single();

    if (error) throw new Error(error.message);

    if (data) insertedQuestions.push(data);
  }

  return insertedQuestions.length > 0 ? insertedQuestions : null;
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
