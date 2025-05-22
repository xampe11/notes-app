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
  isListView?: boolean;
}

const NoteCard = ({ note, isListView = false }: NoteCardProps) => {
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

  if (isListView) {
    // List View Layout
    return (
      <Card className="note-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer w-full" onClick={handleCardClick}>
        <div className="p-4 flex flex-row items-center">
          <div className="flex-grow pr-4">
            <div className="flex items-center mb-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{note.title}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                {formatDate(note.updatedAt)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{note.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categories.length > 0 ? (
                categories.map(category => (
                  <Badge 
                    key={category.id}
                    variant="outline"
                    className="px-2 py-0.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    title={category.name}
                  >
                    {category.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500">No categories</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" 
              title="Edit"
              onClick={handleEdit}
            >
              <span className="material-icons text-sm">edit</span>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20" 
              title={note.archived ? "Unarchive" : "Archive"}
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              <span className="material-icons text-sm">{note.archived ? "unarchive" : "archive"}</span>
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" 
              title="Delete"
              onClick={handleDelete}
            >
              <span className="material-icons text-sm">delete</span>
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Grid View Layout (Default)
  return (
    <Card className="note-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer h-full" onClick={handleCardClick}>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2.5 line-clamp-1 text-lg">{note.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-4 flex-grow mb-3">{note.content}</p>
        <div className="mt-auto flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1.5 max-w-[180px] overflow-hidden">
          {categories.length > 0 ? (
            categories.map(category => (
              <Badge 
                key={category.id}
                variant="outline"
                className="px-2 py-0.5 text-xs whitespace-nowrap overflow-hidden text-ellipsis bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                title={category.name}
              >
                {category.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">No categories</span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" 
            title="Edit"
            onClick={handleEdit}
          >
            <span className="material-icons text-sm">edit</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20" 
            title={note.archived ? "Unarchive" : "Archive"}
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            <span className="material-icons text-sm">{note.archived ? "unarchive" : "archive"}</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" 
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
