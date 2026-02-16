"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  useClothingItems,
  useAddClothingItem,
  useUpdateClothingItem,
  useDeleteClothingItem,
} from "@/hooks/clothing";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Shirt, Tag, Camera, Upload, Loader2 } from "lucide-react";
import { ClothingFilterBar } from "@/components/clothing/ClothingFilterBar";
import { useClothingFilters } from "@/hooks/clothing/useClothingFilters";
import {
  CLOTHING_CATEGORIES,
  COMMON_COLORS,
  COLOR_HEX_MAP,
  formatCategory,
} from "@/lib/constants";

// Define the type for a clothing item based on your schema
export interface ClothingItem {
  // --- Campos de Mongoose/MongoDB ---
  _id: string; // Identificador único de MongoDB (ObjectId serializado a string)
  __v: number; // Número de versión de Mongoose

  // --- Campos de Mongoose (Timestamps) ---
  createdAt: string; // Fecha de creación (Mongoose Date serializado a string ISO 8601)
  updatedAt: string; // Fecha de última actualización (Mongoose Date serializado a string ISO 8601)

  // --- Campos de la Aplicación ---
  name: string;
  brand: string;
  category: "SHIRT" | "PANTS" | "SHOES" | "JACKET" | "ACCESSORY" | "OTHER"; // Puedes usar uniones literales si tienes un `enum` en Mongoose, si no, usa solo string.
  color: string;
  imageUrl: string;
  owner: string; // Referencia al ObjectId del usuario (serializado a string)

  // Agrega aquí cualquier otro campo que tu esquema de Mongoose tenga
  // Ejemplo:
  // size: string;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // State for the modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [hasAddImage, setHasAddImage] = useState(false);
  const [hasEditImage, setHasEditImage] = useState(false);
  const [addCategory, setAddCategory] = useState("");
  const [addColor, setAddColor] = useState("");

  // Detect device type and set initial capture mode
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [addCaptureMode, setAddCaptureMode] = useState<"file" | "camera">(isMobile ? "camera" : "file");
  const [editCaptureMode, setEditCaptureMode] = useState<"file" | "camera">(isMobile ? "camera" : "file");

  // Refs for file inputs
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const {
    filters,
    debouncedFilters,
    updateFilter,
    clearFilters,
    removeFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useClothingFilters();

  // Custom hooks for data fetching and mutations
  const { data: clothingItems = [], isLoading } = useClothingItems(debouncedFilters);
  const addMutation = useAddClothingItem();
  const updateMutation = useUpdateClothingItem();
  const deleteMutation = useDeleteClothingItem();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (addImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(addImagePreview);
      }
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [addImagePreview, imagePreview]);

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addMutation.mutate(formData, {
      onSuccess: () => {
        (event.target as HTMLFormElement).reset();
        setAddImagePreview(null);
        setHasAddImage(false);
        setAddCategory("");
        setAddColor("");
        setIsAddModalOpen(false);
      },
    });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        },
      });
    }
  };

  const handleEditClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setImagePreview(item.imageUrl ?? null);
    setHasEditImage(!!item.imageUrl);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(event.currentTarget);
    updateMutation.mutate(
      { id: selectedItem._id, formData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          setImagePreview(null);
          setHasEditImage(false);
        },
      }
    );
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.svg"; // Retorna un marcador de posición si la ruta es nula
    
    // Si la ruta es una URL de tipo blob (para previsualizaciones locales), úsala directamente
    if (path.startsWith("blob:")) {
      return path;
    }

    // Si la ruta ya es una URL completa de Cloudinary, úsala directamente
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Esta parte es para rutas heredadas y puede eliminarse si todas las rutas son absolutas
    const staticBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");
    return `${staticBaseUrl}${path}`;
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  console.log("RopaBase Dashboard loaded");
  console.log("Clothing items:", clothingItems);

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950 pointer-events-none"></div>

        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Your Wardrobe
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your clothing collection
              </p>
            </div>

            <Dialog
              open={isAddModalOpen}
              onOpenChange={(isOpen) => {
                setIsAddModalOpen(isOpen);
                if (!isOpen) {
                  setAddImagePreview(null);
                  setHasAddImage(false);
                  setAddCaptureMode(isMobile ? "camera" : "file");
                  setAddCategory("");
                  setAddColor("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-blue-600/20 transition-all">
                  <Plus className="w-4 h-4" /> Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Add New Clothing</DialogTitle>
                  <DialogDescription>
                    Add a new item to your digital wardrobe.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleAddItem}
                  className="flex flex-col gap-5 py-4 overflow-y-auto flex-1"
                >
                  {/* Image First */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center block">
                      Image *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={addCaptureMode === "file" ? "default" : "outline"}
                        size="lg"
                        onClick={() => {
                          setAddCaptureMode("file");
                          setTimeout(() => addFileInputRef.current?.click(), 100);
                        }}
                        className={`h-12 ${addCaptureMode === "file" ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        disabled={addMutation.isPending}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant={addCaptureMode === "camera" ? "default" : "outline"}
                        size="lg"
                        onClick={() => {
                          setAddCaptureMode("camera");
                          setTimeout(() => addFileInputRef.current?.click(), 100);
                        }}
                        className={`h-12 ${addCaptureMode === "camera" ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        disabled={addMutation.isPending}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Camera
                      </Button>
                    </div>
                    <Input
                      ref={addFileInputRef}
                      type="file"
                      name="image"
                      accept="image/*"
                      capture={addCaptureMode === "camera" ? "environment" : undefined}
                      key={addCaptureMode}
                      className="hidden"
                      disabled={addMutation.isPending}
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAddImagePreview(URL.createObjectURL(e.target.files[0]));
                          setHasAddImage(true);
                        } else {
                          setHasAddImage(false);
                        }
                      }}
                    />
                  </div>
                  {addImagePreview && (
                    <div className="space-y-2.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center block">
                        Preview
                      </label>
                      <div className="flex justify-center">
                        <div className="relative w-48 h-48 rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={getImageUrl(addImagePreview)}
                            alt="Image Preview"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Fields - only show if image is selected */}
                  {hasAddImage && (
                    <>
                      <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Name *
                        </label>
                        <Input
                          name="name"
                          placeholder="e.g., Blue Denim Jacket"
                          required
                          className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                          disabled={addMutation.isPending}
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Category *
                        </label>
                        <input type="hidden" name="category" value={addCategory} />
                        <div className="flex flex-wrap gap-2">
                          {CLOTHING_CATEGORIES.map((cat) => {
                            const isSelected = addCategory === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setAddCategory(isSelected ? "" : cat)}
                                aria-pressed={isSelected}
                                disabled={addMutation.isPending}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                              >
                                {formatCategory(cat)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Color *
                        </label>
                        <Select
                          name="color"
                          value={addColor}
                          onValueChange={setAddColor}
                          disabled={addMutation.isPending}
                        >
                          <SelectTrigger className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_COLORS.map((color) => (
                              <SelectItem key={color} value={color}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-3 h-3 rounded-full inline-block ${
                                      color === "White" || color === "Beige" || color === "Yellow"
                                        ? "border border-slate-300 dark:border-slate-600"
                                        : ""
                                    }`}
                                    style={{ backgroundColor: COLOR_HEX_MAP[color] }}
                                  />
                                  {color}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Brand
                        </label>
                        <Input
                          name="brand"
                          placeholder="e.g., Levi's"
                          className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                          disabled={addMutation.isPending}
                        />
                      </div>
                    </>
                  )}

                  <DialogFooter className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                      disabled={addMutation.isPending || !hasAddImage || !addCategory || !addColor}
                    >
                      {addMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Item"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter Bar */}
          <ClothingFilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onRemoveFilter={removeFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
          />

          {clothingItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {clothingItems.map((item: ClothingItem) => (
                <Card
                  key={item._id}
                  className="group overflow-hidden border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-600">
                        <Shirt className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 dark:bg-slate-950/90 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/10">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3
                        className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <div
                          className="w-2 h-2 rounded-full border border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: item.color.toLowerCase() }}
                        ></div>
                        {item.color}
                      </div>
                      {item.brand && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3" />
                          {item.brand}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Shirt className="w-8 h-8 text-slate-400" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No items match your filters
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="gap-2"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Your wardrobe is empty
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                    Start building your digital closet by adding your first clothing
                    item.
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add First Item
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) {
            setImagePreview(null);
            setHasEditImage(false);
            setEditCaptureMode(isMobile ? "camera" : "file");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Clothing Item</DialogTitle>
            <DialogDescription>
              Make changes to your item here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateItem}
            className="flex flex-col gap-5 py-4 overflow-y-auto flex-1"
          >
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <Input
                name="name"
                defaultValue={selectedItem?.name}
                placeholder="Item Name"
                required
                className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <input type="hidden" name="category" value={selectedItem?.category ?? ""} />
              <div className="flex flex-wrap gap-2">
                {CLOTHING_CATEGORIES.map((cat) => {
                  const isSelected = selectedItem?.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedItem((prev) =>
                          prev ? { ...prev, category: cat } : prev
                        )
                      }
                      aria-pressed={isSelected}
                      disabled={updateMutation.isPending}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {formatCategory(cat)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Color *
              </label>
              <Select
                name="color"
                value={selectedItem?.color ?? ""}
                onValueChange={(value) =>
                  setSelectedItem((prev) =>
                    prev ? { ...prev, color: value } : prev
                  )
                }
                disabled={updateMutation.isPending}
              >
                <SelectTrigger className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full inline-block ${
                            color === "White" || color === "Beige" || color === "Yellow"
                              ? "border border-slate-300 dark:border-slate-600"
                              : ""
                          }`}
                          style={{ backgroundColor: COLOR_HEX_MAP[color] }}
                        />
                        {color}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Brand
              </label>
              <Input
                name="brand"
                defaultValue={selectedItem?.brand ?? ""}
                placeholder="Brand"
                className="h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center block">Image</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={editCaptureMode === "file" ? "default" : "outline"}
                  size="lg"
                  onClick={() => {
                    setEditCaptureMode("file");
                    setTimeout(() => editFileInputRef.current?.click(), 100);
                  }}
                  className={`h-12 ${editCaptureMode === "file" ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  disabled={updateMutation.isPending}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant={editCaptureMode === "camera" ? "default" : "outline"}
                  size="lg"
                  onClick={() => {
                    setEditCaptureMode("camera");
                    setTimeout(() => editFileInputRef.current?.click(), 100);
                  }}
                  className={`h-12 ${editCaptureMode === "camera" ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  disabled={updateMutation.isPending}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </Button>
              </div>
              <Input
                ref={editFileInputRef}
                type="file"
                name="image"
                accept="image/*"
                capture={editCaptureMode === "camera" ? "environment" : undefined}
                key={editCaptureMode}
                className="hidden"
                disabled={updateMutation.isPending}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                    setHasEditImage(true);
                  } else {
                    // If cleared, check if there's an original image
                    setHasEditImage(!!selectedItem?.imageUrl);
                  }
                }}
              />
            </div>
            {imagePreview && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">Preview</label>
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={getImageUrl(imagePreview)}
                      alt="Image Preview"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || !hasEditImage || !selectedItem?.category || !selectedItem?.color}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
