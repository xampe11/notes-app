import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import AllNotes from "./pages/AllNotes";
import ArchivedNotes from "./pages/ArchivedNotes";
import NoteModal from "./components/modals/NoteModal";
import DeleteModal from "./components/modals/DeleteModal";

function Router() {
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
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
