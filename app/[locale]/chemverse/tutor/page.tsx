import type { Metadata } from "next";
import AIChatTutor from "@/components/chemverse/AIChatTutor";

export const metadata: Metadata = {
  title: "AI Chemistry Tutor | ChemVerse",
  description: "Ask any chemistry question, get quizzed, or predict reaction products — powered by GPT-4o mini.",
};

export default function TutorPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-950">
      <AIChatTutor />
    </div>
  );
}
