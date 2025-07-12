import { HomeClient } from "@/components/chat/home-client";

export default function Home() {
  const suggestedQuestions = [
    "What are the key benefits of using RAG with data streaming for GenAI applications?",
    "How does RAG differ from traditional data retrieval methods like database queries?",
    "What are the potential drawbacks of fine-tuning or bespoke model training compared to RAG?"
  ];

  const moreQuestions = [
    "What are the key findings of this paper?",
    "Explain the methodology used",
    "What are the limitations of this study?",
    "Summarize in simpler terms"
  ];

  return (
    <div className="w-full h-full">
      <HomeClient 
        suggestedQuestions={suggestedQuestions} 
        moreQuestions={moreQuestions} 
      />
    </div>
  );
}
