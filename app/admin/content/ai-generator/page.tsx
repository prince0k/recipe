"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";

export default function AIGeneratorPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<{name: string, topics: string[]}[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentTitle: "" });
  const [counts, setCounts] = useState({
    BLOG: 3,
    RECIPE: 3,
    DIET_PLAN: 3,
    CHEAT_SHEET: 3
  });

  const searchTrends = async () => {
    setIsSearching(true);
    try {
      const res = await fetch("/api/admin/ai/trending");
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
        // Select all topics by default
        const allTopics = data.categories.flatMap((c: any) => c.topics);
        setSelectedTopics(allTopics);
      } else {
        alert(`${data.error || "Failed to find trending topics"}: ${data.details || ""}`);
      }
    } catch (e) {
      alert("Failed to find trending topics. Check your internet connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) return;
    
    const types = (Object.keys(counts) as Array<keyof typeof counts>).filter(type => counts[type] > 0);
    const totalItems = selectedTopics.length * types.reduce((acc, type) => acc + counts[type], 0);
    
    setIsGenerating(true);
    setProgress({ current: 0, total: totalItems, currentTitle: "Initializing..." });

    let completed = 0;

    for (const topic of selectedTopics) {
      for (const type of types) {
        for (let i = 0; i < counts[type]; i++) {
          setProgress(prev => ({ ...prev, currentTitle: `Generating ${type}: ${topic} (${i+1}/${counts[type]})` }));
          
          try {
            const res = await fetch("/api/admin/ai/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, type })
            });
            
            if (!res.ok) throw new Error("Generation failed");
            
            completed++;
            setProgress(prev => ({ ...prev, current: completed }));
          } catch (e) {
            console.error("Error generating item:", e);
          }
        }
      }
    }

    setIsGenerating(false);
    alert(`Successfully generated ${completed} items as drafts!`);
    router.push("/admin/content");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">AI Content Engine</h1>
          <p className="text-gray-500 mt-1">Generate bulk, SEO-optimized content based on real-time trends.</p>
        </div>
        <Button 
          onClick={searchTrends} 
          isLoading={isSearching}
          disabled={isGenerating}
          variant="outline"
        >
          🔍 Search Trending Topics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Topics */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">1. Select Trending Topics</h3>
              <span className="text-xs text-gray-500">{selectedTopics.length} selected</span>
            </div>
            <CardContent className="pt-6">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                  Click "Search Trending Topics" to fetch latest data from Serper.
                </div>
              ) : (
                <div className="space-y-8">
                  {categories.map(category => (
                    <div key={category.name} className="space-y-4">
                      <h4 className="font-serif text-lg font-bold text-[#10b981] border-l-4 border-[#10b981] pl-3">
                        {category.name}
                      </h4>
                      <div className="grid gap-3">
                        {category.topics.map(topic => (
                          <div 
                            key={topic}
                            onClick={() => !isGenerating && toggleTopic(topic)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedTopics.includes(topic) 
                                ? "border-[#10b981] bg-[#10b981]/5" 
                                : "border-gray-100 hover:border-gray-200"
                            } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedTopics.includes(topic) ? "bg-[#10b981] border-[#10b981]" : "border-gray-300"
                              }`}>
                                {selectedTopics.includes(topic) && <span className="text-white text-xs">✓</span>}
                              </div>
                              <span className="font-medium text-gray-700">{topic}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Configure & Generate */}
        <div className="space-y-6">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">2. Configure Output</h3>
            </div>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                {(Object.keys(counts) as Array<keyof typeof counts>).map(type => (
                  <div key={type} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600 capitalize">
                      {type.replace("_", " ")}s
                    </label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        disabled={isGenerating}
                      >-</button>
                      <span className="w-4 text-center font-bold">{counts[type]}</span>
                      <button 
                        onClick={() => setCounts(prev => ({ ...prev, [type]: Math.min(10, prev[type] + 1) }))}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        disabled={isGenerating}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button 
                  className="w-full py-6 text-lg shadow-lg shadow-[#10b981]/20"
                  onClick={handleGenerate}
                  disabled={selectedTopics.length === 0 || isGenerating}
                  isLoading={isGenerating}
                >
                  ✨ Generate {selectedTopics.length * Object.values(counts).reduce((a,b)=>a+b, 0)} Items
                </Button>
              </div>

              {isGenerating && (
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Overall Progress</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10b981] transition-all duration-500"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-gray-400 italic">
                    {progress.currentTitle}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <span className="text-xl">💡</span>
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">AEO Optimized</p>
                All content is generated with specific Answer Engine Optimization (AEO) patterns to help you trend on AI search tools.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
