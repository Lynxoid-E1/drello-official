import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreateContestNew } from './components/CreateContestNew';
import { History } from './components/History';
import { DrelloPay } from './components/DrelloPay';
import { Settings } from './components/Settings';
import { VotingPage } from './components/VotingPage';
import { Auth } from './components/Auth';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [route, setRoute] = useState<{ type: 'app' | 'vote'; slug?: string }>({ type: 'app' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        setUserData(session.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAuthSuccess = (token: string, user: any) => {
    localStorage.setItem('access_token', token);
    setUserData(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUserData(null);
  };

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/vote/')) {
      const slug = path.replace('/vote/', '');
      setRoute({ type: 'vote', slug });
    } else {
      setRoute({ type: 'app' });
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/vote/')) {
        const slug = path.replace('/vote/', '');
        setRoute({ type: 'vote', slug });
      } else {
        setRoute({ type: 'app' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Cmd/Ctrl + N for new contest
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('create');
      }
      
      // Cmd/Ctrl + H for history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setActiveTab('history');
      }
      
      // Cmd/Ctrl + D for dashboard
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
      
      // Escape to close search
      if (e.key === 'Escape') {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render voting page if on /vote/:slug route
  if (route.type === 'vote' && route.slug) {
    return (
      <>
        <VotingPage urlSlug={route.slug} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f4f0]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#ff8c42] italic" style={{ fontSize: '24px' }}>Loading Drello...</p>
        </div>
      </div>
    );
  }

  // Show auth if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} onCreateClick={() => setActiveTab('create')} />;
      case 'create':
        return <CreateContestNew onSuccess={() => setActiveTab('dashboard')} />;
      case 'history':
        return <History searchQuery={searchQuery} />;
      case 'drello-pay':
        return <DrelloPay />;
      case 'settings':
        return <Settings onLogout={handleLogout} userData={userData} />;
      default:
        return <Dashboard searchQuery={searchQuery} onCreateClick={() => setActiveTab('create')} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f4f0] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        userData={userData}
      />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0" style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
        <Header 
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
