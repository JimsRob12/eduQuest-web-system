import CallToActionButtons from "./CallToActionButtons";
import Header from "./Header";

export default function LandingPage() {
  return (
    <div className="my-8 flex h-full w-full flex-col items-center space-y-8">
      <Header />
      <CallToActionButtons />
    </div>
  );
}
