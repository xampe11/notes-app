import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Note, Category } from '../types/schema';

interface NotesState {
  notes: Note[];
  filteredNotes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  currentNote: Note | null;
  isNoteModalOpen: boolean;
  isDeleteModalOpen: boolean;
  noteToDelete: Note | null; // Track note to delete
  isEditMode: boolean;
  categories: Category[];
  selectedCategoryId: number | null;
  isCategoryModalOpen: boolean;
  viewMode: 'grid' | 'list'; // Track the current view mode
}

const initialState: NotesState = {
  notes: [],
  filteredNotes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  currentNote: null,
  isNoteModalOpen: false,
  isDeleteModalOpen: false,
  noteToDelete: null,
  isEditMode: false,
  categories: [],
  selectedCategoryId: null,
  isCategoryModalOpen: false,
  viewMode: 'grid', // Default to grid view
};

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
      state.filteredNotes = state.searchQuery 
        ? state.notes.filter(note => 
            note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
            note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
          )
        : state.notes;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredNotes = action.payload
        ? state.notes.filter(note => 
            note.title.toLowerCase().includes(action.payload.toLowerCase()) || 
            note.content.toLowerCase().includes(action.payload.toLowerCase())
          )
        : state.notes;
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
    openNoteModal: (state, action: PayloadAction<boolean>) => {
      state.isNoteModalOpen = true;
      state.isEditMode = action.payload;
    },
    closeNoteModal: (state) => {
      state.isNoteModalOpen = false;
      state.currentNote = null;
    },
    openDeleteModal: (state, action: PayloadAction<Note>) => {
      console.log('Opening delete modal with note:', action.payload);
      state.noteToDelete = action.payload;
      state.isDeleteModalOpen = true;
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.noteToDelete = null;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setSelectedCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      
      // Filter notes based on category if one is selected
      if (action.payload === null) {
        // Reset filtered notes to all notes, respecting search query
        state.filteredNotes = state.searchQuery 
          ? state.notes.filter(note => 
              note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
              note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          : state.notes;
      }
    },
    openCategoryModal: (state) => {
      state.isCategoryModalOpen = true;
    },
    closeCategoryModal: (state) => {
      state.isCategoryModalOpen = false;
    },
    // Toggle between grid and list view modes
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
  },
});

export const {
  setNotes,
  setLoading,
  setError,
  setSearchQuery,
  setCurrentNote,
  openNoteModal,
  closeNoteModal,
  openDeleteModal,
  closeDeleteModal,
  setCategories,
  setSelectedCategoryId,
  openCategoryModal,
  closeCategoryModal,
  setViewMode,
} = notesSlice.actions;

export default notesSlice.reducer;
