import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { openDeleteModal, openNoteModal, setCurrentNote } from "@/redux/notesSlice";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/types/schema";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', `/api/notes/${note.id}/archive`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: note.archived ? "Note unarchived" : "Note archived",
        description: `"${note.title}" has been ${note.archived ? "unarchived" : "archived"} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Action failed",
        description: `Failed to ${note.archived ? "unarchive" : "archive"} note.`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setCurrentNote(note));
    dispatch(openNoteModal(true));
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveMutation.mutate();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openDeleteModal(note));
  };

  const handleCardClick = () => {
    dispatch(setCurrentNote(note));
    dispatch(openNoteModal(true));
  };

  return (
    <Card className="note-card bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleCardClick}>
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-4">{note.content}</p>
        <div className="mt-3 flex items-center">
          <span className="text-xs text-gray-500">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div>
          {/* Tags would go here if implemented */}
        </div>
        <div className="flex space-x-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="p-1.5 text-gray-500 hover:text-primary rounded-full hover:bg-blue-50" 
            title="Edit"
            onClick={handleEdit}
          >
            <span className="material-icons text-sm">edit</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="p-1.5 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-yellow-50" 
            title={note.archived ? "Unarchive" : "Archive"}
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            <span className="material-icons text-sm">{note.archived ? "unarchive" : "archive"}</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50" 
            title="Delete"
            onClick={handleDelete}
          >
            <span className="material-icons text-sm">delete</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
