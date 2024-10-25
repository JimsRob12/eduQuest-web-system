import {
  BulletList,
  NumberedList,
  Section,
  SubjectSection,
} from "@/components/Shared/blog";

export default function Blog1() {
  return (
    <div className="font-default text-base text-zinc-950 dark:text-zinc-50 md:text-lg">
      <img
        src="/images/blog-1.1.jpg"
        alt="Futuristic classroom, little children study with high tech equipment. Smart spaces at school, AI in education, learning management system concept."
        className="h-1/2 w-full rounded-3xl object-cover"
      />

      <Section>
        <p>
          In today's educational landscape, technology is reshaping traditional
          teaching practices, making classrooms more interactive and accessible.
          One of the most exciting advancements is the integration of{" "}
          <span className="font-bold">Natural Language Processing (NLP)</span>{" "}
          for question generation, which empowers professors to create
          high-quality quizzes from existing materials like PDFs and text files.
          This shift streamlines quiz creation, enabling educators to focus more
          on instruction and engagement.
        </p>

        <h2 className="font-bold">Why NLP in Education?</h2>
        <BulletList
          items={[
            {
              title: "Defining NLP",
              content:
                "NLP, or Natural Language Processing, is a field of artificial intelligence focused on the interaction between computers and human language. By analyzing written content, NLP algorithms can generate relevant, accurate questions.",
            },
            {
              title: "Benefits in the Classroom",
              content:
                "NLP can save professors hours of quiz preparation by auto-generating questions, making assessments easier to create, varied, and aligned with specific learning objectives.",
            },
          ]}
        />
      </Section>

      <Section className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="my-4 font-bold">
            How Does AI-Powered Question Generation Work?
          </h2>
          <p>
            With this tool, professors can upload a PDF or text-based document,
            and the AI takes it from there, analyzing the content and converting
            it into question formats that meet specific academic needs. Here's a
            breakdown of how it works:
          </p>
          <NumberedList
            items={[
              {
                title: "Input Content",
                content:
                  "The professor uploads a PDF or text document, and the AI processes this data.",
              },
              {
                title: "Question Type Selection",
                content:
                  "Professors select from Multiple Choice, True/False, Identification/Enumeration, and other customizable formats.",
              },
              {
                title: "Question Quantity",
                content:
                  "Choose between 5 and 20 questions or input a custom number. If the content is limited, the system will notify if fewer questions can be generated.",
              },
              {
                title: "Customization",
                content:
                  "After generation, professors can modify, delete, or reorder questions to better suit their curriculum.",
              },
            ]}
          />
        </div>
        <div className="self-center">
          <video
            autoPlay
            muted
            loop
            className="rounded-3xl border-4 border-neutral-600"
          >
            <source src="/videos/snippet-1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </Section>

      <Section>
        <h2 className="font-bold">Customization Options</h2>
        <p>
          One size does not fit all, and our AI-powered system offers professors
          full control over each quiz:
        </p>
        <BulletList
          items={[
            {
              title: "Edit Question Details",
              content:
                "Change question type, point value, time limits, and the question order. Bulk update options for points and time simplify quiz adjustments.",
            },
            {
              title: "Multiple Choice Enhancements",
              content:
                "Add or modify distractors, correct answers, and even create new options for better comprehension checks.",
            },
            {
              title: "Quiz Settings",
              content:
                "Professors can customize quiz settings, such as name, image, description, and subject coverage. This makes quizzes feel personalized for each class or topic.",
            },
          ]}
        />
      </Section>

      <Section>
        <h2 className="font-sans text-2xl font-bold">
          Benefits of AI-Driven Question Generation Across Subjects
        </h2>
        <p>
          Here's how this tool can benefit specific subjects, making question
          generation easier and more aligned with curriculum goals:
        </p>
        <ul className="space-y-4">
          <SubjectSection
            title="Math & Science"
            items={[
              {
                title: "Multiple Choice Questions",
                content:
                  "Perfect for assessing knowledge of equations, scientific concepts, or problem-solving steps.",
              },
              {
                title: "True/False Statements",
                content:
                  "Useful for verifying student understanding of fundamental principles or specific scientific facts.",
              },
            ]}
          />
          <SubjectSection
            title="Literature & Language Arts"
            items={[
              {
                title: "Identification & Enumeration",
                content:
                  "Ideal for pinpointing authors, literary terms, or textual analysis.",
              },
              {
                title: "True/False or Multiple Choice",
                content:
                  "Great for testing knowledge of plot points, character traits, and themes.",
              },
            ]}
          />
          <SubjectSection
            title="History & Social Studies"
            items={[
              {
                title: "Multiple Choice and Enumeration",
                content:
                  "Assess knowledge of historical events, dates, and figures.",
              },
              {
                title: "True/False Statements",
                content:
                  "Verify understanding of facts and debunk common historical myths.",
              },
            ]}
          />
          <SubjectSection
            title="Computer Science & Technology"
            items={[
              {
                title: "Multiple Choice & True/False",
                content:
                  "Test fundamental concepts, programming logic, or IT theories.",
              },
              {
                title: "Identification",
                content:
                  "Excellent for code segments, syntax verification, or technology trends.",
              },
            ]}
          />
        </ul>
      </Section>

      <Section>
        <h2 className="font-sans text-2xl font-bold">
          Conclusion: Embracing the Future of Learning with AI
        </h2>
        <img
          src="/images/blog-1.2.jpg"
          alt="Business team brainstorm idea and lightbulb from jigsaw. Working team collaboration, enterprise cooperation, colleagues mutual assistance concept."
          className="h-1/2 w-full rounded-3xl object-cover"
        />
        <p>
          Our platform leverages NLP to provide a seamless, efficient way for
          professors to prepare quizzes, saving time while keeping assessments
          relevant and engaging. By embracing AI, we are not only modernizing
          education but creating a future where educators and students alike can
          benefit from technology-driven learning experiences.
        </p>
      </Section>
    </div>
  );
}
