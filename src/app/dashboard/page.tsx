"use client";

import { useState, FormEvent, useEffect } from "react";
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
import { Plus, Pencil, Trash2, Shirt, Tag, Camera, Upload } from "lucide-react";

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

const ClothingCategory = [
  "SHIRT",
  "PANTS",
  "SHOES",
  "JACKET",
  "ACCESSORY",
  "OTHER",
];

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // State for the modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addCaptureMode, setAddCaptureMode] = useState<"file" | "camera">("file");
  const [editCaptureMode, setEditCaptureMode] = useState<"file" | "camera">("file");

  // Custom hooks for data fetching and mutations
  const { data: clothingItems = [], isLoading } = useClothingItems();
  const addMutation = useAddClothingItem();
  const updateMutation = useUpdateClothingItem();
  const deleteMutation = useDeleteClothingItem();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addMutation.mutate(formData, {
      onSuccess: () => {
        (event.target as HTMLFormElement).reset();
        setIsAddModalOpen(false);
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setImagePreview(item.imageUrl ?? null);
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

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-blue-600/20 transition-all">
                  <Plus className="w-4 h-4" /> Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Clothing</DialogTitle>
                  <DialogDescription>
                    Add a new item to your digital wardrobe.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleAddItem}
                  className="flex flex-col gap-4 py-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      name="name"
                      placeholder="e.g., Blue Denim Jacket"
                      required
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select name="category" required>
                        <SelectTrigger className="bg-white dark:bg-slate-950">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ClothingCategory.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0) +
                                category.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <Input
                        name="color"
                        placeholder="e.g., Blue"
                        required
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand</label>
                    <Input
                      name="brand"
                      placeholder="e.g., Levi's"
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image</label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={addCaptureMode === "file" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAddCaptureMode("file")}
                        className={addCaptureMode === "file" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        <Upload className="w-4 h-4 mr-1" /> Upload
                      </Button>
                      <Button
                        type="button"
                        variant={addCaptureMode === "camera" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAddCaptureMode("camera")}
                        className={addCaptureMode === "camera" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        <Camera className="w-4 h-4 mr-1" /> Camera
                      </Button>
                    </div>
                    <Input
                      type="file"
                      name="image"
                      accept="image/*"
                      capture={addCaptureMode === "camera" ? "environment" : undefined}
                      key={addCaptureMode}
                      className="bg-white dark:bg-slate-950 cursor-pointer"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Item
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

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
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clothing Item</DialogTitle>
            <DialogDescription>
              Make changes to your item here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateItem}
            className="flex flex-col gap-4 py-4"
          >
            <Input
              name="name"
              defaultValue={selectedItem?.name}
              placeholder="Item Name"
              required
            />
            <Select
              name="category"
              defaultValue={selectedItem?.category}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ClothingCategory.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="color"
              defaultValue={selectedItem?.color}
              placeholder="Color"
              required
            />
            <Input
              name="brand"
              defaultValue={selectedItem?.brand ?? ""}
              placeholder="Brand"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={editCaptureMode === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditCaptureMode("file")}
                  className={editCaptureMode === "file" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
                <Button
                  type="button"
                  variant={editCaptureMode === "camera" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditCaptureMode("camera")}
                  className={editCaptureMode === "camera" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Camera className="w-4 h-4 mr-1" /> Camera
                </Button>
              </div>
              <Input
                type="file"
                name="image"
                accept="image/*"
                capture={editCaptureMode === "camera" ? "environment" : undefined}
                key={editCaptureMode}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </div>
            {imagePreview && (
              <Image
                src={getImageUrl(imagePreview)}
                alt="Image Preview"
                width={100}
                height={100}
              />
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
