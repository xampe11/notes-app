import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { insertNoteSchema } from "@/types/schema";
import type { Note, Category } from "@/types/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Extend with validation rules
const formSchema = insertNoteSchema.extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface NoteFormProps {
  onSubmit: (data: FormValues & { categories?: number[] }) => void;
  onCancel: () => void;
  defaultValues?: Partial<Note>;
  noteCategories?: Category[];
  isSubmitting: boolean;
}

const NoteForm = ({ onSubmit, onCancel, defaultValues, noteCategories = [], isSubmitting }: NoteFormProps) => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState("");

  // Fetch all categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  // Fetch note categories if editing an existing note
  const { data: noteSpecificCategories = [] } = useQuery<Category[]>({
    queryKey: ['/api/notes', defaultValues?.id, 'categories'],
    queryFn: async () => {
      if (!defaultValues?.id) return [];
      const response = await fetch(`/api/notes/${defaultValues.id}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch note categories');
      }
      return response.json();
    },
    enabled: !!defaultValues?.id,
  });

  // Set selected categories when editing a note
  useEffect(() => {
    if (noteSpecificCategories.length > 0) {
      setSelectedCategories(noteSpecificCategories);
    }
  }, [noteSpecificCategories]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || "",
      archived: defaultValues?.archived || false,
    },
  });

  // Filter categories based on input
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categoryInput.toLowerCase()) &&
    !selectedCategories.some(selected => selected.id === category.id)
  );

  const handleAddCategory = (category: Category) => {
    setSelectedCategories(prev => [...prev, category]);
    setCategoryInput("");
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const handleSubmitWithCategories = (data: FormValues) => {
    onSubmit({
      ...data,
      categories: selectedCategories.map(cat => cat.id)
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithCategories)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Note title" 
                  {...field} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Start typing your note content here..." 
                  rows={12}
                  {...field} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories Section */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Categories</label>
          
          {/* Selected Categories */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCategories.length > 0 ? (
              selectedCategories.map(category => (
                <Badge 
                  key={category.id}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  {category.name}
                  <button 
                    type="button"
                    onClick={() => handleRemoveCategory(category.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500 italic">No categories selected</span>
            )}
          </div>
          
          {/* Category Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search or select a category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
            />
            
            {/* Category Dropdown */}
            {categoryInput && filteredCategories.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                <ul className="py-1">
                  {filteredCategories.map(category => (
                    <li 
                      key={category.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAddCategory(category)}
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isSubmitting ? "Saving..." : defaultValues?.id ? "Update Note" : "Save Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NoteForm;
