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
    <aside className="w-72 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block transition-all duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        <div className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <span className="material-icons mr-2.5 text-blue-600 dark:text-blue-400">note_alt</span>
            Notes App
          </h1>
        </div>
        
        <nav className="flex-1 py-5 overflow-y-auto">
          <ul className="space-y-1.5 px-3">
            {navItems.map(item => (
              <li key={item.id}>
                <Link href={item.link}>
                  <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    location === item.link 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                  }`}>
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 px-5">
            <CategoryList />
          </div>
        </nav>
        
        {/* New Note button moved to header */}
      </div>
    </aside>
  );
};

export default Sidebar;
