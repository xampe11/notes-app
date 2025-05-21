import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeDeleteModal } from "@/redux/notesSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DeleteModal = () => {
  const dispatch = useDispatch();
  const { isDeleteModalOpen, noteToDelete } = useSelector((state: RootState) => state.notes);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Log note information for debugging
  console.log('Delete modal state:', { isOpen: isDeleteModalOpen, note: noteToDelete });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Use either Redux state or local backup to get note information
      const noteId = noteToDelete?.id || localNoteInfo?.id;
      const noteTitle = noteToDelete?.title || localNoteInfo?.title;
      const isArchived = noteToDelete?.archived || localNoteInfo?.archived;
      
      if (!noteId) {
        throw new Error('No note selected for deletion');
      }
      
      console.log('Deleting note with ID:', noteId, 'Archived:', isArchived, 'Title:', noteTitle);
      
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Make the DELETE request with proper authentication
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Handle different response status codes
        if (!response.ok) {
          let errorMessage = `Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If response is not JSON, try to get text
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          
          console.error('Delete response not OK:', response.status, errorMessage);
          throw new Error(`Failed to delete note: ${errorMessage}`);
        }
        
        // Try to parse as JSON, but handle if not JSON
        try {
          return {
            success: true,
            noteId,
            noteTitle,
            isArchived
          };
        } catch (e) {
          return { 
            success: true,
            noteId,
            noteTitle,
            isArchived
          };
        }
      } catch (error) {
        console.error('Error in delete mutation:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('Note deleted successfully, server response:', data);
      
      // Extract note info from successful response
      const { noteId, noteTitle, isArchived } = data;
      
      // Invalidate all notes queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      // Force immediate refetch of all notes queries
      queryClient.refetchQueries({ queryKey: ['/api/notes'] });
      
      toast({
        title: "Note deleted",
        description: noteTitle ? `"${noteTitle}" has been deleted successfully.` : "Note has been deleted successfully.",
      });
      
      // Close the modal
      dispatch(closeDeleteModal());
      
      // Handle archived view specific behavior
      if (isArchived && window.location.pathname.includes('/archived')) {
        setTimeout(() => {
          window.location.reload();
        }, 300); // Add a short delay before reload
      }
    },
    onError: (error: any) => {
      console.error('Error deleting note:', error);
      
      // Get a user-friendly error message
      let errorMessage = "There was an error deleting your note. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to delete note",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Close the modal even on error
      dispatch(closeDeleteModal());
    },
  });

  // Store note information locally to prevent state issues during deletion
  const [localNoteInfo, setLocalNoteInfo] = React.useState<{
    id?: number;
    title?: string;
    archived?: boolean;
  } | null>(null);
  
  // Update local note info when noteToDelete changes
  React.useEffect(() => {
    if (noteToDelete) {
      setLocalNoteInfo({
        id: noteToDelete.id,
        title: noteToDelete.title,
        archived: noteToDelete.archived,
      });
    }
  }, [noteToDelete]);
  
  const handleDelete = () => {
    // Use either the Redux state or our local backup
    if (noteToDelete?.id || localNoteInfo?.id) {
      console.log('Deleting note with id:', noteToDelete?.id || localNoteInfo?.id);
      deleteMutation.mutate();
    } else {
      console.error('No note selected for deletion');
      toast({
        title: "Error",
        description: "No note selected for deletion.",
        variant: "destructive"
      });
      dispatch(closeDeleteModal());
    }
  };

  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => !open && dispatch(closeDeleteModal())}>
      <AlertDialogContent className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4 text-red-500">
            <span className="material-icons text-4xl">error_outline</span>
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
            Delete Note
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-center">
            {(noteToDelete?.title || localNoteInfo?.title)
              ? `Are you sure you want to delete "${noteToDelete?.title || localNoteInfo?.title}"? This action cannot be undone.` 
              : "Are you sure you want to delete this note? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center space-x-3">
          <AlertDialogCancel className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;