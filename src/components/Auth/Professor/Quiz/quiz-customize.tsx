import { getQuestions } from "@/services/api/apiQuiz";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  quiz_question_id: number;
  quiz_id: string;
  question: string;
  right_answer: string;
  image_url?: string;
  time: number;
  distractor?: string[];
}

export default function CustomizeQuiz() {
  const { quizId } = useParams();

  const {
    data: quizQuestions,
    isPending,
    isError,
  } = useQuery<Question[], Error>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const data = await getQuestions(quizId!);
      if (!data) {
        throw new Error("Quiz not found");
      }
      return data as unknown as Question[];
    },
    enabled: !!quizId,
  });

  function handleEdit(id: number) {
    const questionToEdit = quizQuestions?.find(
      (q) => q.quiz_question_id === id,
    );
    if (questionToEdit) {
      console.log(`Editing question with id: ${id}`);
    }
  }

  function handleDelete(id: number) {}

  function handleAddMore() {
    // Logic to add a new question
  }

  return (
    <div className="mt-8 grid grid-cols-[auto_1fr] gap-4">
      <div className="rounded-lg px-3 py-1">
        <h1>Bulk Update Questions</h1>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>North America</SelectLabel>
              <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
              <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
              <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
              <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
              <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
              <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Europe & Africa</SelectLabel>
              <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
              <SelectItem value="cet">Central European Time (CET)</SelectItem>
              <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
              <SelectItem value="west">
                Western European Summer Time (WEST)
              </SelectItem>
              <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
              <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Asia</SelectLabel>
              <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
              <SelectItem value="ist">India Standard Time (IST)</SelectItem>
              <SelectItem value="cst_china">
                China Standard Time (CST)
              </SelectItem>
              <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
              <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
              <SelectItem value="ist_indonesia">
                Indonesia Central Standard Time (WITA)
              </SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Australia & Pacific</SelectLabel>
              <SelectItem value="awst">
                Australian Western Standard Time (AWST)
              </SelectItem>
              <SelectItem value="acst">
                Australian Central Standard Time (ACST)
              </SelectItem>
              <SelectItem value="aest">
                Australian Eastern Standard Time (AEST)
              </SelectItem>
              <SelectItem value="nzst">
                New Zealand Standard Time (NZST)
              </SelectItem>
              <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>South America</SelectLabel>
              <SelectItem value="art">Argentina Time (ART)</SelectItem>
              <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
              <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
              <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <ul>
          {quizQuestions?.map((q) => (
            <li key={q.quiz_question_id}>
              {q.question}
              <button onClick={() => handleEdit(q.quiz_question_id)}>
                Edit
              </button>
              <button onClick={() => handleDelete(q.quiz_question_id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <button onClick={handleAddMore}>Add More Questions</button>
      </div>
    </div>
  );
}
