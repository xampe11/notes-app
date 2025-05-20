import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { openNoteModal } from '@/redux/notesSlice';
import CategoryList from '@/components/categories/CategoryList';

const Sidebar = () => {
  const [location] = useLocation();
  const dispatch = useDispatch();
  
  const navItems = [
    {
      id: 'all-notes',
      link: '/',
      icon: 'description',
      label: 'All Notes'
    },
    {
      id: 'archived',
      link: '/archived',
      icon: 'archive',
      label: 'Archived'
    }
  ];

  const handleNewNote = () => {
    dispatch(openNoteModal(false));
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 hidden md:block transition-all duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="material-icons mr-2 text-primary">note</span>
            Notes App
          </h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul>
            {navItems.map(item => (
              <li key={item.id} className="mb-1">
                <Link href={item.link}>
                  <a className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                    location === item.link 
                      ? 'text-primary bg-blue-50' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-primary'
                  }`}>
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 px-6">
            <CategoryList />
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            onClick={handleNewNote}
            className="w-full flex items-center justify-center"
          >
            <span className="material-icons mr-2">add</span>
            New Note
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
