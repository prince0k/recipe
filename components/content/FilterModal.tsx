"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string;
  selectedDietary: string[];
  onApply: (time: string, dietary: string[]) => void;
}

const TIMES = ["Under 15 mins", "15-30 mins", "30-60 mins", "1 hour+"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten Free", "Dairy Free"];

export function FilterModal({
  isOpen,
  onClose,
  selectedTime: initialTime,
  selectedDietary: initialDietary,
  onApply,
}: FilterModalProps) {
  const [time, setTime] = useState(initialTime);
  const [dietary, setDietary] = useState<string[]>(initialDietary);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setTime(initialTime);
      setDietary(initialDietary);
    }
  }, [isOpen, initialTime, initialDietary]);

  if (!isOpen) return null;

  const handleDietaryToggle = (diet: string) => {
    if (dietary.includes(diet)) {
      setDietary(dietary.filter((d) => d !== diet));
    } else {
      setDietary([...dietary, diet]);
    }
  };

  const handleApply = () => {
    onApply(time, dietary);
    onClose();
  };

  const handleReset = () => {
    setTime("");
    setDietary([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print-hide" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div className="fixed inset-0 bg-[#2c1e11]/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal centering trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Content Card */}
        <div className="relative inline-block align-bottom bg-[#fafaf8] rounded-t-3xl sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-[#e8e4dc]">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e8e4dc] bg-white flex justify-between items-center">
            <h3 className="text-lg font-serif font-bold text-[#2c1e11]">
              Filter Recipes
            </h3>
            <button 
              onClick={onClose}
              className="text-[#5d4037] hover:text-[#7a3010] p-1 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-6 space-y-8 max-h-[60vh] overflow-y-auto">
            {/* Cooking Time Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#2c1e11] mb-4 border-b border-[#e8e4dc] pb-2">
                Cooking Time
              </h4>
              <div className="space-y-3">
                {TIMES.map((t) => (
                  <label key={t} className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="modal-time"
                      checked={time === t}
                      onChange={() => setTime(time === t ? "" : t)}
                      className="w-4 h-4 border-[#e8e4dc] text-[#7a3010] focus:ring-[#7a3010] mr-3"
                    />
                    <span className={`text-sm transition-colors ${time === t ? "text-[#7a3010] font-bold" : "text-[#5d4037] group-hover:text-[#7a3010]"}`}>
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#2c1e11] mb-4 border-b border-[#e8e4dc] pb-2">
                Dietary Preferences
              </h4>
              <div className="space-y-3">
                {DIETARY.map((diet) => (
                  <label key={diet} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietary.includes(diet)}
                      onChange={() => handleDietaryToggle(diet)}
                      className="w-4 h-4 rounded border-[#e8e4dc] text-[#7a3010] focus:ring-[#7a3010] mr-3"
                    />
                    <span className={`text-sm transition-colors ${dietary.includes(diet) ? "text-[#7a3010] font-bold" : "text-[#5d4037] group-hover:text-[#7a3010]"}`}>
                      {diet}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 border-t border-[#e8e4dc] bg-white flex justify-between items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-[#7a3010] underline uppercase tracking-widest hover:text-[#993c1d] transition-colors"
            >
              Reset Filters
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="font-semibold text-xs py-2"
              >
                Cancel
              </Button>
              <button
                onClick={handleApply}
                className="bg-[#7a3010] hover:bg-[#993c1d] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md shadow-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
