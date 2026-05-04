"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PersonalisedWizardProps {
  isOpen: boolean;
  onClose: () => void;
  content: any; // Full content object
}

export function PersonalisedWizard({ isOpen, onClose, content }: PersonalisedWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  let customQuestions = [];
  try {
    customQuestions = content.painPointQuestions ? JSON.parse(content.painPointQuestions) : [];
  } catch (e) {}

  const totalSteps = 4 + customQuestions.length;

  const standardQuestions = [
    { id: "goal", question: "What is your primary health goal right now?", options: ["Weight Loss", "Muscle Gain", "Hormone Balance", "General Health"] },
    { id: "age", question: "What is your current age range?", options: ["18-25", "26-35", "36-50", "50+"] },
    { id: "diet", question: "Do you have any strict dietary preferences?", options: ["None", "Vegan/Vegetarian", "Keto/Low-Carb", "Gluten-Free/Dairy-Free"] },
    { id: "time", question: "How much time do you have for meal prep daily?", options: ["Under 15 mins", "15-30 mins", "30-60 mins", "Over an hour"] },
  ];

  const allQuestions = [
    ...standardQuestions,
    ...customQuestions.map((q: any, i: number) => ({ id: `custom_${i}`, question: q.question, options: q.options }))
  ];

  const currentQuestion = allQuestions[step - 1];

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const nextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/downloads/personalized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId: content.id,
            answers
          })
        });

        if (res.ok) {
          setSuccess(true);
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch (e) {
        alert("Failed to submit.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Request Received!">
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            ✓
          </div>
          <h3 className="text-xl font-bold text-gray-900">Request Received!</h3>
          <p className="text-gray-600">
            We've saved your preferences and our AI is currently generating a custom version of <strong>{content.title}</strong> tailored perfectly for you.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
            <p><strong>What happens next?</strong></p>
            <p>Our team will quickly review the AI generation for quality, and then we will send the final PDF directly to your email address!</p>
          </div>
          <Button onClick={onClose} className="mt-4 w-full">Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personalise Your Plan">
      <div className="space-y-6 pt-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-[#10b981] h-2 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        {currentQuestion && (
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">{currentQuestion.question}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((opt: string, i: number) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      isSelected ? "border-[#10b981] bg-green-50" : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
          ) : <div></div>}
          
          <Button 
            onClick={nextStep} 
            disabled={!answers[currentQuestion?.id] || isSubmitting}
            isLoading={isSubmitting}
          >
            {step === totalSteps ? "Send by Mail" : "Continue"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
