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
  const { filteredNotes, isLoading, searchQuery, selectedCategoryId, viewMode } = useSelector((state: RootState) => state.notes);
  
  const { data, error, isLoading: queryLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes', { archived: false, search: searchQuery, categoryId: selectedCategoryId }],
    queryFn: async ({ queryKey }) => {
      const [_path, { archived, search, categoryId }] = queryKey as [string, { archived: boolean, search: string, categoryId: number | null }];
      const url = new URL('/api/notes', window.location.origin);
      url.searchParams.append('archived', String(archived));
      if (search) url.searchParams.append('search', search);
      if (categoryId) url.searchParams.append('categoryId', String(categoryId));
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
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 animate-pulse h-64">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4"></div>
              <div className="space-y-3 mt-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
              </div>
              <div className="mt-6 h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
              <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-1">
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return <EmptyState onCreateNote={handleCreateNote} />;
  }

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {/* Mobile Floating Action Button - only visible on mobile */}
      <div className="fixed right-8 bottom-8 md:hidden">
        <Button
          onClick={handleCreateNote}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-blue-300/50 dark:hover:shadow-blue-900/30"
        >
          <span className="material-icons">add</span>
        </Button>
      </div>
    </div>
  );
};

export default AllNotes;
