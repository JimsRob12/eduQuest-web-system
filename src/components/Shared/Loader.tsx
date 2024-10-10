export default function Loader() {
  return (
    <div className="-mx-6 flex h-screen w-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-900 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16">
      <div className="relative h-12 w-12 animate-spin border-2 border-solid border-black dark:border-white">
        <div className="animate-spin-slow absolute inset-0 m-auto h-8 w-8 border-2 border-solid border-black dark:border-white"></div>
        <div className="animate-spin-fast absolute inset-0 m-auto h-6 w-6 border-2 border-solid border-black dark:border-white"></div>
      </div>
    </div>
  );
}
