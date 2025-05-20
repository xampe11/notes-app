import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setNotes, setLoading, setError, openNoteModal } from "@/redux/notesSlice";
import { useQuery } from "@tanstack/react-query";
import NoteCard from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/button";
import EmptyState from "./EmptyState";
import type { Note } from "@/types/schema";

const AllNotes = () => {
  const dispatch = useDispatch();
  const { filteredNotes, isLoading, searchQuery } = useSelector((state: RootState) => state.notes);
  
  const { data, error, isLoading: queryLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes', { archived: false, search: searchQuery }],
    queryFn: async ({ queryKey }) => {
      const [_path, { archived, search }] = queryKey as [string, { archived: boolean, search: string }];
      const url = new URL('/api/notes', window.location.origin);
      url.searchParams.append('archived', String(archived));
      if (search) url.searchParams.append('search', search);
      const response = await fetch(url.toString(), { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      return response.json();
    }
  });

  useEffect(() => {
    dispatch(setLoading(queryLoading));
    
    if (error) {
      dispatch(setError((error as Error).message));
    }
    
    if (data) {
      dispatch(setNotes(data));
    }
  }, [data, error, queryLoading, dispatch]);

  const handleCreateNote = () => {
    dispatch(openNoteModal(false));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse h-48">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return <EmptyState onCreateNote={handleCreateNote} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredNotes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}

      {/* Floating Action Button (Mobile) */}
      <div className="fixed right-6 bottom-6 md:hidden">
        <Button
          onClick={handleCreateNote}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <span className="material-icons">add</span>
        </Button>
      </div>
    </div>
  );
};

export default AllNotes;
