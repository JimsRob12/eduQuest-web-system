import { Card, Carousel } from "@/components/Shared/carousel";
import { BLOGS } from "@/lib/constants";

export function BlogCarousel() {
  const cards = BLOGS.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="-mx-6 w-screen px-6 py-10 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
      <div className="pl-4">
        <h2 className="mb-2 font-sans text-lg font-bold text-black dark:text-white md:mb-4 md:text-4xl">
          <span className="relative">
            Explore{" "}
            <svg
              className="absolute -bottom-3 left-1/2 w-[70px] -translate-x-1/2 transform text-purple-700 md:w-[140px]"
              height="20"
              viewBox="0 0 140 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 10C10 0 30 20 50 10C70 0 90 20 110 10C130 0 150 20 170 10"
                stroke="currentColor"
                className="stroke-[3] md:stroke-[6]"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          Our{" "}
          <span className="rounded-xl bg-yellow-500 px-2 text-yellow-50">
            Resources
          </span>
        </h2>
        <p className="max-w-sm text-sm text-neutral-700 dark:text-neutral-300 md:text-base">
          Discover tips, guides, and tools to enhance learning and teaching.
          Stay updated with our latest articles and resources.
        </p>
      </div>
      <Carousel items={cards} />
    </div>
  );
}

export const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="mb-4 rounded-3xl bg-[#F5F5F7] p-8 dark:bg-neutral-800 md:p-14"
          >
            <p className="mx-auto max-w-3xl font-sans text-base text-neutral-600 dark:text-neutral-400 md:text-2xl">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
            <img
              src="https://assets.aceternity.com/macbook.png"
              alt="Macbook mockup from Aceternity UI"
              height="500"
              width="500"
              className="mx-auto h-full w-full object-contain md:h-1/2 md:w-1/2"
            />
          </div>
        );
      })}
    </>
  );
};
