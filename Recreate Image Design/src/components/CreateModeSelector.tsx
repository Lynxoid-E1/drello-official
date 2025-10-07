import { motion } from 'motion/react';
import { Sparkles, Edit3, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';

interface CreateModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'ai' | 'manual') => void;
}

export function CreateModeSelector({ isOpen, onClose, onSelectMode }: CreateModeSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#fff5eb] to-[#fffbf5] p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-gray-900 mb-3" style={{ fontSize: '36px', fontWeight: 'bold' }}>
              How would you like to create your contest?
            </h2>
            <p className="text-gray-600 text-lg">
              Choose your preferred method to build an amazing voting experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Mode - Locked */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm shadow-lg flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  <span>Coming Soon</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border-4 border-purple-200 relative overflow-hidden opacity-75">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-gray-900 mb-3 text-center" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    Drello AI Assistant
                  </h3>
                  
                  <p className="text-gray-600 text-center mb-6">
                    Let our AI create a professional contest for you in seconds. Just answer a few questions!
                  </p>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-500 mt-1">✨</span>
                      <span>Automated contestant setup</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-500 mt-1">✨</span>
                      <span>Smart theme suggestions</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-500 mt-1">✨</span>
                      <span>AI-powered descriptions</span>
                    </li>
                  </ul>

                  <Button
                    disabled
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 cursor-not-allowed opacity-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock with Drello Pro
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Manual Mode */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-8 border-4 border-[#ff8c42] hover:shadow-xl transition-shadow cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#ff9d5c] flex items-center justify-center mb-4 mx-auto">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-gray-900 mb-3 text-center" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  Manual Creation
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Full control over every aspect of your voting contest. Perfect for custom needs.
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#ff8c42] mt-1">✓</span>
                    <span>Complete customization</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#ff8c42] mt-1">✓</span>
                    <span>Live preview browser</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#ff8c42] mt-1">✓</span>
                    <span>Advanced settings</span>
                  </li>
                </ul>

                <Button
                  onClick={() => onSelectMode('manual')}
                  className="w-full bg-gradient-to-r from-[#ff8c42] to-[#ff9d5c] hover:from-[#ff7d33] hover:to-[#ff8c42] text-white py-6"
                >
                  Start Creating
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Not sure? You can always switch methods later.{' '}
              <a href="mailto:ayodelee87@gmail.com" className="text-[#ff8c42] hover:underline">
                Need help?
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
