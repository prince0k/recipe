"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";

interface DeleteContentButtonProps {
  id: string;
  title: string;
  redirectAfterDelete?: string;
}

export function DeleteContentButton({ id, title, redirectAfterDelete }: DeleteContentButtonProps) {
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


  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      isLoading={isDeleting}
      className="ml-4"
    >
      Delete
    </Button>
  );
}
