import CallToActionButtons from "./CallToActionButtons";

export default function Recap() {
  return (
    <div className="-mx-6 w-screen bg-zinc-50 px-6 py-24 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
      <div className="mx-auto space-y-6 rounded-xl bg-purple-500 py-8 text-purple-50">
        <div className="flex items-center justify-center gap-4">
          <div className="rounded-full border border-zinc-900 px-4 text-xs text-zinc-900">
            create
          </div>
          <div className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 font-black text-zinc-50 shadow-[0px_4px_0px_#f0f0f0]">
            eduQuest
          </div>
          <div className="rounded-full border border-zinc-900 px-4 text-xs text-zinc-900">
            learn
          </div>
        </div>
        <h1 className="text-center text-5xl font-black md:text-7xl">
          <span className="flex items-center justify-center gap-2 text-zinc-900">
            <img src="/flower.png" className="w-10" />
            let's get
            <img src="/flower.png" className="w-10" />
          </span>
          <span className="relative z-20">started now</span>
        </h1>
        <CallToActionButtons
          align="center"
          hideArrow
          firstButtonNavLink="NavLink"
          firstButtonText="Sign up"
          firstButtonTo="/signup"
          secondButtonText="Login"
          secondButtonTo="/login"
        />
      </div>
    </div>
  );
}
