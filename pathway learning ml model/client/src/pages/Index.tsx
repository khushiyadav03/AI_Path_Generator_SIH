import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AIInsights from "@/components/sections/AIInsights";
import AssistantChat from "@/components/common/AssistantChat";

export default function Index() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <AIInsights />
      <AssistantChat />
    </main>
  );
}
