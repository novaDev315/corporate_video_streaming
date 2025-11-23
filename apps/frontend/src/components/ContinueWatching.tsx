'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface WatchHistoryItem {
  id: string;
  videoId: string;
  watchedSeconds: number;
  totalDuration: number;
  progressPercentage: number;
  lastWatchedAt: string;
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
  };
}

export default function ContinueWatching() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContinueWatching();
  }, []);

  const fetchContinueWatching = async () => {
    try {
      const response = await fetch('/api/v1/watch-history/continue-watching');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch continue watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/videos/${item.videoId}?t=${item.watchedSeconds}`}
            className="group min-w-[280px] flex-shrink-0"
          >
            <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src={item.video.thumbnailUrl || '/placeholder-video.jpg'}
                alt={item.video.title}
                width={280}
                height={158}
                className="object-cover"
              />

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${item.progressPercentage}%` }}
                />
              </div>

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>

              {/* Time remaining */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatTime(item.totalDuration - item.watchedSeconds)} left
              </div>
            </div>

            <div className="mt-2">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                {item.video.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Watched {formatTimeAgo(item.lastWatchedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
