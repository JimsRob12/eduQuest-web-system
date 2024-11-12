import { BulletList, NumberedList, Section } from "@/components/Shared/blog";

export default function Blog3() {
  return (
    <div className="font-default text-base text-zinc-950 dark:text-zinc-50 md:text-lg">
      <Section className="grid items-end gap-4 md:grid-cols-[0.8fr_1fr]">
        <img
          src="/images/blog-3.1.png"
          alt=" Benefits of Customization Infographic - A graphic showing benefits like `Improved Relevance,` `Aligned with Learning Goals,` and `Enhanced Student Engagement.`"
          className="w-full rounded-3xl object-cover"
        />
        <div className="space-y-4">
          <p>
            Every class has unique needs, and a one-size-fits-all quiz may not
            be the best approach. Our platform allows professors to create
            custom quizzes that align perfectly with their curriculum. With
            options to edit points, question type, order, and more, professors
            can create assessments that reflect their teaching goals and enhance
            student learning.
          </p>
          <p>
            Customization makes assessments more meaningful for students,
            allowing professors to design quizzes that reinforce key topics and
            challenge students appropriately. Tailoring quizzes to specific
            curriculum objectives also helps maintain student engagement and
            supports differentiated learning.
          </p>
        </div>
      </Section>
      <Section>
        <h2 className="font-bold">
          Customizing Quiz Content: Question Types, Points, and Timing
        </h2>
        <p>
          Our platform provides a range of tools that give professors the
          flexibility to modify every aspect of the quiz, ensuring that it meets
          their standards. Here’s what you can customize:
        </p>
        <NumberedList
          items={[
            {
              image: "/images/blog-3.3.png",
              title: "Question Types",
              content:
                "Choose from Multiple Choice, True/False, Identification/Enumeration, or create a blend of these to match the topic’s needs.",
            },
            {
              image: "/images/blog-3.2.png",
              title: "Points",
              content:
                "Set points for each question based on difficulty or importance, ensuring that assessments reflect students’ grasp of essential concepts.",
            },
            {
              image: "/images/blog-3.4.png",
              title: "Time Limits",
              content:
                "Specify time limits for each question or the entire quiz, helping students manage their time effectively.",
            },
          ]}
        />
      </Section>
      <Section className="grid grid-cols-[0.4fr_1fr] items-end gap-4">
        <img
          src="/images/blog-3.5.png"
          alt="Bulk Edits for Efficiency"
          className="w-full rounded-3xl object-cover"
        />
        <div className="space-y-4">
          <h2 className="font-bold">Bulk Edits for Efficiency</h2>
          <p>
            To make quiz creation even easier, professors can use the bulk
            update feature to adjust points and time limits across multiple
            questions simultaneously. This saves time, especially for lengthy
            quizzes, and ensures consistency throughout the quiz.
          </p>
        </div>
      </Section>
      <Section>
        <h2 className="font-bold">
          Crafting Distractors: Customizable Multiple-Choice Options
        </h2>
        <p>
          For multiple-choice questions, the platform provides options to
          customize distractors (incorrect options) for a more challenging
          assessment:
        </p>
        <video
          autoPlay
          muted
          loop
          className="rounded-3xl border-4 border-neutral-600"
        >
          <source src="/videos/blog-3.6.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <BulletList
          items={[
            {
              title: "Add New Distractors",
              content:
                "Create additional distractors that test students’ understanding and ensure they’re selecting answers for the right reasons.",
            },
            {
              title: "Edit Correct Answers",
              content:
                "Modify the correct answer if needed, ensuring each question aligns with the latest curriculum changes.",
            },
            {
              title: "Shuffle Options",
              content:
                "Randomize the order of answer choices to prevent predictable patterns and encourage students to consider each option carefully.",
            },
          ]}
        />
      </Section>
      <Section className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="font-bold">
            Settings for an Enhanced Quiz Experience
          </h2>
          <p>
            In addition to question-specific customizations, professors can
            configure settings for the entire quiz, creating an experience that
            aligns with the course’s goals and requirements:
          </p>
          <BulletList
            items={[
              {
                title: "Quiz Name and Description",
                content:
                  "Add a unique title, subject, and description to contextualize the quiz for students.",
              },
              {
                title: "Quiz Image",
                content:
                  "Upload a cover image that represents the quiz topic, making it visually engaging.",
              },
              {
                title: "Scheduling Options",
                content:
                  "Choose between live or scheduled quizzes based on the classroom setup. Scheduled quizzes can be configured with open and close times, enabling a flexible testing window.",
              },
            ]}
          />
        </div>
        <img
          src="/images/blog-3.6.png"
          alt="Quiz Settings Interface - A screenshot showing fields for quiz name, description, image upload, and scheduling options."
          className="w-full rounded-3xl object-cover"
        />
      </Section>
      <Section className="grid grid-cols-2 gap-4">
        <img
          src="/images/blog-3.7.png"
          alt="Quiz Settings Interface - A screenshot showing fields for quiz name, description, image upload, and scheduling options."
          className="w-full rounded-3xl object-cover"
        />
        <div className="space-y-4">
          <h2 className="font-bold">Advanced Settings for Scheduled Quizzes</h2>
          <p>
            For scheduled quizzes, additional features enhance the experience,
            allowing professors to manage the quiz environment thoroughly:
          </p>
          <BulletList
            items={[
              {
                title: "Shuffling Questions and Options",
                content:
                  "Randomize questions and answer options to maintain quiz integrity.",
              },
              {
                title: "Enable/Disable Timing and Retakes",
                content:
                  "Control timing and the option for retakes, adapting the quiz to different teaching styles and assessment needs.",
              },
            ]}
          />
        </div>
      </Section>
      <Section>
        <h2 className="font-sans text-2xl font-bold">
          Conclusion: A Flexible Assessment Tool for Every Classroom
        </h2>
        <p>
          With full control over quiz content and settings, professors can craft
          assessments that truly support learning outcomes. By aligning quizzes
          with course goals, educators can better engage students and create an
          experience that is both enjoyable and academically rigorous.
        </p>
      </Section>
    </div>
  );
}
