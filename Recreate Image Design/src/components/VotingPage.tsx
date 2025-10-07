import { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Trophy, Heart, Play, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Contestant {
  id: string;
  name: string;
  description: string;
  mediaUrls: string[];
  votes: number;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  isPaid: boolean;
  votePrice: number;
  paymentLink: string;
  customization: {
    bgColor: string;
    primaryColor: string;
    fontFamily: string;
    textColor: string;
  };
  totalVotes: number;
  status: string;
}

interface VotingPageProps {
  urlSlug: string;
}

export function VotingPage({ urlSlug }: VotingPageProps) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<string | null>(null);

  useEffect(() => {
    loadContest();
  }, [urlSlug]);

  async function loadContest() {
    try {
      const data = await apiCall(`/contests/${urlSlug}`);
      setContest(data.contest);
      setContestants(data.contestants || []);
    } catch (error) {
      console.error('Failed to load contest:', error);
      toast.error('Contest not found');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(contestantId: string) {
    if (!contest) return;

    if (contest.isPaid) {
      // Show payment dialog for paid contests
      setSelectedContestant(contestantId);
      setShowPayment(true);
      return;
    }

    // Free voting
    await submitVote(contestantId);
  }

  async function submitVote(contestantId: string) {
    setVoting(true);
    try {
      const data = await apiCall(`/contests/${contest?.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ contestantId }),
      });

      // Update local state
      setContestants(prev =>
        prev.map(c =>
          c.id === contestantId ? { ...c, votes: data.votes } : c
        )
      );

      if (contest) {
        setContest({
          ...contest,
          totalVotes: contest.totalVotes + 1,
        });
      }

      toast.success('Vote recorded! 🎉');
      setShowPayment(false);
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to record vote');
    } finally {
      setVoting(false);
    }
  }

  function getMediaType(url: string): 'image' | 'video' | 'audio' | 'unknown' {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    return 'unknown';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#ff8c42] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4" style={{ fontSize: '18px' }}>
            Contest not found
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const customization = contest.customization || {
    bgColor: '#ffffff',
    primaryColor: '#ff8c42',
    fontFamily: 'Inter',
    textColor: '#000000',
  };

  // Sort contestants by votes (highest first)
  const sortedContestants = [...contestants].sort((a, b) => b.votes - a.votes);

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: customization.bgColor,
        color: customization.textColor,
        fontFamily: customization.fontFamily,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="mb-4" style={{ fontSize: '48px', fontWeight: 'bold' }}>
            {contest.title}
          </h1>
          {contest.description && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              {contest.description}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-70">
            <span>{contest.totalVotes} total votes</span>
            {contest.isPaid && (
              <span>${contest.votePrice} per vote</span>
            )}
            <span className={`px-3 py-1 rounded-full ${
              contest.status === 'active' 
                ? 'bg-green-500/20 text-green-700'
                : 'bg-gray-500/20'
            }`}>
              {contest.status}
            </span>
          </div>
        </motion.div>

        {/* Contestants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {sortedContestants.map((contestant, index) => (
              <motion.div
                key={contestant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{
                        backgroundColor:
                          index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                      }}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {/* Media Display */}
                {contestant.mediaUrls && contestant.mediaUrls.length > 0 && (
                  <div className="aspect-video bg-gray-100 relative">
                    {getMediaType(contestant.mediaUrls[0]) === 'image' && (
                      <img
                        src={contestant.mediaUrls[0]}
                        alt={contestant.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {getMediaType(contestant.mediaUrls[0]) === 'video' && (
                      <div className="relative w-full h-full">
                        <video
                          src={contestant.mediaUrls[0]}
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      </div>
                    )}
                    {getMediaType(contestant.mediaUrls[0]) === 'audio' && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                        <Volume2 className="w-16 h-16 text-white mb-4" />
                        <audio src={contestant.mediaUrls[0]} controls className="w-4/5" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="mb-2"
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: customization.textColor,
                    }}
                  >
                    {contestant.name}
                  </h3>
                  
                  {contestant.description && (
                    <p
                      className="mb-4 opacity-80"
                      style={{ color: customization.textColor }}
                    >
                      {contestant.description}
                    </p>
                  )}

                  {/* Vote Count */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="flex items-center gap-2"
                      style={{ color: customization.textColor }}
                    >
                      <Heart className="w-5 h-5" />
                      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {contestant.votes}
                      </span>
                      <span className="opacity-70">votes</span>
                    </span>
                  </div>

                  {/* Vote Button */}
                  <Button
                    onClick={() => handleVote(contestant.id)}
                    disabled={voting || contest.status !== 'active'}
                    className="w-full"
                    style={{
                      backgroundColor: customization.primaryColor,
                      color: '#ffffff',
                    }}
                  >
                    {contest.status !== 'active' ? 'Voting Closed' : 'Vote Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment to Vote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                This contest requires a payment of <strong>${contest.votePrice}</strong> per vote.
              </p>
              <p className="text-sm text-gray-600">
                Click the button below to complete your payment via Flutterwave. After payment, return here and click "I've Paid" to record your vote.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.open(contest.paymentLink, '_blank')}
                  className="flex-1"
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  Pay ${contest.votePrice}
                </Button>
                <Button
                  onClick={() => selectedContestant && submitVote(selectedContestant)}
                  disabled={voting}
                  variant="outline"
                  className="flex-1"
                >
                  I've Paid
                </Button>
              </div>
              <Button
                onClick={() => setShowPayment(false)}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-16 text-center opacity-50">
          <p className="text-sm">
            Powered by <span className="italic" style={{ color: customization.primaryColor }}>Drello</span>
          </p>
        </div>
      </div>
    </div>
  );
}
