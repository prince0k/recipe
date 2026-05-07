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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">Edit Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Title"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                }}
              />
              <Input
                label="Slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981]/50 outline-none"
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
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                rows={3}
                required
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="/uploads/..." 
                    value={formData.coverImage} 
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})} 
                  />
                  <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded-md text-sm border hover:bg-gray-200">
                    {isUploadingImage ? "..." : "Upload"}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverImage")} disabled={isUploadingImage} />
                  </label>
                </div>
                {initialData.coverImagePrompt && !formData.coverImage && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-[10px] font-bold text-amber-700 uppercase mb-1 flex justify-between">
                      AI Image Prompt 
                      <button 
                        type="button" 
                        onClick={() => {
                          navigator.clipboard.writeText(initialData.coverImagePrompt);
                          alert("Prompt copied to clipboard!");
                        }}
                        className="underline"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Video (Optional)</label>
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="/uploads/..." 
                    value={formData.coverVideo} 
                    onChange={(e) => setFormData({...formData, coverVideo: e.target.value})} 
                  />
                  <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded-md text-sm border hover:bg-gray-200">
                    {isUploadingVideo ? "..." : "Upload"}
                    <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => handleCoverUpload(e, "coverVideo")} disabled={isUploadingVideo} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML/Markdown)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none font-mono text-sm"
                  rows={20}
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="<h1>Title</h1><p>Content goes here...</p>"
                />
              </div>
              <div className="col-span-1">
                <MediaLibrary />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="published" 
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-[#10b981] rounded focus:ring-[#10b981]"
              />
              <label htmlFor="published" className="font-medium text-gray-700">Published</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">SEO & Metadata</h3>
            <Button type="button" variant="outline" size="sm" onClick={generateSEO} isLoading={isGeneratingSEO}>
              ✨ Auto-Generate SEO
            </Button>
          </div>
          <CardContent className="space-y-4 pt-4">
            <Input
              label="SEO Title"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                rows={2}
                value={formData.seoDesc}
                onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Personalisation Survey (Pain Points)</h3>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} disabled={questions.length >= 3}>
              + Add Question
            </Button>
          </div>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-500">
              Add up to 3 custom multiple-choice questions that users will be asked when they request a personalised version of this content.
            </p>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                <button 
                  type="button" 
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                <div className="mb-4 pr-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question {qIndex + 1}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded outline-none"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, e.target.value)}
                    placeholder="e.g. What is your biggest struggle with sugar?"
                  />
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-[#10b981]">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Options</label>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => addOption(qIndex)}
                    className="text-xs text-[#10b981] font-medium hover:underline mt-2 inline-block"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
                No custom questions added.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8 border-t pt-6">
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(true)}>👀 Live Preview</Button>
            <DeleteContentButton id={id} title={formData.title} redirectAfterDelete="/admin/content" />
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </div>
      </form>

      {/* Full Screen Live Preview */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Live Preview">
        <div className="max-h-[80vh] overflow-y-auto pt-4 border-t mt-2">
          <div className="max-w-4xl mx-auto pointer-events-none">
            {/* The pointer-events-none ensures buttons don't actually trigger downloads in preview */}
            <ContentDetailView content={{ ...formData, id: id || "preview" } as any} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
