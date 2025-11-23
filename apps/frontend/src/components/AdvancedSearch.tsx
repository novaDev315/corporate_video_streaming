'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import debounce from 'lodash/debounce';

interface SearchResult {
  type: 'video' | 'transcript' | 'chapter';
  videoId: string;
  video?: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
  };
  match: string;
  timestamp?: number;
  score: number;
}

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [includeTranscripts, setIncludeTranscripts] = useState(true);
  const [includeChapters, setIncludeChapters] = useState(true);
  const [category, setCategory] = useState('');

  const debouncedFetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchSuggestions(query);
  }, [query, debouncedFetchSuggestions]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      const params = new URLSearchParams({
        q: query,
        includeTranscripts: includeTranscripts.toString(),
        includeChapters: includeChapters.toString(),
      });
      if (category) params.append('category', category);

      const response = await fetch(`/api/v1/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'transcript':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
            <path d="M8 7h4v2H8V7zm0 4h4v2H8v-2z" />
          </svg>
        );
      case 'chapter':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search videos, transcripts, and chapters..."
              className="w-full border rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={performSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                  performSearch();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mt-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeTranscripts}
            onChange={(e) => setIncludeTranscripts(e.target.checked)}
            className="rounded"
          />
          Search transcripts
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeChapters}
            onChange={(e) => setIncludeChapters(e.target.checked)}
            className="rounded"
          />
          Search chapters
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">All categories</option>
          <option value="training">Training</option>
          <option value="product">Product</option>
          <option value="marketing">Marketing</option>
          <option value="hr">HR</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                <div className="w-32 h-20 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {results.length} result{results.length === 1 ? '' : 's'} found
            </p>
            {results.map((result, i) => (
              <Link
                key={i}
                href={`/videos/${result.videoId}${result.timestamp ? `?t=${result.timestamp}` : ''}`}
                className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {result.video?.thumbnailUrl && (
                  <img
                    src={result.video.thumbnailUrl}
                    alt=""
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                      result.type === 'video' ? 'bg-blue-100 text-blue-700' :
                      result.type === 'transcript' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {getResultIcon(result.type)}
                      {result.type}
                    </span>
                    {result.timestamp !== undefined && (
                      <span className="text-xs text-gray-500">
                        at {formatTime(result.timestamp)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">
                    {result.video?.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {highlightMatch(result.match, query)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-8 text-gray-500">
            No results found for "{query}"
          </div>
        ) : null}
      </div>
    </div>
  );
}
