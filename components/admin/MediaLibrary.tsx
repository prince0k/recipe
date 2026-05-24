"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface UploadedMedia {
  url: string;
  type: "image" | "video";
}

export function MediaLibrary() {
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    } catch (e) {
      console.error("Failed to fetch media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    const isVideo = file.type.startsWith("video/");
    formData.append("type", isVideo ? "video" : "image");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      // Refresh the list
      await fetchMedia();
    } catch (error) {
      console.error(error);
      alert("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };

  const copySnippet = (media: UploadedMedia) => {
    let snippet = "";
    if (media.type === "image") {
      snippet = `<img src="${media.url}" alt="Uploaded image" class="w-full h-auto rounded-lg my-4 shadow-md" />`;
    } else {
      snippet = `<video src="${media.url}" controls preload="metadata" playsinline class="w-full rounded-lg my-4 shadow-md"></video>`;
    }

    navigator.clipboard.writeText(snippet);
    alert("HTML snippet copied to clipboard! Paste it anywhere in the body text.");
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sticky top-24">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Media Library</h3>
      
      <div className="mb-6">
        <label className="block w-full cursor-pointer text-center px-4 py-8 border-2 border-dashed border-[#10b981] bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors">
          <span className="text-[#10b981] font-medium">
            {isUploading ? "Uploading..." : "Click to Upload Image/Video"}
          </span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,video/mp4,video/webm" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
        <p className="text-xs text-gray-500 text-center mt-2">Images will be auto-optimized to WebP</p>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {uploads.map((media, i) => (
          <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            {media.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.url} alt="Uploaded" className="w-full h-32 object-cover rounded mb-3 bg-gray-100" />
            ) : (
              <video src={media.url} preload="none" muted className="w-full h-32 object-cover rounded mb-3 bg-gray-100" />
            )}
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => copySnippet(media)}
            >
              Copy HTML Code
            </Button>
          </div>
        ))}
        
        {uploads.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-4">
            Upload media to get HTML snippets
          </div>
        )}
      </div>
    </div>
  );
}
