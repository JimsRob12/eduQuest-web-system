import CallToActionButtons from "./CallToActionButtons";
import Header from "./Header";

export default function LandingPage() {
  return (
    <section className="my-8 flex h-[calc(100%-12rem)] w-full flex-col items-center justify-center space-y-8">
      <Header />
      <CallToActionButtons />
    </section>
  );
}
