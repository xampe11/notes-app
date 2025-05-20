import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Note } from '@shared/schema';

interface NotesState {
  notes: Note[];
  filteredNotes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  currentNote: Note | null;
  isNoteModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isEditMode: boolean;
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
  isEditMode: false,
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
      state.isDeleteModalOpen = true;
      state.currentNote = action.payload;
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.currentNote = null;
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
} = notesSlice.actions;

export default notesSlice.reducer;
