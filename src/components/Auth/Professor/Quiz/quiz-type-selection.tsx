import QuizTypeModal from "./quiz-type-modal";

export default function QuestionTypeSelection() {
  // const [hasQuestions, setHasQuestions] = useState(false);

  // // Simulate a check to determine if questions exist.
  // // Replace this with your actual data-fetching logic.
  // useEffect(() => {
  //   // Fetch or determine if there are questions
  //   const checkForQuestions = async () => {
  //     // Simulate API or state check (replace with real logic)
  //     const questionsExist = false; // Set this based on your data
  //     setHasQuestions(questionsExist);
  //   };

  //   checkForQuestions();
  // }, []);

  return (
    <div className="flex h-[calc(100%-5rem)] flex-col justify-center">
      {/* Render QuizTypeModal with the 'hasQuestions' prop */}
      <QuizTypeModal hasQuestions={false} />
    </div>
  );
}
