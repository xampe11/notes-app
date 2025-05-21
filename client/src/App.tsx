import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./redux/store";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import AllNotes from "./pages/AllNotes";
import ArchivedNotes from "./pages/ArchivedNotes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NoteModal from "./components/modals/NoteModal";
import DeleteModal from "./components/modals/DeleteModal";
import CategoryModal from "./components/modals/CategoryModal";

// Authenticated app layout - shows sidebar, header, and protected routes
function AuthenticatedLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Switch>
            <Route path="/" component={AllNotes} />
            <Route path="/archived" component={ArchivedNotes} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      
      {/* Modals */}
      <NoteModal />
      <DeleteModal />
      <CategoryModal />
    </div>
  );
}

// Main router component that handles authentication state
function AppRouter() {
  const [location] = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Check if current route is auth route (login or register)
  const isAuthRoute = location === '/login' || location === '/register';
  
  // If not authenticated and not on auth route, redirect to login
  if (!isAuthenticated && !isAuthRoute) {
    return <Login />;
  }
  
  // If on auth route, show only login/register
  if (isAuthRoute) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
  
  // If authenticated, show full app layout
  return <AuthenticatedLayout />;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;