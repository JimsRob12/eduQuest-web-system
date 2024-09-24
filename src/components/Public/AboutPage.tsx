import { StickyScroll } from "../Shared/sticky-scroll";

export default function AboutPage() {
  const content = [
    {
      title: "Transforming Learning with Quiz Bee with You",
      description: `Quiz Bee with You is an innovative web-based quiz maker designed to revolutionize the learning experience by leveraging Natural Language Processing (NLP) and Question-Answering Model algorithms.`,
      content: <div>Interactive Content for Section 1</div>,
    },
    {
      title: "Powered by Cutting-Edge NLP Technology",
      description: `By integrating cutting-edge NLP technology, Quiz Bee with You can analyze course content, extract key concepts, and generate relevant, high-quality quiz questions tailored to the lesson.`,
      content: <div>Interactive Content for Section 2</div>,
    },
    {
      title: "A Smarter Way to Create Quizzes",
      description: `Whether you are a teacher, student, or educational institution, Quiz Bee with You is here to make quiz-making smarter, faster, and more effective.`,
      content: <div>Interactive Content for Section 3</div>,
    },
  ];

  return (
    <>
      <StickyScroll content={content} />
    </>
  );
}
