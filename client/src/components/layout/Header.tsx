import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setSearchQuery } from '@/redux/notesSlice';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { openNoteModal } from '@/redux/notesSlice';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.notes.searchQuery);
  const [location] = useLocation();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const sidebarToggle = document.getElementById('sidebar-toggle');
      
      if (
        isSidebarOpen && 
        sidebar && 
        !sidebar.contains(event.target as Node) && 
        sidebarToggle && 
        !sidebarToggle.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <Button 
            id="sidebar-toggle" 
            variant="ghost" 
            size="icon" 
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none md:hidden"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 ml-2 md:ml-0">
            {location === '/' ? 'All Notes' : 'Archived Notes'}
          </h2>
        </div>
        
        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside 
              id="sidebar" 
              className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="material-icons mr-2 text-primary">note</span>
                    Notes App
                  </h1>
                </div>
                
                <nav className="flex-1 py-4 overflow-y-auto">
                  <ul>
                    <li className="mb-1">
                      <a 
                        href="/" 
                        className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                          location === '/' 
                            ? 'text-primary bg-blue-50' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-primary'
                        }`}
                        onClick={(e) => {
                          if (location === '/') {
                            e.preventDefault();
                            setIsSidebarOpen(false);
                          }
                        }}
                      >
                        <span className="material-icons mr-3">description</span>
                        <span>All Notes</span>
                      </a>
                    </li>
                    <li className="mb-1">
                      <a 
                        href="/archived" 
                        className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                          location === '/archived' 
                            ? 'text-primary bg-blue-50' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-primary'
                        }`}
                        onClick={(e) => {
                          if (location === '/archived') {
                            e.preventDefault();
                            setIsSidebarOpen(false);
                          }
                        }}
                      >
                        <span className="material-icons mr-3">archive</span>
                        <span>Archived</span>
                      </a>
                    </li>
                  </ul>
                </nav>
                
                <div className="p-4 border-t border-gray-200">
                  <Button 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      dispatch(openNoteModal(false));
                    }}
                    className="w-full flex items-center justify-center"
                  >
                    <span className="material-icons mr-2">add</span>
                    New Note
                  </Button>
                </div>
              </div>
            </aside>
          </>
        )}
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
            <Input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
        
        {/* View Toggle and User Button - For future implementation */}
        <div className="flex items-center">
          <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
            <button className="p-1.5 text-primary bg-white rounded">
              <span className="material-icons text-sm">grid_view</span>
            </button>
            <button className="p-1.5 text-gray-500 hover:text-primary rounded">
              <span className="material-icons text-sm">view_list</span>
            </button>
          </div>
          
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
            <span className="material-icons text-sm">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
