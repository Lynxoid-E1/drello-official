import { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import { Plus, X, BarChart3, Users, Eye, Trash2, Copy, ExternalLink, Filter, FileText, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Contest {
  id: string;
  title: string;
  description: string;
  urlSlug: string;
  status: string;
  totalVotes: number;
  createdAt: string;
  isPaid: boolean;
  votePrice: number;
}

interface Draft {
  title: string;
  type: string;
  contestants: any[];
  lastModified: string;
}

interface DashboardProps {
  searchQuery: string;
  onCreateClick?: () => void;
}

export function Dashboard({ searchQuery, onCreateClick }: DashboardProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadContests();
    loadDraft();
  }, []);

  async function loadContests() {
    try {
      const data = await apiCall('/contests');
      setContests(data.contests || []);
    } catch (error) {
      console.error('Failed to load contests:', error);
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  }

  function loadDraft() {
    const draftData = localStorage.getItem('drello_contest_draft');
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData);
        if (parsed.title || parsed.contestants?.length > 0) {
          setDraft(parsed);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }

  async function deleteContest(id: string) {
    if (!confirm('Are you sure you want to delete this contest?')) return;

    try {
      await apiCall(`/contests/${id}`, { method: 'DELETE' });
      setContests(contests.filter(c => c.id !== id));
      toast.success('Contest deleted');
    } catch (error) {
      console.error('Failed to delete contest:', error);
      toast.error('Failed to delete contest');
    }
  }

  function deleteDraft() {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    localStorage.removeItem('drello_contest_draft');
    setDraft(null);
    toast.success('Draft deleted');
  }

  function continueDraft() {
    onCreateClick?.();
  }

  function copyLink(urlSlug: string) {
    const url = `${window.location.origin}/vote/${urlSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contest.status === filterStatus;
    const matchesType = filterType === 'all' || 
      (filterType === 'paid' && contest.isPaid) || 
      (filterType === 'free' && !contest.isPaid);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-[#ff8c42] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <main className="flex-1 bg-[#f5f4f0] relative overflow-auto">
      <div className="p-4 md:p-8">
        <AnimatePresence>
          {showWelcome && contests.length === 0 && !draft && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-[#ff8c42] text-white px-4 md:px-6 py-3 rounded-lg flex items-center justify-between shadow-lg"
            >
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Welcome back! Start by creating your first contest.</span>
              <button
                onClick={() => setShowWelcome(false)}
                className="hover:bg-white/20 rounded p-0.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {contests.length === 0 && !draft ? (
          <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <button
                onClick={onCreateClick}
                className="w-20 h-20 rounded-full bg-[#ff8c42] hover:bg-[#ff7d33] flex items-center justify-center transition-all hover:scale-105 shadow-lg mb-4 cursor-pointer"
              >
                <Plus className="w-10 h-10 text-white" strokeWidth={2.5} />
              </button>
            </motion.div>
            
            <p className="text-gray-600 mb-1" style={{ fontSize: '16px' }}>
              Nothing Here
            </p>
            <p className="text-gray-700 mb-8" style={{ fontSize: '16px' }}>
              Create Your First Contest
            </p>

            <div className="mt-12 text-center">
              <p className="text-gray-400 tracking-wider" style={{ fontSize: '14px', letterSpacing: '0.1em' }}>
                Manage Your Contest And Track Votes
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Header with Filters */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-gray-900 mb-1" style={{ fontSize: '24px' }}>
                  Your Contests
                </h2>
                <p className="text-gray-600">
                  {filteredContests.length} {filteredContests.length === 1 ? 'contest' : 'contests'} 
                  {draft && ' • 1 draft'}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[140px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[140px] bg-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Draft Card */}
            {draft && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-sm p-6 mb-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-yellow-600" />
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Draft
                      </Badge>
                    </div>
                    <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px' }}>
                      {draft.title || 'Untitled Contest'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {draft.contestants?.length || 0} contestants • {draft.type || 'No type selected'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last modified: {new Date(draft.lastModified || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={continueDraft}
                      size="sm"
                      className="bg-[#ff8c42] hover:bg-[#ff7d33] text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Continue
                    </Button>
                    <Button
                      onClick={deleteDraft}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence>
                {filteredContests.map((contest, index) => (
                  <motion.div
                    key={contest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-gray-900 flex-1 pr-2" style={{ fontSize: '18px' }}>
                        {contest.title}
                      </h3>
                      <Badge 
                        variant={contest.status === 'active' ? 'default' : 'secondary'}
                        className={contest.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {contest.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {contest.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">{contest.totalVotes} votes</span>
                      </div>
                      {contest.isPaid && (
                        <div className="flex items-center gap-2 text-[#ff8c42]">
                          <span className="text-sm">${contest.votePrice}/vote</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyLink(contest.urlSlug)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/vote/${contest.urlSlug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteContest(contest.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredContests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No contests match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}