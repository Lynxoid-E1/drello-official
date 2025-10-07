import { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  description: string;
  totalVotes: number;
  createdAt: string;
  isPaid: boolean;
  votePrice: number;
  status: string;
}

interface HistoryProps {
  searchQuery: string;
}

export function History({ searchQuery }: HistoryProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await apiCall('/contests');
      setContests(data.contests || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredContests = contests.filter(contest => {
    // Filter by status
    if (filter !== 'all' && contest.status !== filter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contest.title.toLowerCase().includes(query) ||
        contest.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const totalVotes = contests.reduce((sum, c) => sum + c.totalVotes, 0);
  const totalRevenue = contests
    .filter(c => c.isPaid)
    .reduce((sum, c) => sum + (c.totalVotes * c.votePrice), 0);

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
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-gray-900 mb-6" style={{ fontSize: '28px' }}>
          Contest History
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Contests</span>
              <Calendar className="w-5 h-5 text-[#ff8c42]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: '32px' }}>
              {contests.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Votes</span>
              <TrendingUp className="w-5 h-5 text-[#ff8c42]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: '32px' }}>
              {totalVotes.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-[#ff8c42]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: '32px' }}>
              ${totalRevenue.toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === f
                  ? 'bg-[#ff8c42] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Contest List */}
        {filteredContests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No contests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1" style={{ fontSize: '18px' }}>
                      {contest.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{contest.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    contest.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {contest.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Votes</span>
                    <p className="text-gray-900">{contest.totalVotes}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created</span>
                    <p className="text-gray-900">
                      {new Date(contest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {contest.isPaid && (
                    <div>
                      <span className="text-gray-600">Revenue</span>
                      <p className="text-gray-900">
                        ${(contest.totalVotes * contest.votePrice).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
