import { BulletList, NumberedList, Section } from "@/components/Shared/blog";

export default function Blog2() {
  return (
    <div className="font-default text-base text-zinc-950 dark:text-zinc-50 md:text-lg">
      <p>
        In the age of digital learning, engagement is more essential than ever.
        Our platform brings a unique twist to the learning process by gamifying
        quizzes in a nostalgic 8-bit style. This approach merges the excitement
        of gaming with the rigor of academics, creating a space where students
        look forward to quizzes and professors enjoy more engaged classrooms.
      </p>
      <Section className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <p>
            Gamification has proven to increase{" "}
            <span className="font-bold">student engagement</span> and{" "}
            <span className="font-bold">knowledge retention</span> by tapping
            into the thrill of competition and accomplishment. The playful,
            8-bit visuals remind students of classic video games, making
            learning feel more like an interactive adventure than an academic
            task. Here’s why 8-bit works:
          </p>
          <BulletList
            items={[
              {
                title: "Nostalgia and Simplicity",
                content:
                  "8-bit visuals create a sense of familiarity and fun, encouraging students to interact with quizzes actively.",
              },
              {
                title: "Clear and Consistent Design",
                content:
                  "The simple, pixelated style makes it easy to focus on questions without overwhelming visual distractions.",
              },
              {
                title: "Encouraging Friendly Competition",
                content:
                  "Live leaderboards, avatars, and ranks provide students with instant feedback and a sense of progress.",
              },
            ]}
          />
        </div>
        <img
          src="/images/blog-2.1.jpg"
          alt="Infographic showing the positive effects of gamification on engagement"
          className="w-full rounded-3xl object-cover"
        />
      </Section>
      <Section>
        <h2 className="font-bold">
          What an 8-Bit Quiz Looks Like for Students
        </h2>
        <p>
          Our platform transports students into a virtual quiz world where
          everything from avatars to question prompts takes on a playful, 8-bit
          aesthetic.
        </p>
        <NumberedList
          items={[
            {
              title: "Joining a Quiz",
              content:
                "Students enter the game room by using a unique class code or link provided by the professor. The 8-bit lobby features avatars and a virtual waiting area, setting a playful tone for the quiz.",
            },
            {
              title: "Answering Questions",
              content:
                "As questions appear, students respond in real-time, navigating through a vibrant, pixelated interface designed to keep focus on content without compromising the gaming atmosphere.",
            },
            {
              title: "Seeing Progress on the Leaderboard",
              content:
                "After each question, a live leaderboard updates, showing each student’s rank and progress in colorful, 8-bit detail.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-bold">
          How 8-Bit Design Boosts Engagement in Different Subjects
        </h2>
        <img
          src="/images/blog-2.2.png"
          alt=" A set of 8-bit icons representing subjects (e.g., math, science, language arts) to show how the style applies across disciplines."
          className="h-[300px] w-full rounded-3xl object-cover"
        />
        <BulletList
          items={[
            {
              title: "Math",
              content:
                "Quizzes use retro number fonts and fun animations for calculations and problem-solving, making math interactive.",
            },
            {
              title: "Science",
              content:
                "Animated visuals, like bubbling beakers or pixelated microscopes, add life to science questions.",
            },
            {
              title: "History",
              content:
                "Icons and avatars reflect historical periods, adding context to each question and enriching the learning experience.",
            },
            {
              title: "Language Arts",
              content:
                "Word and reading questions are supported by clear, readable fonts with a playful, low-res aesthetic.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-bold">
          Features that Make the Game Room Experience Unique
        </h2>
        <p>
          Our 8-bit quiz environment is not just about looks; it’s packed with
          interactive elements designed to maintain attention and make learning
          enjoyable:
        </p>
        <BulletList
          items={[
            {
              title: "Avatars and Customizable Profiles",
              content:
                "Students can choose avatars, fostering a personalized quiz experience and a sense of virtual identity.",
            },
            {
              title: "Real-Time Feedback with Leaderboards",
              content:
                "Each correct answer moves students up the ranks, with immediate feedback creating excitement.",
            },
            {
              title: "Real-Time Feedback",
              content:
                "Students receive instant feedback on their answers, with detailed explanations for correct and incorrect responses.",
            },
            {
              title: "Achievements and Rewards",
              content:
                "Badges, stars, and points make every quiz feel like a level-up opportunity, keeping students motivated.",
            },
          ]}
        />
        <video
          autoPlay
          muted
          loop
          className="rounded-3xl border-4 border-neutral-600"
        >
          <source src="/videos/snippet-3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Section>
      <Section>
        <h2 className="font-sans text-2xl font-bold">
          Conclusion: Reinventing Quizzes with 8-Bit Gamification
        </h2>
        <img
          src="/images/blog-2.3.png"
          alt="An image depicting the transition from a traditional classroom to a game-like interface, underscoring the blend of education and entertainment."
          className="h-[600px] w-full rounded-3xl object-cover"
        />
        <p>
          With its blend of fun and function, our 8-bit quiz platform is
          transforming classrooms into game rooms, where learning is more
          dynamic and students feel empowered to succeed. By revisiting the
          classics of video game design, we’ve created an environment that
          speaks to the digital generation, making quizzes a highlight of the
          learning experience.
        </p>
      </Section>
    </div>
  );
}
