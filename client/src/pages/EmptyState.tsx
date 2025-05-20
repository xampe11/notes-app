import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateNote: () => void;
}

const EmptyState = ({ onCreateNote }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="text-gray-400 mb-4">
        <span className="material-icons text-6xl">note_alt</span>
      </div>
      <h3 className="text-xl font-medium text-gray-600 mb-2">No notes yet</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Create your first note by clicking the "New Note" button.
      </p>
      <Button 
        onClick={onCreateNote}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
      >
        <span className="material-icons mr-2">add</span>
        New Note
      </Button>
    </div>
  );
};

export default EmptyState;
