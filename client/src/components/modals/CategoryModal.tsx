import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { closeCategoryModal, setCategories } from '@/redux/notesSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertCategorySchema, type InsertCategory } from '@/types/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Extend with validation rules
const formSchema = insertCategorySchema.extend({
  name: insertCategorySchema.shape.name.min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
});

const CategoryModal = () => {
  const dispatch = useDispatch();
  const { isCategoryModalOpen } = useSelector((state: RootState) => state.notes);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCategory>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const createCategoryMutation = useMutation<any, Error, InsertCategory>({
    mutationFn: async (data: InsertCategory) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      
      // Reset the form
      form.reset();
      
      // Close the modal
      dispatch(closeCategoryModal());
      
      // Invalidate categories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  const handleFormSubmit = (data: InsertCategory) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <Dialog open={isCategoryModalOpen} onOpenChange={() => dispatch(closeCategoryModal())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your notes.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createCategoryMutation.isPending}
                className="relative"
              >
                {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;