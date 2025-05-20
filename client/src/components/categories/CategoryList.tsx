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
        <h3 className="text-sm font-medium flex items-center gap-1">
          <Tag size={16} />
          Categories
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={() => dispatch(openCategoryModal())}
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet</p>
        ) : (
          categories.map((category: Category) => (
            <Badge 
              key={category.id}
              variant={selectedCategoryId === category.id ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
              <button 
                className="ml-1 hover:text-destructive"
                onClick={(e) => handleDeleteCategory(e, category.id)}
              >
                <X size={12} />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryList;