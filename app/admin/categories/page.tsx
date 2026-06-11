"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Trash2, PlusCircle, ArrowLeft, FolderKanban, Image as ImageIcon, Loader2, Edit2, Check, X, Upload } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  tag: string;
  order: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState("0");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editOrder, setEditOrder] = useState("0");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingUploading, setIsEditingUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name in the "Add" form
  useEffect(() => {
    if (!editingId) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [name, editingId]);

  // Auto-generate slug from name in the "Edit" form
  useEffect(() => {
    if (editingId) {
      setEditSlug(
        editName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [editName, editingId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, forEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (forEdit) setIsEditingUploading(true);
    else setIsUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("type", "image");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      if (forEdit) {
        setEditImageUrl(json.url);
      } else {
        setImageUrl(json.url);
      }
    } catch (e) {
      alert("Failed to upload category image");
    } finally {
      if (forEdit) setIsEditingUploading(false);
      else setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          imageUrl: imageUrl || null,
          tag,
          order: parseInt(order) || 0,
        }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        setTag("");
        setImageUrl("");
        setOrder("0");
        fetchCategories();
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditTag(cat.tag);
    setEditImageUrl(cat.imageUrl || "");
    setEditOrder(cat.order.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editName,
          slug: editSlug,
          imageUrl: editImageUrl || null,
          tag: editTag,
          order: parseInt(editOrder) || 0,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCategories();
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this category? Recipes using this tag will no longer be filtered under this category card.")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all duration-200 group bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif flex items-center gap-3">
            Category Management
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage the categories displayed in the public recipe grid, set their cover images, search tags, and display order.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (Add or Edit) */}
        <div className="lg:col-span-1">
          {editingId ? (
            <Card className="border border-amber-200 shadow-md bg-white sticky top-6 ring-2 ring-amber-500/10">
              <div className="px-6 py-5 border-b border-slate-100 bg-amber-50/50">
                <h3 className="font-bold text-slate-900 font-serif text-lg flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-600" />
                  Edit Category
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Modify properties of an existing category</p>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleUpdate} className="space-y-5">
                  <Input
                    label="Category Name"
                    type="text"
                    placeholder="e.g. Desserts"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-amber-500"
                  />
                  <Input
                    label="Category Slug"
                    type="text"
                    placeholder="e.g. desserts"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-amber-500 bg-slate-50"
                  />
                  <Input
                    label="Target Tag (matches content.tags)"
                    type="text"
                    placeholder="e.g. sweet-treats"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-amber-500"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      Cover Image URL
                    </label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="/uploads/..."
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-amber-500 flex-grow"
                      />
                      <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-200 shrink-0 h-10 flex items-center justify-center">
                        {isEditingUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={isEditingUploading} />
                      </label>
                    </div>
                  </div>
                  <Input
                    label="Display Order (lower numbers show first)"
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-amber-500"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-all duration-200"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-shrink-0 px-4 border-slate-200 hover:bg-slate-50 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-100 shadow-sm bg-white sticky top-6">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-900 font-serif text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Add New Category
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Integrate a new recipe category option</p>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Category Name"
                    type="text"
                    placeholder="e.g. Drinks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                  />
                  <Input
                    label="Category Slug (auto-generated)"
                    type="text"
                    placeholder="e.g. drinks"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50"
                  />
                  <Input
                    label="Target Tag (matches content.tags)"
                    type="text"
                    placeholder="e.g. smoothie"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      Cover Image URL
                    </label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="e.g. /uploads/images/drinks.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 flex-grow"
                      />
                      <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 transition-all duration-200 shrink-0 h-10 flex items-center justify-center">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={isUploading} />
                      </label>
                    </div>
                  </div>
                  <Input
                    label="Display Order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FolderKanban className="w-4 h-4" />
                        Create Category
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 font-serif text-lg">Active Categories</h3>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
              {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} total
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500">Loading recipe categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🗂️
              </div>
              <h4 className="font-bold text-slate-800 font-serif text-base mb-1">No Categories Found</h4>
              <p className="text-sm text-slate-450 max-w-sm mx-auto">
                No categories have been defined yet. You can create your first category using the form on the left.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const initials = cat.name.slice(0, 2).toUpperCase();
                const isCurrentEditing = editingId === cat.id;

                return (
                  <Card key={cat.id} className={`border bg-white flex flex-col justify-between group overflow-hidden transition-all duration-300 ${
                    isCurrentEditing ? "border-amber-300 ring-2 ring-amber-100 shadow-lg scale-[1.01]" : "border-slate-100 hover:border-emerald-500/20 hover:shadow-lg"
                  }`}>
                    <div className="p-5 flex items-start gap-4">
                      {cat.imageUrl ? (
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-150 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 relative">
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
                          {initials}
                        </div>
                      )}
                      <div className="space-y-1 min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base truncate font-serif">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 border border-slate-200/50 font-bold">
                            Order: {cat.order}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          Slug: <span className="font-mono bg-slate-50 px-1 rounded border text-slate-600">{cat.slug}</span>
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          Tag: <span className="font-mono bg-slate-50 px-1 rounded border text-slate-600">{cat.tag}</span>
                        </p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(cat)}
                        disabled={isCurrentEditing}
                        className="text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-bold text-xs rounded-lg h-8 px-2.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Properties
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-500 hover:text-red-750 hover:bg-red-50/60 transition-colors flex items-center gap-1.5 font-bold text-xs rounded-lg h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
