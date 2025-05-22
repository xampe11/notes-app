import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeNoteModal } from "@/redux/notesSlice";
import NoteForm from "@/components/notes/NoteForm";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Note, InsertNote, Category } from "@/types/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NoteModal = () => {
  const dispatch = useDispatch();
  const { isNoteModalOpen, currentNote, isEditMode } = useSelector((state: RootState) => state.notes);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      return await apiRequest('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
      dispatch(closeNoteModal());
    },
    onError: () => {
      toast({
        title: "Failed to create note",
        description: "There was an error creating your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: number; note: Partial<Note> }) => {
      return await apiRequest(`/api/notes/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.note)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      dispatch(closeNoteModal());
    },
    onError: () => {
      toast({
        title: "Failed to update note",
        description: "There was an error updating your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get note categories if editing an existing note
  const { data: noteCategories = [] } = useQuery({
    queryKey: ['/api/notes', currentNote?.id, 'categories'],
    queryFn: async () => {
      if (!currentNote?.id) return [];
      const response = await fetch(`/api/notes/${currentNote.id}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch note categories');
      }
      return response.json();
    },
    enabled: !!currentNote?.id,
  });

  const handleFormSubmit = async (data: InsertNote & { categories?: number[] }) => {
    try {
      // First create or update the note
      let noteResponse;
      if (currentNote?.id) {
        // Update existing note
        const { categories: categoryIds, ...noteData } = data;
        noteResponse = await updateNoteMutation.mutateAsync({ id: currentNote.id, note: noteData });

        // Handle categories if they exist
        if (categoryIds && categoryIds.length > 0) {
          // Clear existing categories and add new ones
          for (const categoryId of categoryIds) {
            await fetch(`/api/notes/${currentNote.id}/categories/${categoryId}`, {
              method: 'POST',
            });
          }
        }
      } else {
        // Create new note
        const { categories: categoryIds, ...noteData } = data;
        noteResponse = await createNoteMutation.mutateAsync(noteData);

        // Handle categories if they exist
        if (categoryIds && categoryIds.length > 0 && noteResponse.id) {
          // Add categories to the new note
          for (const categoryId of categoryIds) {
            await fetch(`/api/notes/${noteResponse.id}/categories/${categoryId}`, {
              method: 'POST',
            });
          }
        }
      }

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      // Show success message
      toast({
        title: currentNote?.id ? "Note updated" : "Note created",
        description: currentNote?.id 
          ? "Your note has been updated successfully." 
          : "Your note has been created successfully.",
      });
      
      // Close the modal
      dispatch(closeNoteModal());
    } catch (error) {
      toast({
        title: currentNote?.id ? "Failed to update note" : "Failed to create note",
        description: "There was an error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    dispatch(closeNoteModal());
  };

  return (
    <Dialog open={isNoteModalOpen} onOpenChange={(open) => !open && dispatch(closeNoteModal())}>
      <DialogContent className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex-1 overflow-y-auto">
          <NoteForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            defaultValues={currentNote || undefined}
            noteCategories={noteCategories}
            isSubmitting={createNoteMutation.isPending || updateNoteMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
