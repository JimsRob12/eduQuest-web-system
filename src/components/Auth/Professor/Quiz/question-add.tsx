import { useParams, useNavigate } from "react-router-dom";
import { generateQuestions } from "@/services/api/apiQuiz";

export default function AddQuestion() {
  const { quizId, type } = useParams();
  const navigate = useNavigate();

  function handleSaveQuestion() {
    navigate(`/professor/quiz/${quizId}/customize`);
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();  // Prevent default form submission behavior
    
    const formData = new FormData(event.currentTarget); 
    
    const pdfFile = formData.get('pdf') as File | null;
    const questionType = formData.get('question_type') as string | "";
    const numQuestions = formData.get('num_questions') as string | "";
  
    if (!pdfFile || !(pdfFile instanceof File)) {
      console.error('No file selected or invalid file');
      return
    }
        
    generateQuestions(pdfFile, questionType, numQuestions)
    // Now you can send this data to your backend or process it further
  };


  return (
    <div>
      <div>
        <h1>generate your quiz</h1>
        <form action="" onSubmit={onSubmit}>
          <input type="file" name="pdf" id="pdf" />
          
          <select name="question_type" id="question_type">
            <option value="mcq">Multiple Choice Question</option>
            <option value="boolean">True or False</option>
            <option value="short">Question and Answer</option>
          </select>

          <input type="text" name="num_questions" id="num_questions" placeholder="Number of questions" />

          <button type="submit">Let's generate</button>
        </form>
      </div>

      <h2>Add a {type} Question</h2>
      <form>
        <input type="text" placeholder="Question text" />
        <button type="submit" onClick={handleSaveQuestion}>
          Save
        </button>
      </form>
    </div>
  );
}
