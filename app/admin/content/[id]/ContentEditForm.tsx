"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { ContentDetailView } from "@/components/content/ContentDetailView";
import { Modal } from "@/components/ui/Modal";
import { DeleteContentButton } from "@/components/admin/DeleteContentButton";
import { ArrowLeft, Sparkles, Eye, FileText, Image as ImageIcon, Video, HelpCircle, Check, X, Plus } from "lucide-react";
import Link from "next/link";

interface ContentEditFormProps {
  id: string;
  initialData: any;
}

export function ContentEditForm({ id, initialData }: ContentEditFormProps) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    slug: initialData.slug || "",
    type: initialData.type || "RECIPE",
    excerpt: initialData.excerpt || "",
    body: initialData.body || "",
    tags: initialData.tags ? JSON.parse(initialData.tags).join(", ") : "",
    coverImage: initialData.coverImage || "",
    coverVideo: initialData.coverVideo || "",
    seoTitle: initialData.seoTitle || "",
    seoDesc: initialData.seoDesc || "",
    published: initialData.published || false,
  });

  const [questions, setQuestions] = useState<{question: string, options: string[]}[]>(() => {
    if (initialData.painPointQuestions) {
      try {
        return JSON.parse(initialData.painPointQuestions);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const addQuestion = () => {
    if (questions.length >= 3) return;
    setQuestions([...questions, { question: "", options: ["", ""] }]);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQ = [...questions];
    newQ[index].question = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    setQuestions(newQ);
  };

  const addOption = (qIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.push("");
    setQuestions(newQ);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImage" | "coverVideo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "coverImage") setIsUploadingImage(true);
    if (field === "coverVideo") setIsUploadingVideo(true);

    const data = new FormData();
    data.append("file", file);
    data.append("type", field === "coverVideo" ? "video" : "image");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setFormData(prev => ({ ...prev, [field]: json.url }));
    } catch (e) {
      alert("Failed to upload " + field);
    } finally {
      if (field === "coverImage") setIsUploadingImage(false);
      if (field === "coverVideo") setIsUploadingVideo(false);
    }
  };

  const generateSEO = async () => {
    if (!formData.title) {
      alert("Please enter a title first to generate SEO tags.");
      return;
    }
    
    setIsGeneratingSEO(true);
    try {
      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, body: formData.body }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, seoTitle: data.seoTitle, seoDesc: data.seoDesc }));
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to generate SEO");
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(",").map((t: string) => t.trim()) : [],
          painPointQuestions: questions.filter(q => q.question.trim() !== "")
        }),
      });

      if (!res.ok) throw new Error("Failed to update content");

      router.push("/admin/content");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin/content" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all duration-200 group bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              Back to Library
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            Edit Content
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Update your diet guide, culinary recipe, or personalization survey details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Details Card */}
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-base font-serif">Core Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">Primary information regarding the content</p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Title"
                required
                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                }}
              />
              <Input
                label="Slug"
                required
                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-700 bg-white transition-all text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="RECIPE">Recipe</option>
                  <option value="DIET_PLAN">Diet Plan</option>
                  <option value="CHEAT_SHEET">Cheat Sheet</option>
                  <option value="BLOG">Blog Post</option>
                </select>
              </div>
              <Input
                label="Tags (comma separated)"
                placeholder="weight-loss, keto, easy"
                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Excerpt</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm leading-relaxed"
                rows={3}
                required
                placeholder="Brief summary of this content piece..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            {/* Cover Images/Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Cover Image URL
                </label>
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="/uploads/..." 
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 flex-1"
                    value={formData.coverImage} 
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})} 
                  />
                  <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-200 shrink-0 h-10 flex items-center justify-center">
                    {isUploadingImage ? "..." : "Upload"}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverImage")} disabled={isUploadingImage} />
                  </label>
                </div>
                {initialData.coverImagePrompt && !formData.coverImage && (
                  <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl relative overflow-hidden">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5 flex justify-between">
                      AI Image Prompt 
                      <button 
                        type="button" 
                        onClick={() => {
                          navigator.clipboard.writeText(initialData.coverImagePrompt);
                          alert("Prompt copied to clipboard!");
                        }}
                        className="underline hover:text-amber-900 transition-colors font-bold"
                      >
                        Copy
                      </button>
                    </p>
                    <p className="text-xs text-amber-800 italic leading-relaxed">
                      {initialData.coverImagePrompt}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-slate-400" />
                  Cover Video URL (Optional)
                </label>
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="/uploads/..." 
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 flex-1"
                    value={formData.coverVideo} 
                    onChange={(e) => setFormData({...formData, coverVideo: e.target.value})} 
                  />
                  <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-200 shrink-0 h-10 flex items-center justify-center">
                    {isUploadingVideo ? "..." : "Upload"}
                    <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => handleCoverUpload(e, "coverVideo")} disabled={isUploadingVideo} />
                  </label>
                </div>
              </div>
            </div>

            {/* Document editor body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Body (HTML/Markdown)</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-mono text-sm leading-relaxed focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  rows={20}
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="<h1>Title</h1><p>Content goes here...</p>"
                />
              </div>
              <div className="lg:col-span-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                <MediaLibrary />
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 pt-2">
              <input 
                type="checkbox" 
                id="published" 
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="published" className="font-semibold text-sm text-slate-700 select-none">
                Published
              </label>
            </div>
          </CardContent>
        </Card>

        {/* SEO Card */}
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">SEO &amp; Metadata</h3>
              <p className="text-xs text-slate-400 mt-0.5">Optimize discovery in Google search queries</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={generateSEO} 
              isLoading={isGeneratingSEO}
              className="flex items-center gap-1.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
            </Button>
          </div>
          <CardContent className="p-6 space-y-4">
            <Input
              label="SEO Title"
              className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">SEO Description</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm leading-relaxed"
                rows={2}
                value={formData.seoDesc}
                onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* personalization Questionnaire */}
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">Personalisation Survey</h3>
              <p className="text-xs text-slate-400 mt-0.5">Questions for generating dynamic content versions</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addQuestion} 
              disabled={questions.length >= 3}
              className="flex items-center gap-1.5 text-xs rounded-xl font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </Button>
          </div>
          <CardContent className="p-6 space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              Add up to 3 custom multiple-choice questions that users will be asked when they request a personalized version of this content.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-5 border border-slate-150 rounded-2xl relative bg-slate-50/50 space-y-4">
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="pr-10">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-semibold text-slate-950"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, e.target.value)}
                      placeholder="e.g. What is your biggest struggle with sugar?"
                    />
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-emerald-500">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Options</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
                            value={opt}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => addOption(qIndex)}
                      className="text-xs text-emerald-600 font-bold hover:text-emerald-700 transition-colors mt-2 inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/30">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No personalisation survey defined</p>
                <p className="text-xs text-slate-400 mt-0.5">Add questions to enable personalized recipe versions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer controls */}
        <div className="flex justify-between items-center mt-8 border-t border-slate-100 pt-6">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </Button>
            <DeleteContentButton 
              id={id} 
              title={formData.title} 
              redirectAfterDelete="/admin/content"
              className="rounded-xl font-bold"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold px-6 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all duration-200"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Full Screen Live Preview */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Live Preview">
        <div className="max-h-[80vh] overflow-y-auto pt-4 border-t border-slate-100 mt-2">
          <div className="max-w-4xl mx-auto pointer-events-none">
            <ContentDetailView 
              content={{ ...formData, id: id || "preview" } as any} 
              adComponent={
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-455 font-bold uppercase tracking-wider select-none">
                  Advertisement (Blog Sidebar Placement)
                </div>
              } 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

