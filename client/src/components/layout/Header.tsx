import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setSearchQuery, setViewMode } from '@/redux/notesSlice';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { openNoteModal } from '@/redux/notesSlice';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { searchQuery, viewMode } = useSelector((state: RootState) => state.notes);
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
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
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center px-6 h-full">
        <div className="flex items-center">
          <Button 
            id="sidebar-toggle" 
            variant="ghost" 
            size="icon" 
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none md:hidden"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 ml-2 md:ml-0">
            {location === '/' ? 'All Notes' : 'Archived Notes'}
          </h2>
          
          {/* Only show New Note button on the main page, not on archived page */}
          {location === '/' && (
            <Button 
              onClick={() => dispatch(openNoteModal(false))}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow flex items-center"
              size="sm"
            >
              <span className="material-icons text-sm mr-1.5">add</span>
              New Note
            </Button>
          )}
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
        
        {/* View Toggle and User Menu */}
        <div className="flex items-center">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
            <button 
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => dispatch(setViewMode('grid'))}
              title="Grid view"
            >
              <span className="material-icons text-sm">grid_view</span>
            </button>
            <button 
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => dispatch(setViewMode('list'))}
              title="List view"
            >
              <span className="material-icons text-sm">view_list</span>
            </button>
          </div>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                  <span className="material-icons text-sm">person</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b">
                  {user?.username || 'User'}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                  <span className="material-icons text-sm mr-2">logout</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/login')}
                className="text-sm"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation('/register')}
                className="text-sm"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
