'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: string;
  question: string;
  status: 'pending' | 'approved' | 'answered' | 'dismissed';
  upvotes: number;
  isAnonymous: boolean;
  answer?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  answeredBy?: {
    name: string;
  };
}

interface QAPanelProps {
  streamId: string;
  userId: string;
  isHost?: boolean;
}

export default function QAPanel({ streamId, userId, isHost = false }: QAPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sortBy, setSortBy] = useState<'upvotes' | 'createdAt'>('upvotes');
  const [filter, setFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [upvotedQuestions, setUpvotedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 10000);
    return () => clearInterval(interval);
  }, [streamId, sortBy, filter]);

  const fetchQuestions = async () => {
    try {
      let url = `/api/v1/streams/${streamId}/qa/questions?sortBy=${sortBy}`;
      if (filter !== 'all') url += `&status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      await fetch(`/api/v1/streams/${streamId}/qa/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion.trim(),
          isAnonymous,
        }),
      });
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      console.error('Failed to submit question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const upvoteQuestion = async (questionId: string) => {
    if (upvotedQuestions.has(questionId)) return;

    try {
      await fetch(`/api/v1/streams/${streamId}/qa/questions/${questionId}/upvote`, {
        method: 'POST',
      });
      setUpvotedQuestions((prev) => new Set(prev).add(questionId));
      fetchQuestions();
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Q&A</h3>

        {/* Submit question */}
        <div className="space-y-2">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              Ask anonymously
            </label>
            <button
              onClick={submitQuestion}
              disabled={!newQuestion.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-3 border-b bg-gray-50">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'upvotes' | 'createdAt')}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="upvotes">Top voted</option>
          <option value="createdAt">Most recent</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="all">All questions</option>
          <option value="approved">Approved</option>
          <option value="answered">Answered</option>
        </select>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {questions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`border rounded-lg p-3 ${
                q.status === 'answered' ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <div className="flex gap-3">
                {/* Upvote button */}
                <button
                  onClick={() => upvoteQuestion(q.id)}
                  disabled={upvotedQuestions.has(q.id)}
                  className={`flex flex-col items-center px-2 py-1 rounded ${
                    upvotedQuestions.has(q.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-sm font-medium">{q.upvotes}</span>
                </button>

                {/* Question content */}
                <div className="flex-1">
                  <p className="text-sm">{q.question}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{q.isAnonymous ? 'Anonymous' : q.user.name}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(q.createdAt)}</span>
                    {q.status === 'answered' && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">Answered</span>
                      </>
                    )}
                  </div>

                  {/* Answer */}
                  {q.answer && (
                    <div className="mt-3 pl-3 border-l-2 border-green-500">
                      <p className="text-sm text-gray-700">{q.answer}</p>
                      {q.answeredBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          — {q.answeredBy.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
