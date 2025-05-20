import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { closeNoteModal } from "@/redux/notesSlice";
import NoteForm from "@/components/notes/NoteForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Note, InsertNote } from "@shared/schema";
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
      const res = await apiRequest('POST', '/api/notes', data);
      return res.json();
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
      const res = await apiRequest('PUT', `/api/notes/${data.id}`, data.note);
      return res.json();
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

  const handleFormSubmit = (data: InsertNote) => {
    if (currentNote?.id) {
      updateNoteMutation.mutate({ id: currentNote.id, note: data });
    } else {
      createNoteMutation.mutate(data);
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
            isSubmitting={createNoteMutation.isPending || updateNoteMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
