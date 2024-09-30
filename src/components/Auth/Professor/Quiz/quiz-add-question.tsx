import { useParams, useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const { quizId, type } = useParams();
  const navigate = useNavigate();

  function handleSaveQuestion() {
    navigate(`/professor/quiz/${quizId}/customize`);
  }

  return (
    <div>
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
