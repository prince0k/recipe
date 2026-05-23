"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  HelpCircle, 
  FileText, 
  Image as ImageIcon,
  BookOpen,
  CheckSquare
} from "lucide-react";

export default function AIGeneratorPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<{name: string, topics: string[]}[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicMode, setTopicMode] = useState<"trends" | "manual">("trends");
  const [pastedTopics, setPastedTopics] = useState("");
  const [imageMode, setImageMode] = useState<"image" | "prompt">("image");
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
    let topicsToUse = selectedTopics;
    
    if (topicMode === "manual") {
      topicsToUse = pastedTopics
        .split("\n")
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }

    if (topicsToUse.length === 0) {
      alert("Please select or enter at least one topic.");
      return;
    }
    
    const types = (Object.keys(counts) as Array<keyof typeof counts>).filter(type => counts[type] > 0);
    const totalItems = topicsToUse.length * types.reduce((acc, type) => acc + counts[type], 0);
    
    setIsGenerating(true);
    setProgress({ current: 0, total: totalItems, currentTitle: "Initializing..." });

    let completed = 0;

    for (const topic of topicsToUse) {
      for (const type of types) {
        for (let i = 0; i < counts[type]; i++) {
          setProgress(prev => ({ ...prev, currentTitle: `Generating ${type}: ${topic} (${i+1}/${counts[type]})` }));
          
          try {
            const res = await fetch("/api/admin/ai/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic, type, imageMode })
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            AI Content Engine
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Automatically discover online search trends and instantly draft AEO-optimized content cards.
          </p>
        </div>
        <Button 
          onClick={searchTrends} 
          isLoading={isSearching}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm px-5 hover:shadow-lg hover:shadow-emerald-600/15 transition-all duration-200"
        >
          <Search className="w-4 h-4" /> 
          Discover Hot Topics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step 1: Select Topics */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => setTopicMode("trends")}
                  className={`text-sm font-bold pb-1.5 transition-all border-b-2 ${
                    topicMode === "trends" 
                      ? "text-emerald-600 border-emerald-600" 
                      : "text-slate-400 border-transparent hover:text-slate-600"
                  }`}
                >
                  📈 Trending Topics
                </button>
                <button 
                  onClick={() => setTopicMode("manual")}
                  className={`text-sm font-bold pb-1.5 transition-all border-b-2 ${
                    topicMode === "manual" 
                      ? "text-emerald-600 border-emerald-600" 
                      : "text-slate-400 border-transparent hover:text-slate-600"
                  }`}
                >
                  📝 Manual Paste
                </button>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {topicMode === "trends" ? `${selectedTopics.length} selected` : `${pastedTopics.split("\n").filter(t => t.trim()).length} topics`}
              </span>
            </div>
            
            <CardContent className="p-6">
              {topicMode === "manual" ? (
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700 block">
                    Paste your topics below, one per line:
                  </label>
                  <textarea
                    className="w-full h-[380px] p-4 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-mono text-sm leading-relaxed transition-all"
                    placeholder="e.g.&#10;How to lose weight fast&#10;Intermittent fasting guide&#10;Keto diet recipes"
                    value={pastedTopics}
                    onChange={(e) => setPastedTopics(e.target.value)}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Every separate line will trigger a standalone content generator request in draft mode.</span>
                  </p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/20">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Ready to fetch real-time trends?</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Click "Discover Hot Topics" at the top right to analyze search trends using Serper API.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {categories.map(category => (
                    <div key={category.name} className="space-y-4">
                      <h4 className="font-serif text-lg font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.topics.map(topic => (
                          <div 
                            key={topic}
                            onClick={() => !isGenerating && toggleTopic(topic)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                              selectedTopics.includes(topic) 
                                ? "border-emerald-500 bg-emerald-50/30" 
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span className="font-semibold text-sm text-slate-700 leading-normal group-hover:text-emerald-700 transition-colors">
                              {topic}
                            </span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                              selectedTopics.includes(topic) 
                                ? "bg-emerald-600 border-emerald-600 text-white" 
                                : "border-slate-350 bg-white"
                            }`}>
                              {selectedTopics.includes(topic) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-950 text-base font-serif">Configure Output</h3>
            </div>
            
            <CardContent className="p-6 space-y-6">
              
              {/* Image Selection Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2.5 block">
                  Image Generation Mode
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageMode("image")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      imageMode === "image" 
                        ? "bg-emerald-600 text-white shadow-sm" 
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    🖼️ Active Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("prompt")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      imageMode === "prompt" 
                        ? "bg-amber-600 text-white shadow-sm" 
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    📜 Prompt Only
                  </button>
                </div>
                <p className="text-[10px] text-slate-450 mt-2 italic">
                  {imageMode === "image" ? "Automatically generate and link cover imagery." : "Only write prompts so you can create images manually later."}
                </p>
              </div>

              {/* Counts Incrementer List */}
              <div className="space-y-4">
                {(Object.keys(counts) as Array<keyof typeof counts>).map(type => (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <label className="text-sm font-semibold text-slate-600 capitalize">
                      {type.replace("_", " ").toLowerCase()}s
                    </label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold text-slate-600 transition-colors disabled:opacity-50"
                        disabled={isGenerating || counts[type] === 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-slate-900">{counts[type]}</span>
                      <button 
                        type="button"
                        onClick={() => setCounts(prev => ({ ...prev, [type]: Math.min(10, prev[type] + 1) }))}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold text-slate-600 transition-colors disabled:opacity-50"
                        disabled={isGenerating || counts[type] === 10}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate button action */}
              <div className="pt-4 border-t border-slate-100">
                <Button 
                  className="w-full py-4 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:shadow-slate-950/20 transition-all duration-200 active:scale-98"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating || 
                    (topicMode === "trends" && selectedTopics.length === 0) || 
                    (topicMode === "manual" && !pastedTopics.trim())
                  }
                  isLoading={isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {(topicMode === "trends" ? selectedTopics.length : pastedTopics.split("\n").filter(t => t.trim()).length) * Object.values(counts).reduce((a,b)=>a+b, 0)} Items
                </Button>
              </div>

              {/* progress details */}
              {isGenerating && (
                <div className="space-y-3.5 pt-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/60">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Overall Progress</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-500 italic font-medium leading-relaxed">
                    {progress.currentTitle}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* info Callout */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-inner">
            <div className="flex gap-3">
              <span className="text-2xl p-2 bg-amber-100 rounded-xl h-fit">💡</span>
              <div className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">AEO Optimized Drafting</p>
                All content pieces utilize custom Answer Engine Optimization patterns to index cleanly on next-generation search assistants.
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}

