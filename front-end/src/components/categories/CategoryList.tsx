import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  setCategories, 
  setSelectedCategoryId, 
  openCategoryModal 
} from '@/redux/notesSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Plus, 
  X 
} from 'lucide-react';
import type { Category } from '@/types/schema';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategoryId } = useSelector((state: RootState) => state.notes);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      dispatch(setCategories(data));
    }
  }, [data, dispatch]);

  // Delete category mutation
  const deleteCategoryMutation = useMutation<any, Error, number>({
    mutationFn: async (categoryId: number) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      
      // Reset selected category if it was the one deleted
      if (selectedCategoryId) {
        dispatch(setSelectedCategoryId(null));
      }
      
      // Invalidate categories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });

  const handleCategoryClick = (categoryId: number) => {
    // Toggle selection if clicking on already selected category
    if (selectedCategoryId === categoryId) {
      dispatch(setSelectedCategoryId(null));
    } else {
      dispatch(setSelectedCategoryId(categoryId));
    }
  };

  const handleDeleteCategory = (e: React.MouseEvent, categoryId: number) => {
    e.stopPropagation();
    deleteCategoryMutation.mutate(categoryId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
          <Tag size={16} className="text-blue-600 dark:text-blue-400" />
          Categories
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
          onClick={() => dispatch(openCategoryModal())}
          title="Add category"
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No categories yet</p>
        ) : (
          categories.map((category: Category) => (
            <div 
              key={category.id}
              className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all duration-200 flex items-center ${
                selectedCategoryId === category.id 
                  ? "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800" 
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
              <button 
                className={`ml-1.5 rounded-full p-0.5 transition-colors ${
                  selectedCategoryId === category.id
                    ? "hover:bg-blue-200 text-blue-700 dark:hover:bg-blue-800 dark:text-blue-400"
                    : "hover:bg-gray-200 text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400"
                }`}
                onClick={(e) => handleDeleteCategory(e, category.id)}
                title="Remove category"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryList;