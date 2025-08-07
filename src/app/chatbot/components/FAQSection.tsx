import React, { useState, useEffect } from 'react';
import { fetchMatchingFAQs } from '../../../services/chatbot/chatService';

interface FAQItemProps {
  question: string;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, onClick }) => {
  return (
    <div
      className="mb-1 cursor-pointer rounded-2xl border border-white/20 bg-[linear-gradient(180deg,#1e3a71_0%,#105993_45.19%,#0080bd_100%)] p-4 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
      onClick={onClick}
    >
      <p>{question}</p>
    </div>
  );
};

interface FAQSectionProps {
  onSelectQuestion: (question: string, visible: boolean) => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({ onSelectQuestion }) => {
  const [faqs, setFaqs] = useState<string[]>([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      const result = await fetchMatchingFAQs(); // You can pass default query if needed
      setFaqs(result);
    };

    fetchFAQs();
  }, []); // Empty dependency array to run only once

  return (
    <div className="my-2 max-h-[30vh] overflow-auto">
      <div className="mb-4 flex items-center justify-center gap-2">
        <div className="rounded bg-[#84cc16] px-2 py-1 text-center text-sm text-white">FAQ</div>
        <h2 className="text-center text-white">Ask from Frequently asked Question</h2>
        <div className="h-px flex-grow bg-[#e8e9ee80]"></div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {faqs.map((question, index) => (
          <FAQItem
            key={index}
            question={question}
            onClick={() => onSelectQuestion(question, true)}
          />
        ))}
      </div>

      {/* <div className="mt-1 text-right">
        <button className="text-white hover:underline">More...</button>
      </div> */}
    </div>
  );
};

export default FAQSection;
