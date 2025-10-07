import { useState } from 'react';
import { LayoutGrid, Plus, Clock, Wallet, Settings, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData?: any;
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, userData }: SidebarProps) {
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  
  const getUserInitials = () => {
    if (userData?.user_metadata?.name) {
      const names = userData.user_metadata.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
    }
    if (userData?.email) {
      return userData.email.substring(0, 2).toUpperCase();
    }
    return 'DR';
  };

  const getUserName = () => {
    return userData?.user_metadata?.name || userData?.email?.split('@')[0] || 'Drello User';
  };
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, shortcut: '⌘D' },
    { id: 'create', label: 'Create Contest', icon: Plus, shortcut: '⌘N' },
    { id: 'history', label: 'History', icon: Clock, shortcut: '⌘H' },
    { id: 'drello-pay', label: 'Drello Pay', icon: Wallet, shortcut: '' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '' },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-16 md:w-20' : 'w-64'} fixed md:relative z-40 h-screen`}>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-[#ff8c42] italic" style={{ fontSize: '28px', fontWeight: 'bold' }}>
            Drello
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <div className="w-6 h-6 bg-[#ff8c42] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#ff8c42] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Pro Card */}
      {!collapsed && (
        <div className="m-4 mb-3 bg-gradient-to-br from-[#ff8c42] to-[#ff9d5c] rounded-2xl p-5 text-white">
          <h3 className="italic mb-2" style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Drello <span className="opacity-90">pro</span>
          </h3>
          <p className="text-sm opacity-90 mb-3">
            Use default template, custom domain and gain access to API.
          </p>
          <Button 
            onClick={() => {
              toast.error("Can't upgrade now. System under maintenance", {
                description: "We're working hard to bring you the Pro features. Check back soon!",
                duration: 5000,
              });
            }}
            variant="secondary" 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Upgrade Pro
          </Button>
        </div>
      )}

      {/* User Profile */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={`border-t border-gray-200 p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff8c42] to-[#ff9d5c] flex items-center justify-center text-white shadow-md">
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {getUserInitials()}
          </span>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1">
              <p className="text-gray-900 truncate" style={{ fontSize: '14px', fontWeight: '500' }}>
                {getUserName()}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {userData?.email || 'drello@user.com'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </>
        )}
      </motion.div>
    </div>
  );
}
