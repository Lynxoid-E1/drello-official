import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { LogOut, User, Bell, Lock } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

export function Settings({ onLogout, userData }: { onLogout?: () => void; userData?: any }) {
  const [user, setUser] = useState<any>(userData);

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-gray-900 mb-6" style={{ fontSize: '28px' }}>
            Settings
          </h2>

        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[#ff8c42]" />
            <h3 className="text-gray-900" style={{ fontSize: '18px' }}>
              Profile Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue={user?.user_metadata?.name || 'User'}
                className="mt-1"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                className="mt-1"
                disabled
              />
            </div>

            <p className="text-sm text-gray-500">
              Profile editing coming soon. Contact support to update your information.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[#ff8c42]" />
            <h3 className="text-gray-900" style={{ fontSize: '18px' }}>
              Notifications
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates about your contests</p>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-900">Vote Notifications</p>
                <p className="text-sm text-gray-600">Get notified when someone votes</p>
              </div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-[#ff8c42]" />
            <h3 className="text-gray-900" style={{ fontSize: '18px' }}>
              Security
            </h3>
          </div>

          <Button variant="outline" className="w-full" disabled>
            Change Password
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Password management coming soon
          </p>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-gray-900 mb-4" style={{ fontSize: '18px' }}>
            Account Actions
          </h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to sign out?')) {
                  if (onLogout) onLogout();
                  else {
                    localStorage.removeItem('access_token');
                    window.location.reload();
                  }
                }
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-red-600 mb-4" style={{ fontSize: '18px' }}>
            Danger Zone
          </h3>

          <Button
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-100"
            disabled
          >
            Delete Account
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Account deletion is permanently disabled for demo version.
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 pb-4">
          <p>Need help? Contact us at{' '}
            <a href="mailto:ayodelee87@gmail.com" className="text-[#ff8c42] hover:underline">
              ayodelee87@gmail.com
            </a>
          </p>
          <p className="mt-2">
            Visit{' '}
            <a href="https://drellocarrer.netlify.app" target="_blank" rel="noopener noreferrer" className="text-[#ff8c42] hover:underline">
              Drello Career
            </a>
            {' '}•{' '}
            <a href="https://tyorang.netlify.app" target="_blank" rel="noopener noreferrer" className="text-[#ff8c42] hover:underline">
              Tyora
            </a>
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
