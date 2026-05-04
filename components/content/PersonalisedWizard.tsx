"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PersonalisedWizardProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
}

export function PersonalisedWizard({
  isOpen,
  onClose,
  content,
}: PersonalisedWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  let customQuestions: any[] = [];
  try {
    customQuestions = content.painPointQuestions
      ? JSON.parse(content.painPointQuestions)
      : [];
  } catch (e) {
    // ignore parse errors
  }

  const totalSteps = 4 + customQuestions.length;

  const standardQuestions = [
    {
      id: "goal",
      question: "What is your primary health goal right now?",
      options: ["Weight Loss", "Muscle Gain", "Hormone Balance", "General Health"],
    },
    {
      id: "age",
      question: "What is your current age range?",
      options: ["18-25", "26-35", "36-50", "50+"],
    },
    {
      id: "diet",
      question: "Do you have any strict dietary preferences?",
      options: ["None", "Vegan/Vegetarian", "Keto/Low-Carb", "Gluten-Free/Dairy-Free"],
    },
    {
      id: "time",
      question: "How much time do you have for meal prep daily?",
      options: ["Under 15 mins", "15-30 mins", "30-60 mins", "Over an hour"],
    },
  ];

  const allQuestions = [
    ...standardQuestions,
    ...customQuestions.map((q: any, i: number) => ({
      id: `custom_${i}`,
      question: q.question,
      options: q.options,
    })),
  ];

  const currentQuestion = allQuestions[step - 1];

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const nextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/downloads/personalized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentId: content.id,
            answers,
          }),
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
      <Modal isOpen={isOpen} onClose={onClose} title="Request Received">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Request Received
          </h3>
          <p className="text-muted-foreground">
            We&apos;ve saved your preferences and are generating a custom version
            of <strong className="text-foreground">{content.title}</strong>{" "}
            tailored for you.
          </p>
          <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm text-foreground">
            <p className="font-medium">What happens next?</p>
            <p className="mt-1 text-muted-foreground">
              Our team will review the AI generation for quality, then send the
              final PDF directly to your email.
            </p>
          </div>
          <Button onClick={onClose} className="mt-4 w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personalise Your Plan">
      <div className="space-y-6 pt-2">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {step} of {totalSteps}
          </span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Question */}
        {currentQuestion && (
          <div>
            <h3 className="mb-4 text-lg font-medium text-foreground">
              {currentQuestion.question}
            </h3>
            <div className="space-y-3">
              {currentQuestion.options.map((opt: string, i: number) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-foreground bg-secondary text-foreground"
                        : "border-border text-foreground hover:border-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

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
