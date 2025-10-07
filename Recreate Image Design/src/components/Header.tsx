import { useState } from 'react';
import { Search, Download, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiCall } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ activeTab, searchQuery, setSearchQuery }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'create':
        return 'Create Contest';
      case 'history':
        return 'History';
      case 'drello-pay':
        return 'Drello Pay';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const handleDownloadCSV = async () => {
    try {
      toast.info('Preparing CSV export...');
      const data = await apiCall('/export-csv');
      
      // Create CSV content
      const csv = data.csv;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drello-contests-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const showSearch = activeTab === 'dashboard' || activeTab === 'history';

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between relative">
      <h2 className="text-gray-900 truncate" style={{ fontSize: '18px' }}>{getTitle()}</h2>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-16 w-48 lg:w-64 bg-white border border-gray-200 rounded-lg"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs bg-[#fff5eb] text-[#ff8c42] rounded border border-[#ffd9b3]">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Notification Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg bg-[#ff8c42] flex items-center justify-center hover:bg-[#ff7d33] transition-colors relative"
          >
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </span>
          </button>
          
          <NotificationCenter 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* Download CSV Button */}
        {(activeTab === 'dashboard' || activeTab === 'history') && (
          <Button 
            onClick={handleDownloadCSV}
            className="bg-gray-900 hover:bg-gray-800 text-white gap-2 px-3 md:px-4"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}
      </div>
    </header>
  );
}
