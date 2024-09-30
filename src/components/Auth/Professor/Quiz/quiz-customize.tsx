import { useState } from "react";

interface Question {
  id: number;
  text: string;
}

export default function CustomizeQuiz() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "Sample Question 1" },
    { id: 2, text: "Sample Question 2" },
  ]);

  function handleEdit(id: number) {
    const questionToEdit = questions.find((q) => q.id === id);
    if (questionToEdit) {
      console.log(`Editing question with id: ${id}`);
    }
  }

  function handleDelete(id: number) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function handleAddMore() {
    // Logic to add a new question
  }

  return (
    <div>
      <h2>Customize Quiz</h2>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            {q.text}
            <button onClick={() => handleEdit(q.id)}>Edit</button>
            <button onClick={() => handleDelete(q.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={handleAddMore}>Add More Questions</button>
    </div>
  );
}
