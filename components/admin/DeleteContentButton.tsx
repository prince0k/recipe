"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteContentButtonProps {
  id: string;
  title: string;
  redirectAfterDelete?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DeleteContentButton({ 
  id, 
  title, 
  redirectAfterDelete,
  className = "",
  children
}: DeleteContentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (redirectAfterDelete) {
          router.push(redirectAfterDelete);
        }
        router.refresh();
      } else {
        alert("Failed to delete content.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (children) {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`disabled:opacity-50 transition-colors ${className}`}
        title={`Delete "${title}"`}
      >
        {isDeleting ? (
          <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block" />
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      isLoading={isDeleting}
      className={`ml-4 ${className}`}
    >
      <Trash2 className="w-4 h-4 mr-1.5" />
      Delete
    </Button>
  );
}

