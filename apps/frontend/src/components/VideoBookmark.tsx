'use client';

import { useState, useEffect } from 'react';

interface VideoBookmarkProps {
  videoId: string;
  videoTitle: string;
  currentTime?: number;
}

export default function VideoBookmark({
  videoId,
  videoTitle,
  currentTime = 0,
}: VideoBookmarkProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [note, setNote] = useState('');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    checkBookmarkStatus();
    fetchCollections();
  }, [videoId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/v1/bookmarks/${videoId}/status`);
      const data = await response.json();
      setIsBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/v1/bookmarks/collections');
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await fetch(`/api/v1/bookmarks/${videoId}`, { method: 'DELETE' });
        setIsBookmarked(false);
      } else {
        setShowMenu(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const saveBookmark = async () => {
    try {
      await fetch('/api/v1/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          note,
          timestampSeconds: Math.floor(currentTime),
          collection: collection || undefined,
        }),
      });
      setIsBookmarked(true);
      setShowMenu(false);
      setNote('');
      setCollection('');
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
  };

  if (loading) {
    return (
      <button className="p-2 rounded-full bg-gray-100 animate-pulse" disabled>
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleBookmark}
        className={`p-2 rounded-full transition-colors ${
          isBookmarked
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <svg
          className="w-5 h-5"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border p-4 z-50">
          <h3 className="font-medium mb-3">Add to Bookmarks</h3>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full border rounded-md p-2 text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">No collection</option>
              {collections.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__new__">+ Create new collection</option>
            </select>
            {collection === '__new__' && (
              <input
                type="text"
                placeholder="Collection name"
                className="w-full border rounded-md p-2 text-sm mt-2"
                onChange={(e) => setCollection(e.target.value)}
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowMenu(false)}
              className="flex-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveBookmark}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
