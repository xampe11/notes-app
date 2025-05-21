import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { openDeleteModal, openNoteModal, setCurrentNote } from "@/redux/notesSlice";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/formatDate";
import { useToast } from "@/hooks/use-toast";
import type { Note, Category } from "@/types/schema";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch categories for this note
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/notes', note.id, 'categories'],
    queryFn: async () => {
      const response = await fetch(`/api/notes/${note.id}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch note categories');
      }
      return response.json();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/notes/${note.id}/archive`, {
        method: 'PATCH'
      });
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

  // Direct delete functionality using the API
  const directDeleteMutation = useMutation({
    mutationFn: async () => {
      console.log('Directly deleting note with ID:', note.id, 'Archived:', note.archived);
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make delete request
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete note: ${response.status} ${errorText}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Update UI
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.refetchQueries({ queryKey: ['/api/notes'] });
      
      // Show success message
      toast({
        title: "Note deleted",
        description: `"${note.title}" has been deleted successfully.`,
      });
      
      // Refresh page if in archived view
      if (note.archived && window.location.pathname.includes('/archived')) {
        setTimeout(() => window.location.reload(), 300);
      }
    },
    onError: (error: any) => {
      console.error('Error deleting note:', error);
      toast({
        title: "Failed to delete note",
        description: error instanceof Error ? error.message : "There was an error deleting your note. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Use the custom dialog by dispatching action with the complete note object
    console.log('Dispatching openDeleteModal with note:', note);
    dispatch(openDeleteModal({...note}));
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
        <div className="flex flex-wrap gap-1 max-w-[150px] overflow-hidden">
          {categories.length > 0 ? (
            categories.map(category => (
              <Badge 
                key={category.id}
                variant="outline"
                className="px-1.5 py-0.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                title={category.name}
              >
                {category.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">No categories</span>
          )}
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
