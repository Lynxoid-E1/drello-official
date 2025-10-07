import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { Mail, Lock, User, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AuthProps {
  onAuthSuccess: (token: string, userData: any) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            }
          }
        });

        if (error) throw error;
        
        if (data.session?.access_token) {
          onAuthSuccess(data.session.access_token, data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.session?.access_token) {
          onAuthSuccess(data.session.access_token, data.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(`${provider} sign-in is not configured yet. Please contact support at ayodelee87@gmail.com`);
      console.error('Social auth error:', err);
    }
  };

  // Animated dotted background
  const dots = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff5eb] to-[#fffbf5]">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="grid grid-cols-4 gap-4 rotate-12 opacity-30"
          animate={{
            rotate: [12, 18, 12],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {dots.map((i) => (
            <motion.div
              key={i}
              className="w-16 h-16 bg-[#ff8c42] rounded-lg"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Notification Banner */}
      {showNotification && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-6 right-6 bg-[#ff8c42] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50"
        >
          <span className="italic" style={{ fontSize: '16px' }}>Notification</span>
          <button
            onClick={() => setShowNotification(false)}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
        >
          {/* Left Side - Auth Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:flex-1 bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-[#ff8c42]/20"
          >
            <h2 className="text-gray-900 mb-8 italic" style={{ fontSize: '36px', fontWeight: 'bold' }}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </h2>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              {isSignUp && (
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 py-6 rounded-2xl border-gray-300"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="E-mail:"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 py-6 rounded-2xl border-gray-300"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password:"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 py-6 rounded-2xl border-gray-300"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff8c42] hover:bg-[#ff7d33] text-white py-6 rounded-2xl italic text-lg"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  variant="outline"
                  className="py-6 rounded-2xl border-2 hover:border-[#ff8c42] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  onClick={() => handleSocialAuth('facebook')}
                  variant="outline"
                  className="py-6 rounded-2xl border-2 hover:border-[#ff8c42] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-gray-600 hover:text-[#ff8c42] transition-colors"
              >
                {isSignUp ? (
                  <span>Already have an account? <span className="italic">Login</span></span>
                ) : (
                  <span className="italic">DON'T HAVE AN ACCOUNT? <span className="text-[#ff8c42]">SIGN UP</span></span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right Side - Welcome Message */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:flex-1 text-center hidden lg:block"
          >
            <h1 className="mb-8" style={{ fontSize: '56px' }}>
              <span className="text-gray-900">Welcome to </span>
              <span className="text-[#ff8c42] italic">Drello</span>
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Create engaging voting contests and manage votes with ease
            </p>

            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1604160886546-e107aecc2517?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdm90aW5nJTIwaWxsdXN0cmF0aW9uJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzU5Nzk2OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Drello Voting" 
                className="w-80 h-80 object-cover rounded-3xl shadow-2xl opacity-90"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-500 z-10">
        <p>
          Powered by{' '}
          <a href="https://tyorang.netlify.app" target="_blank" rel="noopener noreferrer" className="text-[#ff8c42] hover:underline">
            Tyora
          </a>
          {' '}| Need help? Contact us at{' '}
          <a href="mailto:ayodelee87@gmail.com" className="text-[#ff8c42] hover:underline">
            ayodelee87@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
