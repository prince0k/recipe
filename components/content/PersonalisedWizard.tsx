"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PersonalisedWizardProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  isLoggedIn: boolean;
}

export function PersonalisedWizard({
  isOpen,
  onClose,
  content,
  isLoggedIn,
}: PersonalisedWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  let customQuestions: any[] = [];
  try {
    customQuestions = content.painPointQuestions
      ? JSON.parse(content.painPointQuestions)
      : [];
  } catch (e) {
    // ignore parse errors
  }

  const totalSteps = 8 + customQuestions.length;
  const standardQuestions = [
    // ... same as before
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
      id: "gender",
      question: "Which gender do you identify as?",
      options: ["Male", "Female", "Non-binary", "Prefer not to say"],
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
    {
      id: "activity",
      question: "How would you describe your daily activity level?",
      options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"],
    },
    {
      id: "struggle",
      question: "What is your biggest struggle with healthy eating?",
      options: ["Cravings", "Consistency", "Emotional Eating", "Lack of Knowledge"],
    },
    {
      id: "additional",
      question: "Anything else you'd like to share to make this plan even more personalized? (Optional)",
      type: "text"
    }
  ];

  const allQuestions = [
    ...standardQuestions,
    ...customQuestions.map((q: any, i: number) => ({
      id: `custom_${i}`,
      question: q.question,
      options: q.options,
    })),
  ];

  const currentQuestion = allQuestions[step - 1] as any;

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const nextStep = async () => {
    setError(null);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (!isLoggedIn && !showEmailCapture) {
        setShowEmailCapture(true);
      } else {
        if (!isLoggedIn && (!email || !email.includes("@"))) {
          setError("Please enter a valid email address.");
          return;
        }

        setIsSubmitting(true);
        try {
          const res = await fetch("/api/downloads/personalized", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentId: content.id,
              answers,
              ...(email && { email }),
            }),
          });

          const data = await res.json();

          if (res.ok) {
            setSuccess(true);
          } else {
            setError(data.error || "Something went wrong. Please try again.");
          }
        } catch (e) {
          setError("Failed to submit.");
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Success!">
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
            Plan Request Sent
          </h3>
          <p className="text-muted-foreground">
            We&apos;ve received your request for a personalized version of <strong className="text-foreground">{content.title}</strong>.
          </p>
          <div className="rounded-lg border border-border bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
            <p className="font-semibold text-lg">Check your mail box / inbox or spam</p>
            <p className="mt-1 text-sm opacity-90">
              Your personalized guide is being generated and will be sent shortly.
            </p>
          </div>
          <Button onClick={onClose} className="mt-4 w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  const computedCalories = (() => {
    let base = 2000;
    if (answers.gender === "Female") base -= 200;
    if (answers.activity === "Sedentary") base -= 300;
    if (answers.activity === "Lightly Active") base -= 100;
    if (answers.activity === "Very Active") base += 300;
    if (answers.goal === "Weight Loss") base -= 400;
    if (answers.goal === "Muscle Gain") base += 400;
    return base;
  })();

  const computedMacros = (() => {
    if (answers.diet?.toLowerCase().includes("keto") || answers.diet?.toLowerCase().includes("low-carb")) {
      return { carbs: "10%", protein: "25%", fats: "65%" };
    }
    if (answers.diet?.toLowerCase().includes("vegan") || answers.diet?.toLowerCase().includes("vegetarian")) {
      return { carbs: "50%", protein: "25%", fats: "25%" };
    }
    return { carbs: "40%", protein: "30%", fats: "30%" };
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personalise Your Plan">
      <div className="space-y-6 pt-2">
        {!showEmailCapture ? (
          <>
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
                {currentQuestion.type === "text" ? (
                  <textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                    placeholder="Share any specific details, allergies, or preferences..."
                    className="w-full rounded-lg border border-border bg-secondary/50 p-4 text-foreground focus:border-foreground focus:outline-none min-h-[120px]"
                  />
                ) : (
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
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold text-left">
                ⚠️ {error}
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
                disabled={(currentQuestion?.type !== "text" && !answers[currentQuestion?.id]) || isSubmitting}
                isLoading={isSubmitting}
              >
                {step === totalSteps && isLoggedIn ? "Send by Mail" : "Continue"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-left">
              <h4 className="font-bold text-base mb-2">🎉 Assessment Complete!</h4>
              <p className="text-sm opacity-90">We've calculated a custom target configuration for your blueprint:</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <span className="block text-xs uppercase tracking-wider opacity-75">Daily Calorie Target</span>
                  <span className="text-lg font-bold">{computedCalories} kcal</span>
                </div>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <span className="block text-xs uppercase tracking-wider opacity-75">Macro Breakdown</span>
                  <span className="text-xs font-semibold block mt-1">Carbs: {computedMacros.carbs}</span>
                  <span className="text-xs font-semibold block">Protein: {computedMacros.protein}</span>
                  <span className="text-xs font-semibold block">Fats: {computedMacros.fats}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <label htmlFor="anonymous-email" className="block text-sm font-bold text-text">
                Enter your email address to receive your full 7-day custom plan:
              </label>
              <input
                id="anonymous-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 p-4 text-foreground focus:border-foreground focus:outline-none"
              />
              <p className="text-xs text-text-muted">
                Your free plan is compiled dynamically using our science-backed culinary guides and emailed directly to your inbox.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold text-left">
                ⚠️ {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => {
                setError(null);
                setShowEmailCapture(false);
              }}>
                Back
              </Button>

              <Button
                onClick={nextStep}
                disabled={!email || !email.includes("@") || isSubmitting}
                isLoading={isSubmitting}
              >
                Send Full 7-Day Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
