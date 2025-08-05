import React from 'react';

interface FAQItemProps {
  question: string;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, onClick }) => {
  return (
    <div className="faq-card mb-1 cursor-pointer" onClick={onClick}>
      <p>{question}</p>
    </div>
  );
};

interface FAQSectionProps {
  onSelectQuestion: (question: string, visible: boolean) => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({ onSelectQuestion }) => {
  const faqs = [
    'What is an Inventory Aging Trends Report? Why is it Important?',
    'Differentiation between Unreleased PRs and PRs Under Procurement?',
    'What are the Purchase Requisition and how are they used?',
    'What are the challenges of Material Consumption? Why is it Important?',
    'What is a Purchase order martial type? Why is Material Type Important in a PO?',
    'Summary of Purchase Order by Material Type Report? Why is it Important?',
  ];

  return (
    <div className="my-2">
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

      <div className="mt-1 text-right">
        <button className="text-white hover:underline">More...</button>
      </div>
    </div>
  );
};

export default FAQSection;
