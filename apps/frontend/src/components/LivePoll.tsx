'use client';

import { useState, useEffect } from 'react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  totalVotes: number;
  allowMultipleVotes: boolean;
  showResults: boolean;
}

interface LivePollProps {
  streamId: string;
  userId: string;
  isHost?: boolean;
}

export default function LivePoll({ streamId, userId, isHost = false }: LivePollProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePoll();
    const interval = setInterval(fetchActivePoll, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [streamId]);

  const fetchActivePoll = async () => {
    try {
      const response = await fetch(`/api/v1/streams/${streamId}/polls/active`);
      if (response.ok) {
        const data = await response.json();
        setPoll(data);
        if (data) {
          checkVoteStatus(data.id);
        }
      } else {
        setPoll(null);
      }
    } catch (error) {
      console.error('Failed to fetch poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async (pollId: string) => {
    try {
      const response = await fetch(`/api/v1/streams/${streamId}/polls/${pollId}/voted`);
      const data = await response.json();
      setVoted(data.voted);
    } catch (error) {
      console.error('Failed to check vote status:', error);
    }
  };

  const submitVote = async () => {
    if (!selectedOption || !poll) return;

    try {
      await fetch(`/api/v1/streams/${streamId}/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption }),
      });
      setVoted(true);
      fetchActivePoll(); // Refresh poll data
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const calculatePercentage = (votes: number) => {
    if (!poll || poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  const showResults = voted || poll.status === 'closed' || poll.showResults;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Poll header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center gap-2 text-sm mb-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h8a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
          </svg>
          Live Poll
          {poll.status === 'active' && (
            <span className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Active
            </span>
          )}
        </div>
        <h3 className="font-semibold">{poll.question}</h3>
      </div>

      {/* Poll options */}
      <div className="p-4 space-y-3">
        {poll.options.map((option) => {
          const percentage = calculatePercentage(option.votes);
          const isSelected = selectedOption === option.id;

          return (
            <div key={option.id} className="relative">
              {showResults ? (
                // Results view
                <div className="relative border rounded-lg p-3 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-purple-100 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-gray-600">
                      {percentage}% ({option.votes})
                    </span>
                  </div>
                </div>
              ) : (
                // Voting view
                <button
                  onClick={() => setSelectedOption(option.id)}
                  disabled={poll.status !== 'active'}
                  className={`w-full border rounded-lg p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'hover:border-gray-300'
                  } ${poll.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-purple-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-purple-600" />
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        {!voted && poll.status === 'active' && (
          <button
            onClick={submitVote}
            disabled={!selectedOption}
            className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Vote
          </button>
        )}
        <p className="text-center text-sm text-gray-500 mt-2">
          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      </div>
    </div>
  );
}
