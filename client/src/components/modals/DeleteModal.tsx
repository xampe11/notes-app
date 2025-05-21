import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeDeleteModal } from "@/redux/notesSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!noteToDelete?.id) return;
      console.log('Deleting note with ID:', noteToDelete.id, 'Archived:', noteToDelete.archived);
      return await apiRequest(`/api/notes/${noteToDelete.id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      console.log('Note deleted successfully, invalidating queries');
      
      // Invalidate all notes queries
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      // Force immediate refetch of all notes queries
      queryClient.refetchQueries({ queryKey: ['/api/notes'] });
      
      // For archived notes, we need special handling
      if (noteToDelete?.archived) {
        console.log('Deleted an archived note, forcing UI refresh');
        
        // Force a refetch of the archived notes specifically
        queryClient.invalidateQueries({ 
          queryKey: ['/api/notes', { archived: true }] 
        });
        
        // Force a page reload for archived view to ensure UI updates correctly
        if (window.location.pathname.includes('/archived')) {
          window.location.reload();
        }
      }
      
      toast({
        title: "Note deleted",
        description: noteToDelete ? `"${noteToDelete.title}" has been deleted successfully.` : "Note has been deleted successfully.",
      });
      
      // Close the modal
      dispatch(closeDeleteModal());
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast({
        title: "Failed to delete note",
        description: "There was an error deleting your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
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
            Are you sure you want to delete this note? This action cannot be undone.
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
